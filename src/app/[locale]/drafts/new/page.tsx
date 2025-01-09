import { setRequestLocale } from "next-intl/server";
import Edit from "@/components/pages/Drafts/Edit";

export default function NewDraftPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return <Edit locale={locale} />;
}
