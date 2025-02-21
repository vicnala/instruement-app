"use client";

import React, { useEffect, useState } from "react"
import { TransactionButton } from "thirdweb/react";
import { transferFrom } from "thirdweb/extensions/erc721";
// import { bytesToBigInt } from "thirdweb/utils";
import truncateEthAddress from 'truncate-eth-address'
import { useTranslations } from "next-intl";
import { resolveScheme } from "thirdweb/storage";
import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Section from "@/components/Section";
import Loading from "@/components/Loading";
import { client } from "@/app/client";

export default function Instrument(
	{ locale, id, to }: Readonly<{ locale: string, id: string, to: string | undefined }>
) {
	const t = useTranslations();
	const [isLoadingInstrumentNft, setIsLoadingInstrumentNft] = useState(false)
	const [isLoadingMinter, setIsLoadingMinter] = useState(false)
	const [instrument, setInstrument] = useState<any>()
	const [images, setImages] = useState<any[]>([])
	const [documents, setDocuments] = useState<any[]>([])
	const [minter, setMinter] = useState<string>()
	const [minterUser, setMinterUser] = useState<any>()
	const { address, contract } = useStateContext()

	useEffect(() => {
		async function getInstrument() {
			try {
				const result = await fetch(`/api/token/${id}`)
				const data = await result.json();
				setInstrument(data);
				
				// console.log("instrument.data", data);

				const properties = data.metadata.properties || data.metadata.attributes || [];
				const fileDirHashTrait = properties.find((prop: any) => prop.trait_type === 'Files');
				const registrarTarit = properties.find((prop: any) => prop.trait_type === 'Registrar');

				if (registrarTarit) {
					setMinter(registrarTarit.value);
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
			setIsLoadingInstrumentNft(false)
		}

		if (!isLoadingInstrumentNft && !instrument) {
			if (id) {
				setIsLoadingInstrumentNft(true)
				getInstrument().catch((e) => {
					console.error(`/api/token/${id}`, e.message);
				})
			}
		}
	}, [id, isLoadingInstrumentNft, instrument])


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
	
	return (
		<Page>
			{
				instrument && instrument.metadata ? <>
					<Section>
						<div className='text-center flex flex-col'>
							<h2 className='text-3xl font-semibold text-black dark:text-it-50'>
								{instrument.metadata.name}
							</h2>
							<img className="mx-auto" src={instrument.metadata.image} width={200} height={200} alt={`Instrument #${id}`} />
							<div className='mt-4'>
								<p className='text-s text-black dark:text-gray-400'>
									Instruement #{id}
								</p>
								<p className='text-s text-black dark:text-gray-400'>
									{t('instrument.owner')} {truncateEthAddress(instrument.owner)}
								</p>
								<p className='text-s text-black dark:text-gray-400'>
									{t('instrument.minter')} {minter && truncateEthAddress(minter)}
									{
										minterUser && <b>
											{" "} {minterUser.business_name}
										</b>
									}
								</p>
							</div>
						</div>
					</Section>
					<Section>
						<h2 className='text-2xl font-semibold text-black dark:text-it-50'>
							{t('instrument.description')}
						</h2>
						<div className='flex flex-col'>
							<p>{instrument.metadata.description}</p>
						</div>
					</Section>
					{
						images && images.length &&
							<Section>
								<div className='flex flex-col'>
									<h2 className='text-3xl font-semibold text-black dark:text-it-50'>
										{t('components.Instrument.images')}
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
					{
						documents && documents.length &&
							<Section>
								<div className='flex flex-col'>
									<h2 className='text-3xl font-semibold text-black dark:text-it-50'>
										{t('components.Instrument.documents')}
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
					{
						contract && address && to ?
							<Section>
								<TransactionButton
									transaction={() => {
										// const bytes = new Uint8Array([parseInt(id)]);
										// const bigInt = bytesToBigInt(bytes);
										return transferFrom({
											contract: contract,
											from: address,
											to: to,
											tokenId: BigInt(id) /*bigInt*/
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
									{ t('transfer.transfer') } #{id} { t('to') } {truncateEthAddress(to)}
								</TransactionButton>
							</Section> : <></>
					}
				</> : <></>
			}
		</Page>
	);
}
