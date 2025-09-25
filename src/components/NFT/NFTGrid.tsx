"use client";
import React, { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import NFT, { LoadingNFTComponent } from "./NFT";
import { useStateContext } from "@/app/context";

type Props = {
  nftData: {
    owner: string,
    metadata: {
      id: string,
      name: string,
      image: string,
      isMinted: boolean,
      iAmTheOwner: boolean,
      iAmTheMinter: boolean
    }
  }[];
  emptyText?: string;
  mintedIds: number[];
};

export default function NFTGrid({ nftData, mintedIds }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const { address } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);
  const [allNftData, setAllNftData] = useState([]);

  useEffect(() => {
    const getInstrument = async (id: number) => {     
      try {
        const result = await fetch(`/api/instrument/${id}?locale=${locale}`, {
          method: "GET",
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        const { data } = await result.json()
        // console.log("GET", `/api/instrument/${id}`, data.data);

        if (data.code !== 'success') {
          console.log(`GET /api/instrument/${id} ERROR`, data.message);
          alert(`Error: ${data.message}`);
        } else {          
          return data.data;
        }
      } catch (error: any) {
        console.log(`GET /api/instrument/${id} ERROR`, error.message)
        alert(`Error: ${error.message}`);
      } 
    }

    const getToken = async (id: number) => {
      const result = await fetch(`/api/token/${id}`)
      return await result.json();
    }
    
    Promise.all(mintedIds.map(getInstrument))
      .then((mintedInstruments) => {
        // console.log("mintedInstruments", mintedInstruments.map((result: any) => result.asset_id));
        Promise.all(mintedInstruments.map(instrument => instrument.asset_id).map(getToken))
          .then((mintedTokens) => {
            // console.log("minted tokens", mintedTokens);
            const allTokens = [...nftData, ...mintedTokens];
            const myNftData: any = [];
            for (const nft of allTokens) {
              if (!myNftData.some((myNft: any) => myNft.metadata.id === nft.metadata.id)) {
                if (nft.owner === address) {
                  nft.metadata.iAmTheOwner = true;
                } else {
                  nft.metadata.iAmTheOwner = false;
                }
                const iAmTheMinter = mintedTokens.find((mintedNft: any) => mintedNft.metadata.id === nft.metadata.id);
                if (iAmTheMinter) {
                  nft.metadata.iAmTheMinter = true;
                } else {
                  nft.metadata.iAmTheMinter = false;
                }
                myNftData.push(nft);
              }
            }
            setAllNftData(myNftData);
            setIsLoading(false);
          })
          .catch((error: any) => {
            console.log(`GET /api/token ERROR`, error.message)
            setIsLoading(false);
            alert(`Error: ${error.message}`);
          });
      })
      .catch((error: any) => {
        console.log(`GET /api/instrument ERROR`, error.message)
        setIsLoading(false);
        alert(`Error: ${error.message}`);
      });
  }, []);

  return (
    <div className='flex flex-col'>
      <div className="pb-2">
        <div className="pb-2">
          <h2 className='text-2xl text-left font-bold text-black dark:text-white pb-2'>
            {allNftData.length > 1 ? t('components.NFTGrid.title_plural') : t('components.NFTGrid.title_single')}
          </h2>
          <p className="text-md text-gray-500 pb-4">
            {allNftData.length > 1 ? t('components.NFTGrid.description_plural') : t('components.NFTGrid.description_single')}
          </p>
        </div>
        {
          isLoading ? (
            <NFTGridLoading total={nftData.length + mintedIds.length} />
          ) : (
            <div className="grid justify-start grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allNftData
                .sort((a: any, b: any) => BigInt(a.metadata.id) < BigInt(b.metadata.id) ? 1 : -1)
                .map((nft: any, index: number) => (
                  <NFT
                    key={`${index}`}
                    nft={nft}
                  />
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

export function NFTGridLoading({ total }: { total: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(total)].map((_, index) => (
        <LoadingNFTComponent key={index} />
      ))}
    </div>
  );
}