import { setRequestLocale } from "next-intl/server";
import DraftForm from "@/components/Drafts/DraftForm";

export default function DraftEditPage({
  searchParams,
  params: { locale, id },
}: {
  searchParams?: { address?: string };
  params: { locale: string, id: string };
}) {
  setRequestLocale(locale);

  return (
    <DraftForm locale={locale} instrumentId={id} address={searchParams?.address} />
  );
}
