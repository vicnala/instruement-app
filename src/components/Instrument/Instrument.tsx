"use client";

import React, { useEffect, useState } from "react"
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
import { Download, Copy } from "lucide-react";
import { usePathname, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import Divider from "@/components/UI/Divider";
import Loading from "../Loading";
import NotConnected from "@/components/NotConnected";
import { useRouter } from "@/i18n/routing";

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

	
	if (isLoading || isLoadingMinter || isLoadingInstrumentAsset) return (
		<Page>
		<div className="text-center">
			<Loading />
		</div>
		</Page>
	)

	return (
		address ? <Page>
			{
				instrumentAsset && instrumentAsset.metadata ?
					<>
						{instrumentAsset.owner !== address && (
							<p className='bg-me-50 p-4 rounded-lg border border-me-200 mb-4'>
								<b>{tInstrument('current_owner')}:</b> {truncateEthAddress(instrumentAsset.owner)} ({tInstrument('you_are_not_owner')})
							</p>
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
									{/* <p className="text-it-1000 p-4">
										{instrumentAsset.cover_image.description || t('no_description')}
									</p> */}
								</div>
							</div>

							<div className="space-y-8 md:space-y-10">
								{/* Instrument type and name */}
								<div className="text-it-1000 dark:text-it-50 space-y-2">
									<p className="text-md">
										{/* Instrument type from instrument  */}
										
									</p>						
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
									<div className='text-lg'>
										<p>{instrumentAsset.metadata.description}</p>
									</div>
								</div>
							</div>
						</div>
						<Divider color="bg-gray-50" spacing="lg" />
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

								{/* Images Section */}
								{
									images && images.length &&
									<div>
										<h2 className='text-xl font-semibold text-it-1000 dark:text-it-50 mb-4'>{tInstrument('additional_images')}</h2>
										<div className="grid grid-cols-2 gap-2">
											{images.map((img: any, index: number) =>
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
											)
											}
										</div>
									</div>
								}

								{/* Documents Section */}
								{
									documents && documents.length ?
									<div>
										<h2 className='text-xl font-semibold text-it-1000 dark:text-it-50 mb-4'>
											{tInstrument('documents')}
										</h2>
										<div className='flex flex-col gap-2'>
											{
												documents.map((doc: any, index: number) =>
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
												)
											}
										</div>
									</div> :
									<div>
										<h2 className='text-xl font-semibold text-it-1000 dark:text-it-50 mb-4'>
											{tInstrument('no_documents_available')}
										</h2>
									</div>
								}

						</div>

						<div className="mt-6 text-center space-y-4">
							{/* Copy URL Button for Owner */}
							{contract && address && isOwner && (
								<Section>
									<button
										type="button"
										onClick={() => handleCopyUrl(generateShareableUrl)}
										className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
										aria-label={tInstrument('copy_url')}
										disabled={isTransfering}
									>
										<Copy className="w-4 h-4" />
										{copySuccess ? tInstrument('copied') : `${tInstrument('copy_url')} (${tInstrument('valid_for')} ${COOKIE_EXPIRY_DAYS} ${tInstrument('days')})`}
									</button>
								</Section>
							)}

							{/* Copy URL Button for Non-Owner with Nonce */}
							{contract && address && !isOwner && searchParams.get('nonce') && (
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

							{/* Scan Button */}
							{
								contract && address && isOwner && !to &&
								<Section>
									<button
										type="button"
										className="items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
										onClick={() => setModalOpen(true)}
										disabled={isTransfering}
									>
										{isModalOpen ? tInstrument('stop') : tInstrument('scan')}
									</button>
								</Section>
							}
							{/* Transaction Button */}
							{
								contract && address && isOwner && (to || scannedResult) &&
								<Section>
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
											alert(`${tInstrument("transfered_to")} ${to ? to : scannedResult ? scannedResult : ''}`);
											setReloadUser(true);
											router.replace('/');
										}}
										onError={(error) => {
											setIsTransfering(false);
											console.error("Transaction error", error);
										}}
										unstyled
										className="items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
									>
										{tInstrument('transfer')} #{id} {tInstrument('to')} {truncateEthAddress(to || scannedResult || '')}
									</TransactionButton>
								</Section>
							}
						</div>
						<QRModal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
							<Scanner
								onScan={(result) => {
									if (result.length) {
										const address = result[0].rawValue || '';
										if (isAddress(address)) {
											setScannedResult(address)
											setModalOpen(false)
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
																setScannedResult(address)
																setModalOpen(false)
															}
														}
													}
												}
											}
										}
									}
								}}
								classNames={{}}
								styles={{}}
							/>
						</QRModal>
					</>
					:
					<></>
			}
		</Page> :
		<NotConnected locale={locale} />
	);
}
