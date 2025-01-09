import { setRequestLocale } from "next-intl/server";
import Edit from "@/components/pages/Drafts/Edit";

export default function DraftEditPage({
  searchParams,
  params: { locale, id },
}: {
  searchParams?: { address?: string };
  params: { locale: string, id: string };
}) {
  setRequestLocale(locale);
  return <Edit id={id} locale={locale} address={searchParams?.address} />;
}
