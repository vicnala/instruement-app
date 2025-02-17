import { setRequestLocale } from "next-intl/server";
import Instrument from "@/components/Instrument/Instrument";

export default function DraftEditPage({
  params: { locale, network, contract, id },
}: {
  params: { locale: string, network: string, contract: string, id: string };
}) {
  setRequestLocale(locale);
  return <>
    { locale && <>{locale}</> }
    { network && <>{network}</> }
    { contract && <>{contract}</> }
    { id && <>{id}</> }
  </>;

  return <Instrument id={id} locale={locale} />;
}
