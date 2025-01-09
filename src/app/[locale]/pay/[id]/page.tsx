import { setRequestLocale } from "next-intl/server";
import ElementsForm from "@/components/Stripe/ElementsForm";
import Page from "@/components/Page";
import Section from "@/components/Section";

export default function PayPage({
  searchParams,
  params: { locale, id },
}: {
  searchParams?: { payment_intent_client_secret?: string, address?: string };
  params: { locale: string, id: string };
}) {
  setRequestLocale(locale);

  return (
    <Page>
      <Section>
        <ElementsForm locale={locale} id={id} address={searchParams?.address} />
      </Section>
    </Page>
  )
}
