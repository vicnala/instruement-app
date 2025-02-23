import { getLocale } from "next-intl/server";
import { authedOnly } from "@/actions/login";
import Instrument from "@/components/Instrument/Instrument";
import NotFound from "@/app/not-found";

export default async function InstrumentPage({
  searchParams,
  params: {  id },
}: {
  searchParams?: { to?: string };
  params: { locale: string, id: string };
}) {
  const locale = await getLocale();
  const authResult: any = await authedOnly("/");

  if (!authResult.valid) {
    return <NotFound />;
  }
  
  return <Instrument id={id} locale={locale} to={searchParams?.to} />;
}
