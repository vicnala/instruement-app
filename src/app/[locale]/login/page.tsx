import NotConnected from "@/components/HomeIndex/NotConnected";
import { getLocale } from "next-intl/server";

type Props = {
  searchParams?: { cb?: string; invite?: string; ticket?: string };
};

export default async function Login({ searchParams }: Props) {
  const locale = await getLocale();

  return (
    <NotConnected
      locale={locale}
      cb={searchParams?.cb}
      invite={searchParams?.invite}
      ticket={searchParams?.ticket}
    />
  );
}
