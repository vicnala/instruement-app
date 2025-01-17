import { setRequestLocale } from "next-intl/server";
import Edit from "@/components/Drafts/Edit";

export default function NewDraftPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return <Edit locale={locale} />;
}
