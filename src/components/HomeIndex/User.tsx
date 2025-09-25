"use client";

import { useTranslations } from "next-intl";
import { useStateContext } from '@/app/context';
import Page from "@/components/Page";
import Loading from '@/components/Loading';
import Section from "@/components/Section";
import NFTGrid from '@/components/NFT/NFTGrid';
import ReceiveInstrumentCard from "@/components/ReceiveInstrumentCard";
import { useActiveAccount } from "thirdweb/react";
import NotConnected from "../NotConnected";

  
export default function User(
  { locale, invite }: Readonly<{ locale: string, invite?: string }>
) {
  const t = useTranslations('components.HomeIndex.User');
  const { owned, isLoading } = useStateContext()
  const activeAccount = useActiveAccount();

  if (isLoading) return <Loading />
  if (!activeAccount?.address) return <NotConnected locale={locale} />

  return (
    <Page>
      {
        !owned.length ?
        <Section>
          <div>
            {activeAccount?.address && <ReceiveInstrumentCard address={activeAccount.address} locale={locale} />}
          </div>
        </Section> :
        <Section>
          <div className="flex flex-col pt-4">
            <NFTGrid nftData={owned} mintedIds={[]} />
          </div>
        </Section>
      }
    </Page>
  );
}
