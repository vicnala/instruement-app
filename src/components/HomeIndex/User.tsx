"use client";

import Page from "@/components/Page";
import Section from "@/components/Section";
import NFTGrid from '@/components/NFT/NFTGrid';
import ReceiveInstrumentCard from "@/components/ReceiveInstrumentCard";
import NotConnected from "../NotConnected";

  
export default function User(
  { locale, owned, context }: Readonly<{ locale: string, owned: any[], context: any }>
) {
  if (!context.sub) return <NotConnected locale={locale} />

  return (
    <Page context={context}>
      {
        !owned.length ?
        <Section>
          <div>
            {context.sub && <ReceiveInstrumentCard address={context.sub} locale={locale} context={context} />}
          </div>
        </Section> :
        <Section>
          <div className="flex flex-col pt-4">
              <NFTGrid owned={owned} mintedIds={[]} address={context.sub} />
          </div>
        </Section>
      }
    </Page>
  );
}
