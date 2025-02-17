import { setRequestLocale } from "next-intl/server";
import Preview from "@/components/Drafts/Preview";

export default function PreviewPage({
  params: { locale, id },
}: {
  params: { locale: string, id: string };
}) {
  setRequestLocale(locale);
  return <Preview id={id} locale={locale} />;
}
