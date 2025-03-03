"use client";

import React, { useEffect, useState } from "react"
import { TransactionButton } from "thirdweb/react";
import { transferFrom, ownerOf } from "thirdweb/extensions/erc721";
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
	const t = useTranslations('components.Instrument');
	const [isLoadingInstrumentAsset, setIsLoadingInstrumentAsset] = useState(false)
	const [isLoadingInstrument, setIsLoadingInstrument] = useState(false)
	const [isLoadingMinter, setIsLoadingMinter] = useState(false)
	const [instrumentAsset, setInstrumentAsset] = useState<any>()
	const [instrument, setInstrument] = useState<any>()
	const [images, setImages] = useState<any[]>([])
	const [documents, setDocuments] = useState<any[]>([])
	const [minter, setMinter] = useState<string>()
	const [minterUser, setMinterUser] = useState<any>()
	const { address, contract } = useStateContext()
	const [isOwner, setIsOwner] = useState<boolean>(false)
	const [copySuccess, setCopySuccess] = useState(false);
	const pathname = usePathname();
	const searchParams = useSearchParams();

    const [scannedResult, setScannedResult] = useState<string | undefined>("")
	const [isModalOpen, setModalOpen] = useState(false);
	

	useEffect(() => {
		async function getInstrumentAsset() {
			try {
				const result = await fetch(`/api/token/${id}`)
				const data = await result.json();
				setInstrumentAsset(data);
				
				console.log("instrumentAsset.data", data);

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

          console.log("images", images);
          console.log("documents", documents);

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
    async function getInstrument() {
      try {
        const result = await fetch(`/api/instrument/asset/${id}?locale=${locale}`)
        const data = await result.json();
        const { data: instrumentData } = data;
        console.log("instrumentData ", instrumentData);
        setInstrument(instrumentData);
      } catch (error) {
        console.error(`/api/instrument/asset/${id}`, error)
      }
      setIsLoadingInstrument(false);
    }

    if (!isLoadingInstrument && !instrument) {
      if (id) {
        setIsLoadingInstrument(true)
        getInstrument().catch((e) => {
          console.error(`/api/instrument/asset/${id}`, e.message);
        })
      }
    }
  }, [id, isLoadingInstrument, instrument, locale])


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

	return (
		<Page>
			{
				instrumentAsset && instrumentAsset.metadata ? 
				<>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="col-span-1">
              <div className="rounded-lg relative bg-it-100 border border-it-200 shadow-md overflow-hidden">
                <div className="w-full aspect-square bg-white/[.04]"> 
                  <Image 
                    className="mx-auto" 
                    src={instrumentAsset.metadata.image} 
                    width={800} 
                    height={800} 
                    alt={`Instrument #${id}`} 
                  />
                </div>
                <p className="text-it-1000 p-4">
                  {/* {instrumentAsset.cover_image.description || t('no_description')} */}
                </p>

                {/* Images Section */}
                {
                  images && images.length &&
                  <div className='flex flex-col'>
                    <h2 className='text-3xl font-semibold text-black dark:text-it-50'>
                      {t('images')}
                    </h2>
                    {
                      images.map((img: any, index: number) =>
                        <div key={`${index}`} className="relative bg-it-100 border border-it-200 rounded-lg overflow-hidden">
                            <div className="w-full aspect-square bg-white/[.04]">
                              <Image 
                                src={img.uri} 
                                width={200} 
                                height={200} 
                                alt={`Instrument #${id}`} 
                              />
                            <p className="text-it-1000 p-2 text-sm">
                              {img.description || t('no_description')}
                            </p>
                          </div>
                        </div>
                      )
                    }
                  </div>
                }

                {/* Documents Section */}
                {
                  documents && documents.length &&
                  <div className="pt-4 md:pt-8">
                      <h2 className='text-3xl font-semibold text-black dark:text-it-50'>
                        {t('documents')}
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
                                {doc.description || t('no_description')}
                              </p>
                            </div>
                            <Download className="w-4 h-4" />
                          </a>
                        )
                      }
                    </div>
                  </div>
                }

              </div>
            </div>
            <div className="col-span-2">
              
              <h2 className='text-3xl font-semibold text-black dark:text-it-50'>
								{instrumentAsset.metadata.name}
							</h2>
              <p className='text-s text-black dark:text-gray-400'>
									{t('owner')} {truncateEthAddress(instrumentAsset.owner)}
              </p>
              <p className='text-s text-black dark:text-gray-400'>
                {t('minter')} {minter && truncateEthAddress(minter)}
                {
                  minterUser && <b>
                    {" "} {minterUser.business_name}
                  </b>
                }
              </p>
              {/* Description Section */}
              <h2 className='text-2xl font-semibold text-black dark:text-it-50'>
                {t('description')}
              </h2>
              <div className='flex flex-col'>
                <p>{instrumentAsset.metadata.description}</p>
              </div>
            </div>
          </div>

					<div className="mt-6 text-center space-y-4">
						{/* Copy URL Button for Owner */}
						{contract && address && isOwner && (
							<Section>
								<button
									type="button"
									onClick={() => handleCopyUrl(generateShareableUrl)}
									className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
									aria-label={t('copy_url')}
								>
									<Copy className="w-4 h-4" />
									{copySuccess ? t('copied') : `${t('copy_url')} (${t('valid_for')} ${COOKIE_EXPIRY_DAYS} ${t('days')})`}
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
									aria-label={t('copy_response_url')}
								>
									<Copy className="w-4 h-4" />
									{copySuccess ? t('copied') : t('copy_response_url')}
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
									>
										{isModalOpen ? t('stop') : t('scan')}
									</button>
								</Section>
						}
						{/* Transaction Button */}
						{
							contract && address && isOwner && (to || scannedResult) &&
							<Section>
								<TransactionButton
									transaction={() => {
										return transferFrom({
											contract: contract,
											from: address,
											to: to ? to : scannedResult ? scannedResult : '',
											tokenId: BigInt(id)
										});
									}}
									onTransactionConfirmed={() => {
										alert("Instrument transfered!");
									}}
									onError={(error) => {
										console.error("Transaction error", error);
									}}
									unstyled
									className="items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
									>
									{ t('transfer') } #{id} { t('to') } {truncateEthAddress(to || scannedResult || '')}
								</TransactionButton>
							</Section>
						}
					</div>
					<QRModal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
						<Scanner
							onScan={(result) => {
								setScannedResult(result[0].rawValue)
								setModalOpen(false)
							}}
							classNames={{}}
							styles={{}}
						/>
					</QRModal>
				</> 
				: 
				<></>
			}
		</Page>
	);
}
