import Minter from "@/components/HomeIndex/Minter";
import User from "@/components/HomeIndex/User";
import { getLocale } from "next-intl/server";
import { authedOnly } from "@/actions/login";
import { getUserInstruments } from "@/services/instrumentsService";
import { getUserTokens } from "@/services/TokensService";

export default async function Home() {
  const locale = await getLocale();
  const authResult: any = await authedOnly("/", "");
  const authContext = authResult.parsedJWT.ctx;
  const address = authResult.parsedJWT.sub;
  const userId = authContext.userId;
  const userLocale = authContext.lang;

  let mintedIds = [];
  if (authContext?.isMinter) {
    mintedIds = await getUserInstruments(userId, userLocale || locale || "en");
    // console.log("mintedIds", userId, mintedIds);
  }
  const owned = await getUserTokens(address);
  // console.log("owned", owned.map((token: any) => token.metadata.id));
  

  return authContext?.isMinter
    ? <Minter
        locale={locale}
        owned={owned}
        mintedIds={mintedIds}
        context={authResult.parsedJWT}
      /> :
      <User
        locale={locale}
        owned={owned}
        context={authResult.parsedJWT}
      />;
}
