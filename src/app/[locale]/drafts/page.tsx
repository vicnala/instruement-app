"use client";

import { useStateContext } from "@/app/context";
import { useLocale } from "next-intl";
import Loading from "@/components/Loading";
import Page from "@/components/Page";
import Section from "@/components/Section";
import DraftGrid from "@/components/Drafts/DraftGrid";
import NotConnected from "@/components/NotConnected";

export default function Drafts() {
  const locale = useLocale();
  const { minter, isLoading } = useStateContext()

  if (isLoading) return (
    <Page>
      <div className="text-center">
        <Loading />
      </div>
    </Page>
  )

  return (
    minter ?
      <Page>
        <Section>
          <div className='text-center flex flex-col'>
            <DraftGrid locale={locale} />
          </div>
        </Section>
      </Page> :
      <NotConnected locale={locale} />
  );
}
