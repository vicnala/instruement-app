"use client";

import React, { useState, useEffect } from "react";
import Draft from "./Draft";
import { useTranslations } from "next-intl";
import Section from "@/components/Section";
import { getUser } from "@/services/UsersService";

export default function DraftGrid({ locale, context }: Readonly<{ locale: string, context: any }>) {
  const t = useTranslations();
  const [minter, setMinter] = useState<any>(null);

  useEffect(() => {
    const getMinter = async () => {
      const result = await getUser(context.sub);
      if (result.code === 'success') {
        setMinter(result.data);
      }
    }
    getMinter();
  }, [context.sub]);

  if (minter && minter.instruments && minter.instruments.length > 0) {
    return (
      <Section>
        <div className='flex flex-col pt-6 pb-6'>
          <div className="pb-2">
            <h2 className='text-2xl text-left font-bold text-scope-1000 pb-2'>
              {minter.instruments.length > 1 ? t('components.DraftGrid.title_plural') : t('components.DraftGrid.title_single')}
            </h2>
            <p className="text-md text-scope-700 pb-4">
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
