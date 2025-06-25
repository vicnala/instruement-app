import Minter from "@/components/HomeIndex/Minter";
import User from "@/components/HomeIndex/User";
import { getLocale } from "next-intl/server";
import { authedOnly } from "@/actions/login";

type Props = {
  searchParams: Promise<{ invite?: string }>
}

export default async function Home({ searchParams }: Props) {
  const locale = await getLocale();
  const authResult: any = await authedOnly("/");
  const authContext = authResult.parsedJWT.ctx;
  const isMinter = authContext.isMinter;
  const { invite } = await searchParams;

  return isMinter
    ? <Minter locale={locale} />
    : <User locale={locale} invite={invite} />;
}
