import NotConnected from "@/components/HomeIndex/NotConnected";
import { getLocale } from "next-intl/server";

export default async function Login(
  { searchParams }:
  { searchParams?: { cb?: string | undefined, invite?: string | undefined }})
{
  const locale = await getLocale();
  return (
    <NotConnected
      locale={locale}
      cb={searchParams?.cb}
      invite={searchParams?.invite}
    />
  );
}
