import { setRequestLocale } from "next-intl/server";
import DraftForm from "@/components/Drafts/DraftForm";

export default function DraftEditPage({
  params: { locale, id },
}: {
  params: { locale: string, id: string };
}) {
  setRequestLocale(locale);

  return (
    <DraftForm locale={locale} instrumentId={id} />
  );
}
