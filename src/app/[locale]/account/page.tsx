import Minter from "@/components/Account/Minter";
import User from "@/components/Account/User";
import { getLocale } from "next-intl/server";
import { authedOnly } from "@/actions/login";

export default async function AccountPage() {
  const locale = await getLocale();
  const authResult: any = await authedOnly("/account");
  const authContext = authResult.parsedJWT.ctx;
  const isMinter = authContext.isMinter;

  return isMinter ? <Minter locale={locale} /> : <User locale={locale} />
}
