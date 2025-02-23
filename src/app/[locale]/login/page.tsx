import Page from "@/components/Page";
import Loading from "@/components/Loading";
import Minter from "@/components/HomeIndex/Minter";
import User from "@/components/HomeIndex/User";
import NotConnected from "@/components/NotConnected";
import { getLocale } from "next-intl/server";
import { isLoggedIn } from "@/actions/login";

export default async function Login({ searchParams }: { searchParams?: { callbackUrl?: string | undefined }}) {
  const locale = await getLocale();
  return (
    <NotConnected locale={locale} callbackUrl={searchParams?.callbackUrl} />
  )
}
