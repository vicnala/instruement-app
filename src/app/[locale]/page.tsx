'use client';

import { useLocale, useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Loading from "@/components/Loading";
import Minter from "@/components/HomeIndex/Minter";
import User from "@/components/HomeIndex/User";
import NotConnected from "@/components/NotConnected";


export default function Home() {
  const locale = useLocale();
  const t = useTranslations();
  const { address, isMinter, isLoading } = useStateContext()

  if (isLoading) return (
    <Page>
      <div className="text-center">
        <Loading />
      </div>
    </Page>
  )

  return (
    isMinter ?
      <Minter locale={locale} /> :
      address ?
        <User locale={locale} /> :
        <NotConnected locale={locale} />)
}

