"use client";
import React from "react";
import { useTranslations } from "next-intl";
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
  minted: {
    owner: string,
    metadata: {
      id: string,
      name: string,
      image: string,
      isMinted: string,
      iAmTheOwner: boolean,
      iAmTheMinter: boolean
    }
  }[];
  emptyText?: string;
};

export default function NFTGrid({ nftData, minted }: Props) {
  const t = useTranslations();
  const { address } = useStateContext();


  const allNftData = [...nftData, ...minted];

  const myNftData: any = [];

  for (const nft of allNftData) {
    if (!myNftData.some((myNft: any) => myNft.metadata.id === nft.metadata.id)) {
      if (nft.owner === address) {
        nft.metadata.iAmTheOwner = true;
      } else {
        nft.metadata.iAmTheOwner = false;
      }
      const iAmTheMinter = minted.find((mintedNft: any) => mintedNft.metadata.id === nft.metadata.id);
      if (iAmTheMinter) {
        nft.metadata.iAmTheMinter = true;
      } else {
        nft.metadata.iAmTheMinter = false;
      }
      myNftData.push(nft);
    }
  }

  if (myNftData && myNftData.length > 0) {
    return (
      <div className='flex flex-col'>
        <div className="pb-2">
          <div className="pb-2">
            <h2 className='text-2xl text-left font-bold text-black dark:text-white pb-2'>
              {myNftData.length > 1 ? t('components.NFTGrid.title_plural') : t('components.NFTGrid.title_single')}
            </h2>
            <p className="text-md text-gray-500 pb-4">
              {t('components.NFTGrid.description')}
            </p>
          </div>
          <div className="grid justify-start grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myNftData
              .sort((a: any, b: any) => BigInt(a.metadata.id) < BigInt(b.metadata.id) ? 1 : -1)
              .map((nft: any, index: number) => (
                <NFT
                  key={`${index}`}
                  nft={nft}
                />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export function NFTGridLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(3)].map((_, index) => (
        <LoadingNFTComponent key={index} />
      ))}
    </div>
  );
}