"use client";

import React, { useEffect, useState } from "react"
import truncateEthAddress from 'truncate-eth-address'
import { useTranslations } from "next-intl";
import { resolveScheme } from "thirdweb/storage";
// import { bytesToBigInt } from "thirdweb/utils";
import { useActiveAccount, TransactionButton } from "thirdweb/react";
// import { transferFrom } from "thirdweb/extensions/erc721";
// import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Section from "@/components/Section";
import Loading from "@/components/Loading";
import { client } from "@/app/client";
import { useRouter } from "@/i18n/routing";

export default function Instrument(
	{ locale, id }: Readonly<{ locale: string, id: string }>
) {
	const router = useRouter();
	const t = useTranslations();
	// const { setReloadUser, address, contract } = useStateContext()
	const [isLoading, setIsLoading] = useState(false)
	const [instrument, setInstrument] = useState<any>()
	const [images, setImages] = useState<any[]>([])

	useEffect(() => {
		async function getInstrument() {
			setIsLoading(true)

			try {
				const result = await fetch(`/api/token/${id}`)
				const data = await result.json();
				setInstrument(data);
				const properties = data.metadata.properties || data.metadata.attributes || [];
				const fileDirHashTrait = properties.find((prop: any) => prop.trait_type === 'FileDirHash');
				const fileCountTrait = properties.find((prop: any) => prop.trait_type === 'FileCount');
				const fileDescriptionsTrait = properties.find((prop: any) => prop.trait_type === 'FileDescriptions');

				if (fileDirHashTrait && fileCountTrait) {
					const fileDirHash = fileDirHashTrait.value;
					const fileCount = parseInt(fileCountTrait.value);
					const fileDescriptions = JSON.parse(fileDescriptionsTrait.value);
					// console.log(fileDirHash, fileCount, fileDescriptions);
					const images: any[] = [];
					for (let index = 0; index < fileCount; index++) {
						const uri = await resolveScheme({
							client,
							uri: `ipfs://${fileDirHash}/${index}`
						});
						if (uri) images.push({ uri, description: fileDescriptions[index] });
					}
					setImages(images);
				}

			} catch (error) {
				console.error(`/api/token/${id}`, error)
			}
			setIsLoading(false)
		}

		if (!isLoading) {
			if (id) {
				getInstrument().catch((e) => {
					console.error(`/api/token/${id}`, e.message);
				})
			}
		}
	}, [id, isLoading])

	if (isLoading) return (
		<Page>
			<div className="text-center">
				<Loading />
			</div>
		</Page>
	)

	return (
		<Page>
			{
				instrument ? <>
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
						images && images.length ?
							<Section>
								<div className='flex flex-col'>
									<h2 className='text-3xl font-semibold text-black dark:text-it-50'>
										Images
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
							</Section> : <></>
					}
					{/* <Section>
			{
				contract && address ?
				<TransactionButton
					transaction={() => {
						const bytes = new Uint8Array([parseInt(id)]);
						const bigInt = bytesToBigInt(bytes);
						return transferFrom({
							contract,
							from: address,
							to: "0xE6A2b83c7eb61CD8241Fbe0a449E86F0dA0141EA",
							tokenId: bigInt
						});
					}}
					onTransactionConfirmed={() => {
						alert("Instrument transfered!");
					}}
					onError={(error) => {
						console.error("Transaction error", error);
					}}
				>
					{
						t('transfer.transfer')
					}
				</TransactionButton> : <></>
			}
		</Section> */}
					{/* <p>
				{JSON.stringify(instrument)}
				</p> */}
				</>
					: <></>
			}
		</Page>
	);
}
