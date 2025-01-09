"use client";

import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import NotConnected from "@/components/pages/NotConnected";
import Page from "@/components/Page";
import Section from "@/components/Section";
import { Instrument } from "@/lib/definitions";

export default function Register(
  { locale, instrument }: Readonly<{ locale: string, instrument?: Instrument }>
) {
  const t = useTranslations();
  const { minter } = useStateContext()

  return (
    minter ?
      <Page>
        <Section>
          <h2 className='text-xl font-semibold text-center'>{t('register.heading')} #{instrument?.id}</h2>
        </Section>
        {
          instrument &&
          <Section>
            <p>
              {JSON.stringify(instrument)}
            </p>
          </Section>
        }
      </Page> :
      <NotConnected locale={locale} />
  );
}
