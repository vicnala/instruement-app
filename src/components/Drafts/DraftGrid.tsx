"use client";
import React from "react";
import Draft from "./Draft";
import { useStateContext } from "@/app/context";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function DraftGrid({ address }: { address?: string | undefined }) {
  const { minter } = useStateContext();
  const t = useTranslations();

  if (minter && minter.instruments && minter.instruments.length > 0) {
    const instruments = minter.instruments.sort((insa: any, insb: any) => (insa.id < insb.id) ? 1 : -1);

    return (
    <>
      <h2 className='text-2xl text-center font-bold text-black dark:text-white'>
        {t('drafts.my_drafts')} {instruments.length > 0 ? `(${instruments.length})` : ''}
      </h2>
      <div className="grid justify-start grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {instruments.map((instrumentId: number) => (
          <Draft
            key={instrumentId.toString()}
            instrumentId={instrumentId.toString()}
            address={address}
          />
        ))}
      </div>
      <Link key="drafts" href="/drafts/new">
          <button type="button" className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25">
            {t('navbar.new_draft')}
          </button>
      </Link>
    </>
    );
  }

  return (
    <>
  
      <div className="flex justify-center items-center h-[500px]">
        <p className="max-w-lg text-lg font-semibold text-center text-black dark:text-white">
          {t('drafts.no_drafts')}
        </p>
      </div>
      <Link key="drafts" href="/drafts/new">
          <button type="button" className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25">
            {t('navbar.new_draft')}
          </button>
      </Link>
    </>
  );
}
