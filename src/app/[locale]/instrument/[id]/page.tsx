'use client';

import { useLocale } from "next-intl";
import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Instrument from "@/components/Instrument/Instrument";
import Loading from "@/components/Loading";
import NotConnected from "@/components/NotConnected";

export default function InstrumentPage({
  searchParams,
  params: {  id },
}: {
  searchParams?: { to?: string };
  params: { locale: string, id: string };
}) {
  const locale = useLocale();
  const { address, isLoading } = useStateContext()

  if (isLoading) return (
    <Page>
      <div className="text-center">
        <Loading />
      </div>
    </Page>
  )

  return (
    address ?
      <Instrument id={id} locale={locale} to={searchParams?.to} /> :
      <NotConnected locale={locale} />
  );
}
