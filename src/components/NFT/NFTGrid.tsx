"use client";
import React from "react";
import { useTranslations } from "next-intl";
import NFT, { LoadingNFTComponent } from "./NFT";

type Props = {
  nftData: {
    id: string,
    metadata: {
      name: string,
      image: string
    }
  }[];
  emptyText?: string;
};

export default function NFTGrid({ nftData }: Props) {
  const t = useTranslations();
  if (nftData && nftData.length > 0) {
    return (
      <div className='flex flex-col'>
        <div className="pb-2">
          <div className="pb-2">
            <h2 className='text-2xl text-left font-bold text-black dark:text-white pb-2'>
              {nftData.length > 1 ? t('components.NFTGrid.title_plural') : t('components.NFTGrid.title_single')}
            </h2>
            <p className="text-md text-gray-500 pb-4">
              {t('components.NFTGrid.description')}
            </p>
          </div>
          <div className="grid justify-start grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {nftData
              .sort((a, b) => a.id < b.id ? 1 : -1)
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