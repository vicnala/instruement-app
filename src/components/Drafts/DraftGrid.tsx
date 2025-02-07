"use client";
import React from "react";
import Draft from "./Draft";
import { useStateContext } from "@/app/context";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function DraftGrid({ address, locale  }: { address?: string | undefined, locale: string }) {
  const { minter } = useStateContext();
  const t = useTranslations();

  if (minter && minter.instruments && minter.instruments.length > 0) {
    const instruments = minter.instruments.sort((insa: any, insb: any) => (insa.id < insb.id) ? 1 : -1);

    return (
      <div className="pb-4">
        <div className="pb-2">
          <h2 className='text-2xl text-left font-bold text-black dark:text-white pb-2'>
            {instruments.length > 1 ? t('components.DraftGrid.title_plural') : t('components.DraftGrid.title_single')}
          </h2>
          <p className="text-md text-gray-500 pb-4">
            {t('components.DraftGrid.description')}
          </p>
        </div>
        <div className="grid justify-start grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {instruments.map((instrumentId: number) => (
            <Draft
              key={instrumentId.toString()}
              instrumentId={instrumentId.toString()}
              address={address}
              locale={locale}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
    </>
  );
}
