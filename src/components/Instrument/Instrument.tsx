"use client";

import React, { useEffect, useState, useRef } from "react"
import { TransactionButton } from "thirdweb/react";
import { transferFrom, ownerOf } from "thirdweb/extensions/erc721";
import { isAddress } from "thirdweb/utils";
import truncateEthAddress from 'truncate-eth-address'
import { useTranslations } from "next-intl";
// import { resolveScheme } from "thirdweb/storage";
import { Scanner } from '@yudiel/react-qr-scanner';
import Page from "@/components/Page";
import Section from "@/components/Section";
// import { client } from "@/app/client";
import QRModal from "./QRModal";
import Image from "next/image";
import { Download,
	Copy,
	QrCode,
	ChevronDown,
	Handshake,
	Telescope,
	MoveDown,
	ArrowDownWideNarrow,
	Hourglass,
	CheckCheck,
	Send,
	Ban,
	ChevronUp,
	CircleX,
	ExternalLink
} from "lucide-react";
import { usePathname, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import Divider from "@/components/UI/Divider";
import { ButtonLink } from "@/components/UI/ButtonLink";
import { useRouter } from "@/i18n/routing";
import { marked } from "marked";
import { contract } from "@/app/contracts";
import Skeleton from "@/components/Skeleton";

marked.use({
	breaks: true
});

const generateKeyPair = async () => {
	try {
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

		const publicKey = await window.crypto.subtle.exportKey(
			"jwk",
			keyPair.publicKey
		);

		return { privateKey, publicKey };
	} catch (error) {
		console.error('Error generating key pair:', error);
		throw error;
	}
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

// Validate the nonce signature
const validateNonceSignature = async (nonce: string) => {
	try {
		const [id, timestamp, signature] = nonce.split('.');
		const privateKeyJwk = Cookies.get('instrument_private_key');
		
		if (!privateKeyJwk) {
			return false;
		}
		
		try {
			const privateKey = JSON.parse(privateKeyJwk);
			const dataToSign = `${id}-${timestamp}`;
			
			try {
				// Create public key object from private key
				const publicKeyData = {
					kty: privateKey.kty,
					crv: privateKey.crv,
					x: privateKey.x,
					y: privateKey.y
				};

				// Import the public key directly
				const importedPublicKey = await window.crypto.subtle.importKey(
					"jwk",
					publicKeyData,
					{
						name: "ECDSA",
						namedCurve: "P-256",
					},
					true,
					["verify"]
				);
				
				try {
					// Verify the signature using the public key
					const signatureBuffer = Buffer.from(signature, 'hex');
					const isValid = await window.crypto.subtle.verify(
						{ name: "ECDSA", hash: "SHA-256" },
						importedPublicKey,
						signatureBuffer,
						new TextEncoder().encode(dataToSign)
					);
					
					return isValid;
				} catch (verifyError) {
					console.error('Error during signature verification:', verifyError);
					return false;
				}
			} catch (importError) {
				console.error('Error importing public key:', importError);
				return false;
			}
		} catch (parseError) {
			console.error('Error parsing private key from cookie:', parseError);
			return false;
		}
	} catch (error) {
		console.error('Error in validateNonceSignature:', error);
		return false;
	}
};

const COOKIE_EXPIRY_DAYS = 3;

// Check if there's an active validation attempt
const hasActiveValidationAttempt = (searchParams: URLSearchParams) => {
	return searchParams.has('nonce');
};

// Validate the transfer confirmation URL for non-owners
const validateTransferConfirmationUrl = (nonce: string, instrumentId: string) => {
	try {
		const [id, timestamp] = nonce.split('.');
		
		// Check if the ID matches the current instrument
		if (id !== instrumentId) return false;
		
		// Check if the timestamp is within the valid period
		const nonceDate = new Date(parseInt(timestamp));
		const now = new Date();
		const diffDays = (now.getTime() - nonceDate.getTime()) / (1000 * 60 * 60 * 24);
		if (diffDays > COOKIE_EXPIRY_DAYS) return false;
		
		return true;
	} catch (error) {
		console.error('Error validating transfer confirmation URL:', error);
		return false;
	}
};

export default function Instrument({
	id,
	instrumentAsset,
	minter,
	images,
	documents,
	locale,
	to,
	context
}: Readonly<{
	id: string,
	instrumentAsset: any,
	images: any[],
	minter: string,
	documents: any[],
	locale: string,
	to: string | undefined,
	context: any
}>
) {
	const router = useRouter();
	const tInstrument = useTranslations('components.Instrument');
	
	const IMAGES_THRESHOLD_FOR_MORE_COLUMNS = 4;
	
	const [isLoadingMinter, setIsLoadingMinter] = useState(false)
	const [minterUser, setMinterUser] = useState<any>()
	const [isOwner, setIsOwner] = useState<boolean>(false)
	const [copySuccess, setCopySuccess] = useState(false);
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [scannedResult, setScannedResult] = useState<string | undefined>("")
	const [isModalOpen, setModalOpen] = useState(false);

	const [isTransfering, setIsTransfering] = useState(false);
	const [showTransferOptions, setShowTransferOptions] = useState(false);
	const [showInPersonSteps, setShowInPersonSteps] = useState<boolean>(false);
	const [showRemoteSteps, setShowRemoteSteps] = useState<boolean>(false);
	const transferSectionRef = useRef<HTMLDivElement>(null);
	const stepsSectionRef = useRef<HTMLDivElement>(null);
	const sendSectionRef = useRef<HTMLDivElement>(null);
	const [isTransferConfirmationValid, setIsTransferConfirmationValid] = useState<boolean>(false);

	const address = context.sub;
	const isMinter = instrumentAsset.metadata.properties?.some((property: any) => property?.trait_type === "Registrar" && property?.value === address);
	// Add this state for nonce validation
	const [isNonceValid, setIsNonceValid] = useState<boolean>(false);

	// Add state for description collapse/expand
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
	const [isImagesExpanded, setIsImagesExpanded] = useState<boolean>(false);

	// Block explorer URL
	const blockExplorerBaseUrl = process.env.NEXT_PUBLIC_CHAIN_ID === '421614' ? `https://sepolia.arbiscan.io/nft/${contract?.address}` :
		process.env.NEXT_PUBLIC_CHAIN_ID === '1' ? `https://etherscan.io/token/${contract?.address}` :
		``;
	
	const blockExplorerUrl = `${blockExplorerBaseUrl}/${id}`;

	useEffect(() => {
		async function getminter() {
			try {
				const result = await fetch(`/api/user/${minter}`)
				const data = await result.json();
				setIsLoadingMinter(false)
				setMinterUser(data);
			} catch (error) {
				setIsLoadingMinter(false)
				throw error;
			}
		}

		if (minter && !isLoadingMinter && !minterUser) {
			setIsLoadingMinter(true)
			getminter().catch((e) => {
				console.error(`/api/user/${minter}`, e.message);
			})
		}
	}, [minter, isLoadingMinter, minterUser])

	useEffect(() => {
		async function getOwner() {
			const owner = await ownerOf({ contract, tokenId: BigInt(id) });			
			if (owner === address) {
				setIsOwner(true);
			} else {
				setIsOwner(false);
			}
		}

		getOwner().catch((e) => {
			console.error(`getOwner`, e.message);
		})
	}, [address, id])

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

	// Update the generateResponseUrl function preserving the nonce
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

	// Scroll to the transfer options section when the showTransferOptions state changes
	useEffect(() => {
		if (showTransferOptions && transferSectionRef.current) {
			transferSectionRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [showTransferOptions]);

	// Scroll to the showInPersonSteps or showRemoteSteps section when the state changes
	useEffect(() => {
		if ((showInPersonSteps || showRemoteSteps) && stepsSectionRef.current) {
			stepsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [showInPersonSteps, showRemoteSteps]);

	// Scroll to the send section when it becomes visible
	useEffect(() => {
		if ((to || scannedResult) && !hasActiveValidationAttempt(searchParams) && sendSectionRef.current) {
			sendSectionRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [to, scannedResult, searchParams]);

	// Update the effect to validate the transfer confirmation URL
	useEffect(() => {
		const nonce = searchParams.get('nonce');
		if (nonce) {
			setIsTransferConfirmationValid(validateTransferConfirmationUrl(nonce, id));
		} else {
			setIsTransferConfirmationValid(false);
		}
	}, [searchParams, id]);

	// Add this effect to validate the nonce when the component mounts or searchParams changes
	useEffect(() => {
		const validateNonce = async () => {
			const nonce = searchParams.get('nonce');
			if (nonce) {
				const isUrlValid = validateTransferConfirmationUrl(nonce, id);
				const isSignatureValid = await validateNonceSignature(nonce);
				setIsNonceValid(isUrlValid && isSignatureValid);
			} else {
				setIsNonceValid(false);
			}
		};

		validateNonce();
	}, [searchParams, id]);

	return (
		<Page context={context}>
			{instrumentAsset && instrumentAsset.metadata ? (
				<>
					{address && instrumentAsset.owner !== address && !hasActiveValidationAttempt(searchParams) ? 
						<p className='bg-me-50 p-4 rounded-lg border border-me-200 mb-4'>
							<b>{tInstrument('current_owner')}:</b> {truncateEthAddress(instrumentAsset.owner)} ({tInstrument('you_are_not_owner')})
							{" "} (<a className="text-we-500" href={blockExplorerUrl} target="_blank" rel="noreferrer">{tInstrument('link_to_block_explorer')}</a>)
						</p> : address &&
						<p className='bg-me-50 p-4 rounded-lg border border-me-200 mb-4'>
							{tInstrument('you_are_owner')}
							{" "} (<a className="text-we-500" href={blockExplorerUrl} target="_blank" rel="noreferrer">{tInstrument('link_to_block_explorer')}</a>)
						</p>
					}
					{/* Copy URL Button for Non-Owner with Nonce */}
					{address && !isOwner && hasActiveValidationAttempt(searchParams) && (
						<Section>
							<div className="bg-we-50 dark:bg-we-950 rounded-lg p-6 mb-3">
								{isTransferConfirmationValid ? (
									<>
										<p className="flex items-center gap-2 text-we-600 font-bold mb-4">
											<CheckCheck className="w-5 h-5" strokeWidth={1.5} />
											{tInstrument('remote_transfer_link_valid')}
										</p>
										<h1 className="text-2xl font-semibold text-we-1000 dark:text-we-50 mb-2">
											{tInstrument('remote_transfer_confirmation_title')}
										</h1>
										<p className="text-we-1000 dark:text-we-50 mb-6">
											{tInstrument('remote_transfer_confirmation_valid_description')}
										</p>
										<button
											type="button"
											onClick={() => handleCopyUrl(async () => generateResponseUrl())}
											className="flex items-center gap-2 px-4 py-2 text-white bg-we-500 rounded-md hover:bg-we-600 focus:outline-none focus:ring-2 focus:ring-we-500 focus:ring-offset-2"
											aria-label={tInstrument('copy_response_url')}
											disabled={isTransfering}
										>
											<Copy className="w-4 h-4" />
											{copySuccess ? tInstrument('copied') : tInstrument('copy_response_url')}
										</button>
									</>
								) : (
									<>
										<p className="flex items-center gap-2 text-red-600 font-bold mb-4">
											<Ban className="w-5 h-5" strokeWidth={1.5} />
											{tInstrument('remote_transfer_link_invalid')}
										</p>
										<h1 className="text-2xl font-semibold text-we-1000 dark:text-we-50 mb-2">
											{tInstrument('remote_transfer_confirmation_title_invalid')}
										</h1>
										<p className="text-we-1000 dark:text-we-50 mb-6">
											{tInstrument('remote_transfer_confirmation_invalid_description')}
										</p>
									</>
								)}
							</div>
						</Section>
					)}

					{/* Owner's Remote Transfer Interface */}
					{address && isOwner && hasActiveValidationAttempt(searchParams) && (
						<Section>
							<div className="bg-we-50 dark:bg-we-950 rounded-lg p-6 mb-3">
								{isNonceValid ? (
									<>
										<p className="flex items-center gap-2 text-we-600 font-bold mb-4">
											<CheckCheck className="w-5 h-5" strokeWidth={1.5} />
											{tInstrument('remote_transfer_link_valid')}
										</p>
										<h1 className="text-2xl font-semibold text-we-1000 dark:text-we-50 mb-2">
											{tInstrument('remote_transfer_step_3_title')}
										</h1>
										<p className="text-we-1000 dark:text-we-50 mb-6">
											{tInstrument('remote_transfer_step_3_description')}
										</p>
										<TransactionButton
											transaction={() => {
												setIsTransfering(true);
												return transferFrom({
													contract: contract,
													from: address,
													to: to || '',
													tokenId: BigInt(id)
												});
											}}
											onTransactionConfirmed={() => {
												alert(`${tInstrument("transfered_to_success")} ${to || ''}`);
												setIsTransfering(false);
												router.refresh();
												router.push('/');
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
									</>
								) : (
									<>
										<p className="flex items-center gap-2 text-red-600 font-bold mb-4">
											<Ban className="w-5 h-5" strokeWidth={1.5} />
											{tInstrument('remote_transfer_link_invalid')}
										</p>
										<h1 className="text-2xl font-semibold text-we-1000 dark:text-we-50 mb-2">
											{tInstrument('remote_transfer_step_3_invalid_title')}
										</h1>
										<p className="text-we-1000 dark:text-we-50 mb-6">
											{tInstrument('remote_transfer_step_3_invalid_description')}
										</p>
									</>
								)}
							</div>
						</Section>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
						<div className="flex flex-col space-y-8 md:space-y-10">
							{/* Cover Image Section */}
							<div className="rounded-[15px] relative bg-it-100 dark:bg-it-900 shadow-md overflow-hidden">
								<div className="w-full aspect-square bg-white/[.04]">
									<a href={instrumentAsset.metadata.image} target="_blank" rel="noreferrer">
										<Image
											className="mx-auto"
											src={instrumentAsset.metadata.image}
											width={800}
											height={800}
											alt={`Instrument #${id}`}
										/>
									</a>
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
							<div className="text-it-1000 dark:text-it-50 border-[0.1rem] border-gray-200 dark:border-gray-700 p-4 rounded-lg relative overflow-hidden">
								{/* Background watermark */}
								<div 
									className="absolute inset-0 pointer-events-none dark:opacity-10"
									style={{
										backgroundImage: 'url(/images/instruement-watermark.svg)',
										backgroundSize: '130%',
										backgroundPosition: '200% 20%',
										backgroundRepeat: 'no-repeat',
										backgroundColor: 'rgba(116, 102, 90, 0.03)'
									}}
								/>
								{/* Content */}
								<div className="relative z-10">
									<p className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-3">{tInstrument('registered_by')}</p>
									<div className="flex flex-col gap-2">
										{isLoadingMinter ? (
											<div className="flex items-center gap-4">
												<div className="w-30 h-30 rounded-full border border-gray-25 border-[3px] dark:border-gray-700 overflow-hidden flex-shrink-0">
													<Skeleton width="75px" height="75px" />
												</div>
												<div className="flex-1">
													<Skeleton width="60%" height="24px" />
													<div className="mt-2">
														<Skeleton width="40%" height="16px" />
													</div>
												</div>
											</div>
										) : minterUser && minterUser.profile_photo ? (
											<div className="flex items-center gap-4">
												<div className="w-[6rem] h-[6rem] rounded-full border border-gray-100 border-[4px] dark:border-gray-700 overflow-hidden">
													<Image
														src={minterUser.profile_photo.sizes.thumbnail}
														alt={minterUser.business_name}
														width={100}
														height={100}
														className="w-full h-full object-cover"
													/>
												</div>
												<div>
													<p className="font-bold text-lg mb-2">
														{minterUser.business_name}
													</p>
													<p>
														<ButtonLink href={`https://www.instruement.com/?author=${minterUser.user_id}`} size="sm" colorSchema="gray" external={true}>
															{tInstrument('view_profile')} <ExternalLink className="w-3 h-3" />
														</ButtonLink>
													</p>
												</div>
											</div>
										) : null}
									</div>
								</div>
							</div>
							{/* Description */}
							<div className="text-contrast dark:text-it-50 p-4 mb-4 sm:mb-0 rounded-lg bg-gray-25 dark:bg-gray-900 sm:bg-transparent sm:p-0 sm:dark:bg-transparent">
								<div
									role="button"
									tabIndex={0}
									aria-label="Toggle description"
									aria-expanded={isDescriptionExpanded}
									onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
									className="flex items-center justify-between cursor-default outline-none dark:hover:text-it-100 transition-colors"
								>
									<h2 className='text-xl font-semibold'>
										{tInstrument('description')}
									</h2>
									<span className="flex items-center gap-1 text-sm font-medium text-gray-400 dark:text-gray-400 sm:hidden">
										{isDescriptionExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
									</span>
								</div>
								<div className="relative">
									{/* Desktop: Always show full content */}
									<div
										className="hidden md:flex text-base text-it-1000 dark:text-gray-300 flex-col gap-4 pt-6"
										dangerouslySetInnerHTML={{ __html: marked.parse(instrumentAsset.metadata.description || '') as string }}
									/>
									
									{/* Mobile: Collapsible content */}
									<div className="md:hidden">
										<div
											className={`text-base text-gray-800 dark:text-it-100 flex flex-col gap-4 overflow-hidden transition-all duration-300 ${
												isDescriptionExpanded ? 'pt-6 max-h-none' : 'h-0'
											}`}
											dangerouslySetInnerHTML={{ __html: marked.parse(instrumentAsset.metadata.description || '') as string }}
										/>
										
									</div>
								</div>
							</div>
						</div>
					</div>

					<Divider color="bg-transparent" spacing="0" className="h-1 max-h-0 my-0 sm:my-4 sm:h-[4px] mx-0 md:mx-4"/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-6">
						{/* Images Section */}
						{images && images.length > 0 && (
							<div className="p-4 sm:p-0 bg-gray-25 dark:bg-gray-900 sm:bg-transparent sm:dark:bg-transparent rounded-lg">
								<div
									role="button"
									tabIndex={0}
									aria-label={tInstrument('toggle_additional_images')}
									aria-expanded={isImagesExpanded}
									onClick={() => setIsImagesExpanded(!isImagesExpanded)}
									className="flex items-center justify-between cursor-default outline-none dark:hover:text-it-100 transition-colors"
								>
									<h2 className='text-xl font-semibold text-it-1000 dark:text-it-50'>{tInstrument('additional_images')}</h2>
								</div>
								{(() => {
									const imagesCount = images.length;
									const shouldShowOverlay = imagesCount > IMAGES_THRESHOLD_FOR_MORE_COLUMNS && !isImagesExpanded;
									const visibleImagesCount = shouldShowOverlay ? IMAGES_THRESHOLD_FOR_MORE_COLUMNS - 1 : imagesCount;
									const hiddenImagesCount = shouldShowOverlay ? imagesCount - (IMAGES_THRESHOLD_FOR_MORE_COLUMNS - 1) : 0;
									
									return (
										<div className={`grid ${isImagesExpanded ? 'grid-cols-2' : imagesCount > IMAGES_THRESHOLD_FOR_MORE_COLUMNS ? 'grid-cols-4' : 'grid-cols-2'} gap-2 mt-4`}>
											{/* Show visible images normally */}
											{images.slice(0, visibleImagesCount).map((img: any, index: number) => (
												<div key={index} className="relative bg-it-100 border border-it-200 rounded-lg overflow-hidden">
													<div className="w-full aspect-square bg-white/[.04]">
														<a href={img.uri} target="_blank" rel="noreferrer">	
															<Image
																src={img.uri}
																alt={`Instrument #${id}`}
																width={400}
																height={400}
																className="object-cover w-full h-full"
															/>
														</a>
													</div>
													{img.description && 
														<p className="text-it-1000 p-2 text-sm">
															{img.description || tInstrument('no_description')}
														</p>
													}
												</div>
											))}
											
											{/* Show overlay with counter for remaining images */}
											{shouldShowOverlay && (
												<div
													className="relative bg-it-100 border border-it-200 rounded-lg overflow-hidden cursor-pointer"
													onClick={() => setIsImagesExpanded(true)}
													tabIndex={0}
													role="button"
													aria-label={tInstrument('show_all_images')}
													onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setIsImagesExpanded(true); }}
												>
													<div className="w-full aspect-square bg-white/[.04] relative">
														<Image
															src={images[IMAGES_THRESHOLD_FOR_MORE_COLUMNS - 1].uri}
															alt={`Instrument #${id}`}
															width={400}
															height={400}
															className="object-cover w-full h-full"
														/>
														{/* Overlay */}
														<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
															<div className="text-center">
																<div className="text-it-200 text-3xl mb-1">
																	+{hiddenImagesCount}
																</div>
															</div>
														</div>
													</div>
													{images[IMAGES_THRESHOLD_FOR_MORE_COLUMNS - 1].description && 
														<p className="text-it-1000 p-2 text-sm">
															{images[IMAGES_THRESHOLD_FOR_MORE_COLUMNS - 1].description || tInstrument('no_description')}
														</p>
													}
												</div>
											)}

											{/* When expanded, show all images (no overlay) */}
											{isImagesExpanded && images.slice(visibleImagesCount).map((img: any, index: number) => (
												<div key={visibleImagesCount + index} className="relative bg-it-100 border border-it-200 rounded-lg overflow-hidden">
													<div className="w-full aspect-square bg-white/[.04]">
														<a href={img.uri} target="_blank" rel="noreferrer">	
															<Image
																src={img.uri}
																alt={`Instrument #${id}`}
																width={400}
																height={400}
																className="object-cover w-full h-full"
															/>
														</a>
													</div>
													{img.description && 
														<p className="text-it-1000 p-2 text-sm">
															{img.description || tInstrument('no_description')}
														</p>
													}
												</div>
											))}
										</div>
									);
								})()}
							</div>
						)}

						{/* Documents Section */}
						{documents && documents.length > 0 && (
							<div className="p-4 sm:p-0 bg-gray-25 dark:bg-gray-900 sm:dark:bg-transparent sm:bg-transparent rounded-lg">
								<h2 className='text-xl font-semibold text-it-1000 dark:text-it-50 mb-4'>
									{tInstrument('documents')}
								</h2>
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
												{ doc.description && 
													<p className="text-sm text-gray-500">
														{doc.description || tInstrument('no_description')}
													</p>
												}
											</div>
											<Download className="w-4 h-4" />
										</a>
									))}
								</div>
							</div>
						)}
					</div>

					{ isOwner && isMinter &&
					<>
						{ !hasActiveValidationAttempt(searchParams) && <Divider color="bg-we-500" spacing="lg" className="mt-12" /> }
					<div className={`mt-6 space-y-4 ${showTransferOptions ? 'min-h-screen' : ''}`}>
						{/* Transfer Management Section */}
						{!hasActiveValidationAttempt(searchParams) && (
							<div className="mb-12" ref={transferSectionRef}>
								<div>
									<h2 className="text-2xl font-semibold text-we-600 dark:text-we-500 mb-2">
										{tInstrument('transfer_management')}
									</h2>
									<p className="text-it-1000 dark:text-it-50 mb-6">
										{tInstrument('transfer_management_description')}
									</p>
									{/* Show transfer options button, hide if showTransferOptions is true */}
									{!showTransferOptions && (
										<button
											type="button"
											className="inline-flex items-center px-4 py-2 text-sm text-we-1000 dark:text-we-50 bg-transparent border-[0.1rem] border-we-500 rounded-md hover:bg-we-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-we-500 disabled:opacity-50"
											onClick={() => setShowTransferOptions(!showTransferOptions)}
										>
											{tInstrument('show_transfer_options')}
											<ChevronDown className="w-4 h-4 ml-2" />
										</button>
									)}
								</div>
								{showTransferOptions && (
								<>
									<div className="bg-we-50 dark:bg-we-1000 rounded-lg p-6 mb-2 text-center">
										<h3 className="text-xl font-semibold text-we-600 dark:text-we-500 mt-4 mb-12 sm:mb-8">
											{tInstrument('transfer_options_title')}
										</h3>
										<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-x-6 gap-y-16">
											<div className="flex gap-6">
												<div className="flex flex-col gap-2 text-center">
													<div className="flex flex-col items-center text-we-500">
														<Handshake className="w-8 h-8" strokeWidth={1.5} />
														<h3 className="text-2xl font-semibold text-it-1000 dark:text-it-50">
															{tInstrument('in_person_transfer')}
														</h3>
													</div>
													<p className="text-it-1000 dark:text-it-50 mb-2">
														{tInstrument('in_person_transfer_description')}
													</p>
													<div className="flex flex-col gap-2">
														{!to && (
															<button
																type="button"
																className="inline-flex flex-col items-center m-auto px-4 py-2 text-lg font-medium text-we-600 dark:text-we-50  disabled:opacity-50 w-fit border-[0.1rem] border-we-500 rounded-md"
																onClick={() => {
																	setShowInPersonSteps(true);
																	setShowRemoteSteps(false);
																}}
																disabled={isTransfering}
																aria-label={tInstrument('transfer_in_person')}
															>
																<span className="text-we-1000 dark:text-we-50">{tInstrument('transfer_in_person')}</span>
																<ArrowDownWideNarrow className="w-6 h-6" strokeWidth={1.5}/>
															</button>
														)}
													</div>
												</div>
											</div>
											<div className="flex gap-6">
												<div className="flex flex-col gap-2 text-center">
													<div className="flex flex-col items-center text-we-500">
														<Telescope className="w-8 h-8" strokeWidth={1.5} />
														<h3 className="text-2xl font-semibold text-it-1000 dark:text-it-50">
															{tInstrument('remote_transfer')}
														</h3>
													</div>
													<p className="text-it-1000 dark:text-it-50 mb-2">
														{tInstrument('remote_transfer_description')}
													</p>
													<div className="flex flex-col gap-2">
														{!to && (
															<button
																type="button"
																className="inline-flex flex-col items-center m-auto px-4 py-2 text-lg font-medium text-we-600 dark:text-we-50 disabled:opacity-50 border-[0.1rem] border-we-500 rounded-md w-fit"
																onClick={() => {
																	setShowRemoteSteps(true);
																	setShowInPersonSteps(false);
																}}
																disabled={isTransfering}
																aria-label={tInstrument('transfer_remotely')}
															>
																<span className="text-we-1000 dark:text-we-50">{tInstrument('transfer_remotely')}</span>
																<ArrowDownWideNarrow className="w-6 h-6" strokeWidth={1.5}/>
															</button>
														)}
													</div>
												</div>
											</div>
										</div>
									</div>
									{/* Show if in person or remote steps selected */}
									{(showInPersonSteps || showRemoteSteps) && (
										<>
											<div className="bg-we-100 dark:bg-we-950 rounded-lg p-6 mb-2 text-center relative animate-slide-up" ref={stepsSectionRef}>
												{/* Close/Back button */}
												<button
													type="button"
													className="absolute top-4 right-4 text-xs font-medium text-we-400 dark:text-we-500 bg-transparent"
													onClick={() => {
														setShowInPersonSteps(false);
														setShowRemoteSteps(false);
														setScannedResult("");
													}}
													aria-label={tInstrument('close_steps')}
												>
													<CircleX className="w-6 h-6" strokeWidth={1.5}/>
												</button>
												{/* Content for in-person steps */}
												{showInPersonSteps && (
													<>
														<div className="flex flex-col items-center justify-center text-we-500 pt-6">
															<Handshake className="w-8 h-8" strokeWidth={1.5} />
															<h3 className="text-2xl font-semibold text-we-1000 dark:text-we-50 mb-12 sm:mb-8">
																{tInstrument('transfer_in_person')}
															</h3>
														</div>
														<div className="mt-4 space-y-6 max-w-sm mx-auto">
															{/* Step 1 */}
															<div className="text-center">
																<p className="text-we-1000 dark:text-we-50 mb-2">
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
															<MoveDown className="w-6 h-6 mx-auto text-we-500" strokeWidth={1.5} />
															{/* Step 2 */}
															<div className="text-center">
																<p className="text-lg text-we-1000 dark:text-we-50 mb-2">
																	{tInstrument('step_2_description')}
																</p>
																<button
																	type="button"
																	className="inline-flex items-center px-4 py-2 text-basic font-medium text-we-1000 dark:text-we-50 bg-transparent border-[0.1rem] border-we-400 rounded-md hover:bg-we-400 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-we-400 disabled:opacity-50"
																	onClick={() => setModalOpen(true)}
																	aria-label={tInstrument('scan_qr')}
																>
																	<QrCode className="w-4 h-4 mr-2" />
																	{tInstrument('scan_qr')}
																</button>
															</div>
															{!scannedResult && !to ? (
																<Hourglass className="w-6 h-6 mx-auto text-we-500 animate-pulse" strokeWidth={1.5} />
															) : (
																<MoveDown className="w-6 h-6 mx-auto text-we-500" strokeWidth={1.5} />
															)}
															{/* Step 3 */}
															<div className="text-center">
																{!scannedResult && !to ? (
																	<p className="text-we-500 dark:text-we-50 text-sm animate-pulse">
																		{tInstrument('step_3_waiting_for_scan')}
																	</p>
																) : (
																	<p className="bg-we-200 dark:bg-we-900 text-we-900 font-medium dark:text-we-50 mb-2 p-2 rounded-full">
																		{tInstrument('recipient_account')} {truncateEthAddress(to || scannedResult || '')}
																	</p>
																)}
															</div>
														</div>
													</>
												)}
												{/* Content for remote steps */}
												{showRemoteSteps && (
													<>
														<div className="flex flex-col items-center justify-center text-we-500 pt-6">
															<Telescope className="w-8 h-8" strokeWidth={1.5} />
															<h3 className="text-2xl font-semibold text-we-1000 dark:text-we-50 mb-12 sm:mb-8">
																{tInstrument('transfer_remotely')}
															</h3>
														</div>
														<div className="mt-4 space-y-6 max-w-md mx-auto">
															{/* Step 1 */}
															<div className="text-center">
																<p className="text-we-1000 text-lg dark:text-it-50 mb-2">
																	{tInstrument('step_1_remote_description')}
																</p>
																<button
																	type="button"
																	onClick={() => handleCopyUrl(generateShareableUrl)}
																	className="inline-flex items-center px-4 py-2 text-xs font-medium text-we-1000 dark:text-we-50 bg-transparent border-[0.1rem] border-we-400 rounded-md hover:bg-we-400 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-we-400 disabled:opacity-50"
																	aria-label={tInstrument('copy_secure_link')}
																	disabled={isTransfering}
																>
																	<Copy className="w-4 h-4 mr-2" />
																	{copySuccess ? tInstrument('copied') : `${tInstrument('copy_secure_link')}`}
																</button>
																<p className="text-we-1000 dark:text-we-50 mt-2 text-xs">
																	{tInstrument('valid_for')} {COOKIE_EXPIRY_DAYS} {tInstrument('days')}
																</p>
															</div>
															<MoveDown className="w-6 h-6 mx-auto text-we-500" strokeWidth={1.5}/>
															{/* Step 2 */}
															<div className="text-center">
																<p className="text-we-1000 dark:text-it-50 mb-2">
																	{tInstrument('step_2_remote_description')}
																</p>
															</div>
															<MoveDown className="w-6 h-6 mx-auto text-we-500" strokeWidth={1.5}/>
															{/* Step 3 */}
															<div className="text-center">
																<p className="text-we-1000 dark:text-it-50 mb-2">
																	{tInstrument('step_3_remote_description')}
																</p>
															</div>
														</div>
													</>
												)}
											</div>
											{/* Transaction Button */}
											{contract && address && (to || scannedResult) && !hasActiveValidationAttempt(searchParams) && (
												<div className="bg-we-200 dark:bg-we-900 rounded-lg p-6 mb-12 text-center relative animate-slide-up" ref={sendSectionRef}>
													<div className="my-6 text-center">
														<CheckCheck className="w-8 h-8 mx-auto text-we-500" strokeWidth={1.5}/>
														<h3 className="text-2xl font-semibold text-we-1000 dark:text-we-50 mt-2 mb-4">
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
																setIsTransfering(false);
																router.refresh();
																router.push('/');
															}}
															onError={(error) => {
																setIsTransfering(false);
																console.error("Transaction error", error);
															}}
															unstyled
															className="px-4 py-2 text-base font-medium transition-colors duration-200 transform bg-transparent border-[0.1rem] border-we-500 rounded-md hover:bg-we-400 text-we-1000 dark:text-we-50 focus:outline-none"
														>
															<div className="flex items-center justify-center gap-2">
																<Send className="w-4 h-4" />
																{tInstrument('send')}
															</div>
														</TransactionButton>
													</div>
												</div>
											)}
										</>
									)}
								</>
							)}
						</div>
						)}
					</div>
					</>
					}
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
											} else {
												const address = split1[1];
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
