"use client";

import { useTranslations } from "next-intl";
import Page from "@/components/Page";
import Section from "@/components/Section";
import NFTGrid from "@/components/NFT/NFTGrid";
import DraftGrid from "@/components/Drafts/DraftGrid";
import NotConnected from "../NotConnected";

const VIDEO_URLS: Record<string, string> = {
  en: "https://www.youtube.com/embed/PbbHg0uxc60", 
  es: "https://www.youtube.com/embed/5XA7PQGbq3A"
};

export default function Minter(
  { locale,
    owned,
    mintedIds,
    context
  }: Readonly<{
    locale: string,
    owned: any[],
    mintedIds: number[],
    context: any
  }>
) {
  const t = useTranslations('components.HomeIndex.Minter');

  // Get the appropriate video URL based on locale
  const videoUrl = VIDEO_URLS[locale] || VIDEO_URLS.en; // Fallback to English if locale not found

  // Go to NotConnected page if user is not connected
  if (!context.sub) return <NotConnected locale={locale} />

  // Main content when user is connected
  return (
    <Page context={context}>
      <DraftGrid locale={locale} context={context} />
      {
        !owned?.length && !mintedIds.length ?
        <Section>
          {
            !owned?.length &&
            <div className="flex flex-row flex-wrap gap-6">
              <div className="flex object-cover aspect-3/2 flex-[2] min-w-[300px] rounded-[15px] overflow-hidden">
                <iframe 
                  className="w-full h-full aspect-video object-contain" 
                  src={videoUrl}
                  title={t('hello')} 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
              <div className="flex flex-col gap-2 justify-center flex-[1] min-w-[30ch]">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  {context.ctx.firstName},
                </h2>
                <p className="mb-4 text-lg">
                  {t('hello_sub')}
                </p>
              </div>
            </div>
          }
        </Section> : 
        <Section>
          <NFTGrid
            owned={owned}
            mintedIds={mintedIds || []}
            address={context.sub}
          />
          <></>
        </Section>
      }
    </Page>
  );
}
