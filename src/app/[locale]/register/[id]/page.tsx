import { setRequestLocale } from "next-intl/server";
import Register from "@/components/Register/Register";

export default function RegisterPage({
  params: { locale, id },
}: Readonly<{ params: { locale: string, id: string } }>) {
  setRequestLocale(locale);
  return <Register id={id} locale={locale} />;
}
