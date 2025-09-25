"use client";

import { useTranslations } from "next-intl";
import Page from "@/components/Page";
import Section from "@/components/Section";
import { useStateContext } from "@/app/context";
import NFTGrid from "@/components/NFT/NFTGrid";
import DraftGrid from "@/components/Drafts/DraftGrid";
import Loading from "../Loading";
import { useActiveAccount } from "thirdweb/react";
import NotConnected from "../NotConnected";

const VIDEO_URLS: Record<string, string> = {
  en: "https://www.youtube.com/embed/PbbHg0uxc60", 
  es: "https://www.youtube.com/embed/5XA7PQGbq3A"
};

export default function Minter(
  { locale }: Readonly<{ locale: string }>
) {
  const t = useTranslations('components.HomeIndex.Minter');
  const activeAccount = useActiveAccount();
  const { minter, owned, isLoading, mintedIds } = useStateContext()

  // Get the appropriate video URL based on locale
  const videoUrl = VIDEO_URLS[locale] || VIDEO_URLS.en; // Fallback to English if locale not found

  // Show loading spinner
  if (isLoading) return <Loading />
  if (!activeAccount?.address) return <NotConnected locale={locale} />

  // Main content when user is connected
  return (
    <Page>
      <DraftGrid locale={locale} />
      {
        !owned?.length ?
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
                  {minter.first_name},
                </h2>
                <p className="mb-4 text-lg">
                  {t('hello_sub')}
                </p>
              </div>
            </div>
          }
        </Section> : 
        <Section>
          <NFTGrid nftData={owned} mintedIds={mintedIds} />
          <></>
        </Section>
      }
    </Page>
  );
}
