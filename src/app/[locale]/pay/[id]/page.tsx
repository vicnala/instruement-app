import { useLocale } from "next-intl";
import ElementsForm from "@/components/Stripe/ElementsForm";
import { userAuthData } from "@/actions/login";
import { getLocale } from "next-intl/server";
import { getUser } from "@/services/UsersService";
import NotFound from "@/app/not-found";
import { redirect } from "@/i18n/routing";
import { getSavedInstrument } from "@/services/instrumentsService";
import FileUploadService from "@/services/FileUploadService";

export default async function PayPage({
  searchParams,
  params
}: {
  searchParams?: { payment_intent_client_secret?: string, address?: string };
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  const locale = await getLocale();

  const authData: any = await userAuthData();
  if (!authData?.parsedJWT) redirect({ href: '/', locale });

  const context = authData.parsedJWT;
  if (!context?.sub) redirect({ href: '/', locale });

  const minter = await getUser(authData.parsedJWT.sub);
  if (minter.code !== 'success') return <NotFound />;

  const instrument = await getSavedInstrument(id, locale);
  if (instrument.code !== 'success') return <NotFound />;

  let amount = 0;
  const type = minter.data.instrument_types.find((ins: any) => ins.slug === instrument.data.type);
  if (type) amount = type.user_register_price_eur;
  if (amount === 0) return <NotFound />;

  const coverId = instrument.data.cover_image;
  if (coverId) {
    const { data } = await FileUploadService.getFile(coverId, minter.data.api_key);
    if (data.code === 'success') {
      instrument.data.cover_image = data.data;
    }
  }

  return <ElementsForm
    id={id}
    urlAddress={searchParams?.address}
    minterAddress={context.sub}
    instrument={instrument.data}
    amount={amount}
  />
}
