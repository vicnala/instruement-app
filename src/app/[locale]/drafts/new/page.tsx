import { setRequestLocale } from "next-intl/server";
import DraftForm from "@/components/Drafts/DraftForm";

export default function NewDraftPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return <DraftForm locale={locale} />;
}
