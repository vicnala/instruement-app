"use client";
import React from "react";
import { useTranslations } from "next-intl";
import NFT, { LoadingNFTComponent } from "./NFT";

type Props = {
  nftData: {
    id: string;
    uri: string
    name: string,
    description: string,
    image: string,
    properties: any[]
  }[];
  emptyText?: string;
};

export default function NFTGrid({ nftData }: Props) {
  const t = useTranslations();
  if (nftData && nftData.length > 0) {
    return (<>
      <h2 className='text-2xl text-center font-bold text-black dark:text-white'>
        {t('home.user.my_instruments')} ({nftData.length})
      </h2>
      <div className="grid justify-start grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {nftData.map((nft: any, index: number) => (
          <NFT
            key={`${index}`}
            nft={nft}
          />
        ))}
      </div>
    </>
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