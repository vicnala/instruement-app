"use client";

import { useLocale } from "next-intl";
import { useStateContext } from "@/app/context";
import ElementsForm from "@/components/Stripe/ElementsForm";
import Loading from "@/components/Loading";
import NotConnected from "@/components/NotConnected";

export default function PayPage({
  searchParams,
  params: { id },
}: {
  searchParams?: { payment_intent_client_secret?: string, address?: string };
  params: { locale: string, id: string };
}) {
  const locale = useLocale();
  const { address, isLoading } = useStateContext()

  if (isLoading) return <Loading />

  return (
    address ?
      <ElementsForm locale={locale} id={id} address={searchParams?.address} /> :
      <NotConnected locale={locale} />
  )
}
