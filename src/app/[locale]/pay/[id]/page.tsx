import { useLocale } from "next-intl";
import ElementsForm from "@/components/Stripe/ElementsForm";
import { userAuthData } from "@/actions/login";
import { getLocale } from "next-intl/server";

export default async function PayPage({
  searchParams,
  params: { id },
}: {
  searchParams?: { payment_intent_client_secret?: string, address?: string };
  params: { locale: string, id: string };
}) {
  const locale = await getLocale();
  const authData: any = await userAuthData();
  const context = authData.parsedJWT;

  return <ElementsForm locale={locale} id={id} address={searchParams?.address} context={context} />
}
