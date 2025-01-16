"use client";
import React from "react";
import Draft from "./Draft";
import { useStateContext } from "@/app/context";
import { useTranslations } from "next-intl";

export default function DraftGrid({ address }: { address?: string | undefined }) {
  const { minter } = useStateContext();
  const t = useTranslations('drafts');

  if (minter && minter.instruments && minter.instruments.length > 0) {
    const instruments = minter.instruments.sort((insa: any, insb: any) => (insa.id < insb.id) ? 1 : -1);

    // console.log("instruments", instruments);
    
    return (<>
      <h2 className='text-2xl text-center font-bold text-black dark:text-white'>
        {t('my_drafts')} {instruments.length > 0 ? `(${instruments.length})` : ''}
      </h2>
      <div className="grid justify-start grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {instruments.map((draft: any) => (
          <Draft
            key={draft.id}
            draft={draft}
            address={address}
          />
        ))}
      </div>
    </>
    );
  }

  return (
    <div className="flex justify-center items-center h-[500px]">
      <p className="max-w-lg text-lg font-semibold text-center text-black dark:text-white">
        {t('no_drafts')}
      </p>
    </div>
  );
}
