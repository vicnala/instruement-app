"use client";
import React from "react";
import Draft from "./Draft";
import { useStateContext } from "@/app/context";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Section from "@/components/Section";

export default function DraftGrid({ locale }: { locale: string }) {
  const { minter } = useStateContext();
  const t = useTranslations();

  if (minter && minter.instruments && minter.instruments.length > 0) {
    return (
      <Section>
        <div className='flex flex-col pb-6'>
          <div className="pb-2">
            <h2 className='text-2xl text-left font-bold text-black dark:text-white pb-2'>
              {minter.instruments.length > 1 ? t('components.DraftGrid.title_plural') : t('components.DraftGrid.title_single')}
            </h2>
            <p className="text-md text-gray-500 pb-4">
              {t('components.DraftGrid.description')}
            </p>
          </div>
          <div className="|| grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-start || gap-3 md:gap-6">
            {minter.instruments.map((instrumentId: number) => (
              <Draft
                key={instrumentId.toString()}
                instrumentId={instrumentId.toString()}
                locale={locale}
                api_key={minter.api_key}
              />
            ))}
          </div>
        </div>
      </Section>
    );
  }

  return (
    <>
    </>
  );
}
