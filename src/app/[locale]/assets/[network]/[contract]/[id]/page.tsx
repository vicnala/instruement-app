import { setRequestLocale } from "next-intl/server";

export default function AssetPage({
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
}
