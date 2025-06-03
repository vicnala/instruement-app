import Instrument from "@/components/Instrument/Instrument";
import { redirect } from "@/i18n/routing";

export default async function InstrumentPage({
  searchParams,
  params: { locale, id },
}: {
  searchParams?: { to?: string };
  params: { locale: string, id: string };
}) {
  if (!locale) {
    redirect({ href: `/instrument/${id}?to=${searchParams?.to}`, locale: locale || 'en' });
  }

  return (
    <Instrument id={id} locale={locale} to={searchParams?.to} />
  );
}
