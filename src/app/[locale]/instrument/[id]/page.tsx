import { setRequestLocale } from "next-intl/server";
import Instrument from "@/components/Instrument/Instrument";

export default function InstrumentPage({
  params: { locale, id },
}: {
  searchParams?: { address?: string };
  params: { locale: string, id: string };
}) {
  setRequestLocale(locale);
  return <Instrument id={id} locale={locale} />;
}
