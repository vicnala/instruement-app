import { setRequestLocale } from "next-intl/server";
import Instrument from "@/components/pages/Instrument/Instrument";

export default function InstrumentPage({
  params: { locale, id },
}: {
  searchParams?: { address?: string };
  params: { locale: string, id: string };
}) {
  return <Instrument id={id} locale={locale} />;
}
