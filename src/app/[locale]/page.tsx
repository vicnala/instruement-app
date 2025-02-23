import Minter from "@/components/HomeIndex/Minter";
import User from "@/components/HomeIndex/User";
import { getLocale } from "next-intl/server";
import { authedOnly } from "@/actions/login";


export default async function Home() {
  const locale = await getLocale();
  const authResult: any = await authedOnly("/");
  const authContext = authResult.parsedJWT.ctx;
  const isMinter = authContext.isMinter;

  return isMinter ? <Minter locale={locale} /> : <User locale={locale} />
}
