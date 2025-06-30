import Minter from "@/components/Account/Minter";
import User from "@/components/Account/User";
import { getLocale } from "next-intl/server";
import { authedOnly } from "@/actions/login";

type Props = {
  searchParams: Promise<{ invite?: string }>
}

export default async function AccountPage({ searchParams }: Props) {
  const locale = await getLocale();
  const authResult: any = await authedOnly("/account");
  const authContext = authResult.parsedJWT.ctx;
  const isMinter = authContext.isMinter;
  const { invite } = await searchParams;

  return isMinter ? <Minter locale={locale} /> : <User locale={locale} invite={invite} />
}
