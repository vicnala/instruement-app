"use client";

import React, { useEffect, useState, useRef } from "react"
import { TransactionButton } from "thirdweb/react";
import { transferFrom, ownerOf } from "thirdweb/extensions/erc721";
import { isAddress } from "thirdweb/utils";
import truncateEthAddress from 'truncate-eth-address'
import { useTranslations } from "next-intl";
import { resolveScheme } from "thirdweb/storage";
import { Scanner } from '@yudiel/react-qr-scanner';
import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Section from "@/components/Section";
import { client } from "@/app/client";
import QRModal from "./QRModal";
import Image from "next/image";
import { Download, Copy, QrCode, ChevronDown, Handshake, Telescope, MoveDown, ArrowDownWideNarrow, Hourglass, CheckCheck, Send } from "lucide-react";
import { usePathname, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import Divider from "@/components/UI/Divider";
import ButtonSpinner from '@/components/UI/ButtonSpinner';
import NotConnected from "@/components/NotConnected";
import { useRouter } from "@/i18n/routing";
import { marked } from "marked";

// Configure marked options
marked.use({
	breaks: true
});


// Add these utility functions at the top of the file, outside the component
const generateKeyPair = async () => {
	const keyPair = await window.crypto.subtle.generateKey(
		{
			name: "ECDSA",
			namedCurve: "P-256",
		},
		true,
		["sign", "verify"]
	);

	const privateKey = await window.crypto.subtle.exportKey(
		"jwk",
		keyPair.privateKey
	);

	return { privateKey, publicKey: keyPair.publicKey };
};

const signData = async (privateKeyJwk: JsonWebKey, data: string) => {
	const privateKey = await window.crypto.subtle.importKey(
		"jwk",
		privateKeyJwk,
		{
			name: "ECDSA",
			namedCurve: "P-256",
		},
		true,
		["sign"]
	);

	const signature = await window.crypto.subtle.sign(
		{ name: "ECDSA", hash: "SHA-256" },
		privateKey,
		new TextEncoder().encode(data)
	);

	return Buffer.from(signature).toString('hex');
};

// Add this constant near the top of your component
const COOKIE_EXPIRY_DAYS = 3;

export default function Instrument(
	{ locale, id, to }: Readonly<{ locale: string, id: string, to: string | undefined }>
) {
	const router = useRouter();
	const tInstrument = useTranslations('components.Instrument');
	const [isLoadingInstrumentAsset, setIsLoadingInstrumentAsset] = useState(false)
	const [isLoadingMinter, setIsLoadingMinter] = useState(false)
	const [instrumentAsset, setInstrumentAsset] = useState<any>()
	const [images, setImages] = useState<any[]>([])
	const [documents, setDocuments] = useState<any[]>([])
	const [minter, setMinter] = useState<string>()
	const [minterUser, setMinterUser] = useState<any>()
	const { address, contract, isLoading, setReloadUser } = useStateContext()
	const [isOwner, setIsOwner] = useState<boolean>(false)
	const [copySuccess, setCopySuccess] = useState(false);
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [scannedResult, setScannedResult] = useState<string | undefined>("")
	const [isModalOpen, setModalOpen] = useState(false);

	const [isTransfering, setIsTransfering] = useState(false);
	const [showTransferOptions, setShowTransferOptions] = useState(false);
	const [showInPersonSteps, setShowInPersonSteps] = useState(false);
	const transferSectionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		async function getInstrumentAsset() {
			try {
				const result = await fetch(`/api/token/${id}`)
				const data = await result.json();
				setInstrumentAsset(data);
				// console.log("instrumentAsset.data", data);


				const properties = data.metadata.properties || data.metadata.attributes || [];
				const fileDirHashTrait = properties.find((prop: any) => prop.trait_type === 'Files');
				const registrarTrait = properties.find((prop: any) => prop.trait_type === 'Registrar');

				if (registrarTrait) {
					setMinter(registrarTrait.value);
				}

				if (fileDirHashTrait) {
					const fileDirHash = fileDirHashTrait.value;
					// console.log("fileDirHash", fileDirHash);

					const fileDescriptionsUrl = await resolveScheme({
						client,
						uri: `ipfs://${fileDirHash}/descriptions`
					});
					// console.log("fileDescriptionsUrl", fileDescriptionsUrl);

					const result = await fetch(fileDescriptionsUrl)
					const fileDescriptionsData = await result.json();

					// console.log("fileDescriptionsData", fileDescriptionsData);

					const images: any[] = [];
					const documents: any[] = [];

					for (const fileDescription of fileDescriptionsData) {
						if (fileDescription.cover) continue;

						if (fileDescription.name.includes('image')) {
							const uri = await resolveScheme({
								client,
								uri: `ipfs://${fileDirHash}/${fileDescription.name}`
							});
							if (uri) images.push({ uri, description: fileDescription.description });
						} else if (fileDescription.name.includes('document')) {
							const uri = await resolveScheme({
								client,
								uri: `ipfs://${fileDirHash}/${fileDescription.name}`
							});
							if (uri) documents.push({ uri, description: fileDescription.description });
						}
					}

					// console.log("images", images);
					// console.log("documents", documents);

					setImages(images);
					setDocuments(documents);
				}

			} catch (error) {
				console.error(`/api/token/${id}`, error)
			}
			setIsLoadingInstrumentAsset(false)
		}

		if (!isLoadingInstrumentAsset && !instrumentAsset) {
			if (id) {
				setIsLoadingInstrumentAsset(true)
				getInstrumentAsset().catch((e) => {
					console.error(`/api/token/${id}`, e.message);
				})
			}
		}
	}, [id, isLoadingInstrumentAsset, instrumentAsset])

	useEffect(() => {
		async function getminter() {
			try {
				const result = await fetch(`/api/user/${minter}`)
				const data = await result.json();
				setMinterUser(data);
			} catch (error) {
				console.error(`/api/user/${minter}`, error)
			}
			setIsLoadingMinter(false)
		}

		if (minter && !isLoadingMinter && !minterUser) {
			setIsLoadingMinter(true)
			getminter().catch((e) => {
				console.error(`/api/user/${minter}`, e.message);
			})
		}

	}, [minter])

	useEffect(() => {
		async function getOwner() {
			const owner = await ownerOf({ contract, tokenId: BigInt(id) });
			if (owner === address) {
				setIsOwner(true);
			} else {
				setIsOwner(false);
			}
		}

		if (address && contract) {
			getOwner().catch((e) => {
				console.error(`getOwner`, e.message);
			})
		}
	}, [address, contract])

	// Update the cookie functions
	const getOrCreatePrivateKey = async () => {
		const existingKey = Cookies.get('instrument_private_key');
		if (existingKey) return JSON.parse(existingKey);

		const { privateKey } = await generateKeyPair();
		Cookies.set('instrument_private_key', JSON.stringify(privateKey), { expires: COOKIE_EXPIRY_DAYS });
		return privateKey;
	};

	const generateNonce = async () => {
		const privateKey = await getOrCreatePrivateKey();
		const timestamp = Date.now().toString();
		const dataToSign = `${id}-${timestamp}`;
		const signature = await signData(privateKey, dataToSign);
		return `${id}.${timestamp}.${signature}`;
	};

	// Update the URL generation functions to be async
	const generateShareableUrl = async () => {
		const baseUrl = window.location.origin;
		const nonce = await generateNonce();
		return `${baseUrl}${pathname}?nonce=${nonce}`;
	};

	// Function to generate response URL (for non-owners)
	const generateResponseUrl = () => {
		// Create a new URLSearchParams object from the current search params
		const params = new URLSearchParams(searchParams.toString());

		// Add the 'to' parameter
		params.set('to', address || '');

		// Construct the base URL without query parameters
		const baseUrl = `${window.location.origin}${pathname}`;

		// Return the complete URL with all parameters
		return `${baseUrl}?${params.toString()}`;
	};

	// Update the copy handler to handle async URL generation
	const handleCopyUrl = async (urlGenerator: () => Promise<string>) => {
		try {
			const url = await urlGenerator();
			await navigator.clipboard.writeText(url);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		} catch (err) {
			console.error('Failed to copy URL:', err);
		}
	};

	useEffect(() => {
		if (showTransferOptions && transferSectionRef.current) {
			transferSectionRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [showTransferOptions]);

	if (isLoading || isLoadingMinter || isLoadingInstrumentAsset) {
		return (
			<Page>
				<div className="flex justify-center items-center h-full">
					<ButtonSpinner />
				</div>
			</Page>
		);
	}

	if (!address) {
		return <NotConnected locale={locale} />;
	}

	return (
		<Page>
			{instrumentAsset && instrumentAsset.metadata ? (
				<>
					{instrumentAsset.owner !== address && (
						<p className='bg-me-50 p-4 rounded-lg border border-me-200 mb-4'>
							<b>{tInstrument('current_owner')}:</b> {truncateEthAddress(instrumentAsset.owner)} ({tInstrument('you_are_not_owner')})
						</p>
					)}
					{/* Copy URL Button for Non-Owner with Nonce */}
					{contract && address && !isOwner && (
						<Section>
							<button
								type="button"
								onClick={() => handleCopyUrl(async () => generateResponseUrl())}
								className="flex items-center gap-2 px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
								aria-label={tInstrument('copy_response_url')}
								disabled={isTransfering}
							>
								<Copy className="w-4 h-4" />
								{copySuccess ? tInstrument('copied') : tInstrument('copy_response_url')}
							</button>
						</Section>
					)}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
						<div className="flex flex-col space-y-8 md:space-y-10">
							{/* Cover Image Section */}
							<div className="rounded-[15px] relative bg-it-100 border border-it-200 shadow-md overflow-hidden">
								<div className="w-full aspect-square bg-white/[.04]">
									<Image
										className="mx-auto"
										src={instrumentAsset.metadata.image}
										width={800}
										height={800}
										alt={`Instrument #${id}`}
									/>
								</div>
							</div>
						</div>

						<div className="space-y-8 md:space-y-10">
							{/* Instrument type and name */}
							<div className="text-it-1000 dark:text-it-50 space-y-2">
								<h2 className='text-3xl font-semibold'>
									{instrumentAsset.metadata.name}
								</h2>
							</div>
							{/* Luthier info */}
							<div className="text-it-1000 dark:text-it-50 space-y-2 border border-gray-200 p-4 rounded-lg">
								<p>{tInstrument('registered_by')}</p>
								<div className="flex flex-col gap-2">
									{minterUser && minterUser.profile_photo && (
										<div className="flex items-center gap-4">
											<div className="w-20 h-20 rounded-full overflow-hidden">
												<Image
													src={minterUser.profile_photo.sizes.thumbnail}
													alt={minterUser.business_name}
													width={100}
													height={100}
													className="w-full h-full object-cover"
												/>
											</div>
											<p className="font-bold text-lg">
												{minterUser.business_name}
											</p>
										</div>
									)}
								</div>
							</div>
							{/* Description */}
							<div className="text-it-1000 dark:text-it-50 space-y-4">
								<h2 className='text-2xl font-semibold'>
									{tInstrument('description')}
								</h2>
								<div
									className="text-base text-it-1000 flex flex-col gap-4"
									dangerouslySetInnerHTML={{ __html: marked.parse(instrumentAsset.metadata.description || '') as string }}
								/>
							</div>
						</div>
					</div>

					<Divider color="bg-gray-50" spacing="lg" />

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
						{/* Images Section */}
						{images && images.length > 0 && (
							<div>
								<h2 className='text-xl font-semibold text-it-1000 dark:text-it-50 mb-4'>{tInstrument('additional_images')}</h2>
								<div className="grid grid-cols-2 gap-2">
									{images.map((img: any, index: number) => (
										<div key={index} className="relative bg-it-100 border border-it-200 rounded-lg overflow-hidden">
											<div className="w-full aspect-square bg-white/[.04]">
												<Image
													src={img.uri}
													alt={`Instrument #${id}`}
													width={400}
													height={400}
													className="object-cover w-full h-full"
												/>
											</div>
											<p className="text-it-1000 p-2 text-sm">
												{img.description || tInstrument('no_description')}
											</p>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Documents Section */}
						<div>
							<h2 className='text-xl font-semibold text-it-1000 dark:text-it-50 mb-4'>
								{tInstrument('documents')}
							</h2>
							{documents && documents.length > 0 ? (
								<div className='flex flex-col gap-2'>
									{documents.map((doc: any, index: number) => (
										<a
											key={`${index}`}
											download={doc.description}
											href={doc.uri}
											target="_blank"
											rel="noreferrer"
											className="w-full flex items-center justify-between p-4 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
										>
											<div className="flex flex-col items-start">
												<h3 className="text-lg font-medium">{doc.description}</h3>
												<p className="text-sm text-gray-500">
													{doc.description || tInstrument('no_description')}
												</p>
											</div>
											<Download className="w-4 h-4" />
										</a>
									))}
								</div>
							) : (
								<p className="text-gray-500">{tInstrument('no_documents_available')}</p>
							)}
						</div>
					</div>

					<Divider color="bg-gray-50" spacing="lg" />

					<div className={`mt-6 space-y-4 ${showTransferOptions ? 'min-h-screen' : ''}`}>
						{/* Transfer Management Section */}
						{isOwner && (
							<div className="mb-12" ref={transferSectionRef}>
								<div>
									<h2 className="text-2xl font-semibold text-we-600 dark:text-it-50 mb-2">
										{tInstrument('transfer_management')}
									</h2>
									<p className="text-it-1000 dark:text-it-50 mb-6">
										{tInstrument('transfer_management_description')}
									</p>
									{/* Show transfer options button, hide if showTransferOptions is true */}
									{!showTransferOptions && (
										<button
											type="button"
											className="inline-flex items-center px-4 py-2 text-sm text-we-1000 dark:text-we-50 bg-transparent border border-we-500 rounded-md hover:bg-we-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-we-500 disabled:opacity-50"
											onClick={() => setShowTransferOptions(!showTransferOptions)}
										>
											{tInstrument('show_transfer_options')}
											<ChevronDown className="w-4 h-4 ml-2" />
										</button>
									)}
								</div>
								{showTransferOptions && (
									<div className="bg-we-50 dark:bg-we-950 rounded-lg p-6 mb-12 text-center">
										<h3 className="text-2xl font-semibold text-we-600 dark:text-it-50 mt-4 mb-8">
											{tInstrument('transfer_options_title')}
										</h3>
										<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-6">
											<div className="flex gap-6">
												<div className="flex flex-col gap-2 text-center">
													<div className="flex flex-col items-center">
														<Handshake className="w-6 h-6" strokeWidth={1.5} />
														<h3 className="text-xl font-semibold text-it-1000 dark:text-it-50">
															{tInstrument('in_person_transfer')}
														</h3>
													</div>
													<p className="text-it-1000 dark:text-it-50 mb-2">
														{tInstrument('in_person_transfer_description')}
													</p>
													<div className="flex flex-col gap-2">
														{!to && (
															<>
																<button
																	type="button"
																	className="inline-flex flex-col items-center m-auto px-4 py-2 text-lg font-medium text-we-600 dark:text-we-50  disabled:opacity-50 w-fit"
																	onClick={() => setShowInPersonSteps(true)}
																	disabled={isTransfering}
																	aria-label={tInstrument('transfer_in_person')}
																>
																	<span>{tInstrument('transfer_in_person')}</span>
																	<ArrowDownWideNarrow className="w-6 h-6" strokeWidth={1.5}/>
																</button>

																{showInPersonSteps && (
																	<div className="mt-4 space-y-6">
																		{/* Step 1 */}
																		<div className="text-center">
																			<p className="text-it-1000 dark:text-it-50 mb-2">
																				{tInstrument('step_1_description')}
																			</p>
																			<button
																				type="button"
																				onClick={() => handleCopyUrl(async () => 'https://app.instruement.com')}
																				className="inline-flex items-center  px-4 py-2 text-xs font-medium text-we-1000 dark:text-we-50 bg-transparent border-[0.1rem] border-we-400 rounded-md hover:bg-we-400 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-we-400 disabled:opacity-50"
																				aria-label={tInstrument('share_app')}
																			>
																				<Copy className="w-4 h-4 mr-2" />
																				{tInstrument('share_app')}
																			</button>
																		</div>

																		<MoveDown className="w-6 h-6 mx-auto text-we-500" strokeWidth={1.5}/>

																		{/* Step 2 */}
																		<div className="text-center">
																			<p className="text-it-1000 dark:text-it-50 mb-2">
																				{tInstrument('step_2_description')}
																			</p>
																			<button
																				type="button"
																				className="inline-flex items-center px-4 py-2 text-xs font-medium text-we-1000 dark:text-we-50 bg-transparent border-[0.1rem] border-we-400 rounded-md hover:bg-we-400 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-we-400 disabled:opacity-50"
																				onClick={() => setModalOpen(true)}
																				aria-label={tInstrument('scan_qr')}
																			>
																				<QrCode className="w-4 h-4 mr-2" />
																				{tInstrument('scan_qr')}
																			</button>
																		</div>

																		{!scannedResult && !to ? (
																			<Hourglass className="w-6 h-6 mx-auto text-we-500" strokeWidth={1.5}/>
																		) : (
																			<MoveDown className="w-6 h-6 mx-auto text-we-500" strokeWidth={1.5}/>
																		)}

																		{/* Step 3 */}
																		<div className="text-center">
																			{!scannedResult && !to ? (
																				<p className="text-we-1000 dark:text-we-50 text-sm">
																					{tInstrument('step_3_waiting_for_scan')}
																				</p>
																			) : (
																				<p className="text-we-1000 dark:text-we-50 mb-2">
																					{tInstrument('recipient_account')} {truncateEthAddress(to || scannedResult || '')}
																				</p>
																			)}
																		</div>
																	</div>
																)}
															</>
														)}
													</div>
												</div>
											</div>
											<div className="flex gap-6">
												<div className="flex flex-col gap-2 text-center">
													<div className="flex flex-col items-center">
														<Telescope className="w-6 h-6" strokeWidth={1.5} />
														<h3 className="text-xl font-semibold text-it-1000 dark:text-it-50">
														{tInstrument('remote_transfer')}
													</h3>
													</div>
													<p className="text-it-1000 dark:text-it-50 mb-2">
														{tInstrument('remote_transfer_description')}
													</p>
													<div className="flex flex-col gap-2">
														<button
															type="button"
															onClick={() => handleCopyUrl(generateShareableUrl)}
															className="inline-flex items-center m-auto px-4 py-2 text-sm font-medium text-we-1000 dark:text-we-50 bg-transparent border-[0.1rem] border-we-400 rounded-md hover:bg-we-400 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-we-400 disabled:opacity-50 w-fit"
															aria-label={tInstrument('copy_secure_link')}
															disabled={isTransfering}
														>
															<Copy className="w-4 h-4 mr-2" />
															{copySuccess ? tInstrument('copied') : `${tInstrument('copy_secure_link')}`}
														</button>
														<p className="text-we-1000 dark:text-we-50 mb-4 text-xs">
															{tInstrument('valid_for')} {COOKIE_EXPIRY_DAYS} {tInstrument('days')}
														</p>
													</div>
												</div>
											</div>
										</div>
										{/* Transaction Button */}
										{contract && address && isOwner && (to || scannedResult) && (
										<div className="my-6 text-center">
											<CheckCheck className="w-6 h-6 mx-auto text-we-500" strokeWidth={1.5}/>
											<h3 className="text-lg font-semibold text-we-1000 dark:text-we-50 my-4">
												{tInstrument('ready_for_transfer')}
											</h3>
											<TransactionButton
												transaction={() => {
													setIsTransfering(true);
													return transferFrom({
														contract: contract,
														from: address,
														to: to ? to : scannedResult ? scannedResult : '',
														tokenId: BigInt(id)
													});
												}}
												onTransactionConfirmed={() => {
													alert(`${tInstrument("transfered_to_success")} ${to ? to : scannedResult ? scannedResult : ''}`);
													setReloadUser(true);
													router.replace('/');
												}}
												onError={(error) => {
													setIsTransfering(false);
													console.error("Transaction error", error);
												}}
												unstyled
												className="px-4 py-2 text-base font-medium transition-colors duration-200 transform bg-transparent border-[0.1rem] border-we-400 rounded-md hover:bg-we-400 text-we-1000 dark:text-we-50 focus:outline-none"
											>
												<div className="flex items-center justify-center gap-2">
													<Send className="w-4 h-4" />
													{tInstrument('send')}
												</div>
											</TransactionButton>
										</div>
										)}
									</div>
								)}
							</div>
						)}
					</div>
				</>
			) : null }
			<QRModal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
				<Scanner
					onScan={(result) => {
						if (result.length) {
							const address = result[0].rawValue || '';
							if (isAddress(address)) {
								setScannedResult(address);
								setModalOpen(false);
							} else {
								if (result[0].format === 'qr_code') {
									const split1 = result[0].rawValue.split(':');
									if (split1.length === 2) {
										const type = split1[0];
										if (type === 'ethereum') {
											const split2 = split1[1].split('@');
											if (split2.length === 2) {
												const address = split2[0];
												if (isAddress(address)) {
													setScannedResult(address);
													setModalOpen(false);
												}
											}
										}
									}
								}
							}
						}
					}}
					onError={(error) => {
						console.error(error);
					}}
					classNames={{
						container: "w-full h-full"
					}}
					styles={{
						container: {
							width: '100%',
							height: '100%'
						}
					}}
				/>
			</QRModal>
		</Page>
	);
}
