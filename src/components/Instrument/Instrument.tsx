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

    const [scannedResult, setScannedResult] = useState<string | undefined>("")
	const [isModalOpen, setModalOpen] = useState(false);
	

	useEffect(() => {
		async function getInstrumentAsset() {
			try {
				const result = await fetch(`/api/token/${id}`)
				const data = await result.json();
				setInstrumentAsset(data);
				
				console.log("instrument.data", data);

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
        console.log("instrument.data", data);
        setInstrument(data);
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


	return (
		<Page>
			{
				instrumentAsset && instrumentAsset.metadata ? 
				<>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="col-span-1">

            </div>
            <div className="col-span-2">
              
              <h2 className='text-3xl font-semibold text-black dark:text-it-50'>
								{instrumentAsset.metadata.name}
							</h2>
            </div>
          </div>
					{/* Header Section */}
					<Section>
						<div className='text-center flex flex-col'>
							<h2 className='text-3xl font-semibold text-black dark:text-it-50'>
								{instrumentAsset.metadata.name}
							</h2>
							<img className="mx-auto" src={instrumentAsset.metadata.image} width={200} height={200} alt={`Instrument #${id}`} />
							<div className='mt-4'>
								<p className='text-s text-black dark:text-gray-400'>
									Instruement #{id}
								</p>
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
							</div>
						</div>
					</Section>
					{/* Description Section */}
					<Section>
						<h2 className='text-2xl font-semibold text-black dark:text-it-50'>
							{t('description')}
						</h2>
						<div className='flex flex-col'>
							<p>{instrumentAsset.metadata.description}</p>
						</div>
					</Section>
					{/* Images Section */}
					{
						images && images.length &&
							<Section>
								<div className='flex flex-col'>
									<h2 className='text-3xl font-semibold text-black dark:text-it-50'>
										{t('images')}
									</h2>
									{
										images.map((img: any, index: number) =>
											<div key={`${index}`}>
												<img src={img.uri} width={200} height={200} alt={`Instrument #${id}`} />
												<p>{img.description}</p>
											</div>
										)
									}
								</div>
							</Section>
					}
					{/* Documents Section */}
					{
						documents && documents.length &&
							<Section>
								<div className='flex flex-col'>
									<h2 className='text-3xl font-semibold text-black dark:text-it-50'>
										{t('documents')}
									</h2>
									{
										documents.map((doc: any, index: number) =>
											<div key={`${index}`}>
												<p>
													<a href={doc.uri} target="_blank" rel="noreferrer">
														🔗 {doc.description} 
													</a>
												</p>
											</div>
										)
									}
								</div>
							</Section>
					}
					<div className="mt-6 text-center">
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
