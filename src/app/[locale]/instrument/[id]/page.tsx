import { authedOnly } from "@/actions/login";
import Instrument from "@/components/Instrument/Instrument";
import NotFound from "@/app/not-found";

export default async function InstrumentPage({
  searchParams,
  params: { locale, id },
}: {
  searchParams?: { to?: string };
  params: { locale: string, id: string };
}) {
  const authResult: any = await authedOnly(`/instrument/${id}`); 

  return (
    authResult.valid ? <Instrument id={id} locale={locale} to={searchParams?.to} /> : <NotFound />
  );
}
