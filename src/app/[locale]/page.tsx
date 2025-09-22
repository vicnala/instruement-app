import Minter from "@/components/HomeIndex/Minter";
import User from "@/components/HomeIndex/User";
import { getLocale } from "next-intl/server";
import { authedOnly } from "@/actions/login";

export default async function Home() {
  const locale = await getLocale();
  const authResult: any = await authedOnly("/", "");
  const authContext = authResult.parsedJWT.ctx;

  const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instruments?user_id=${authContext.userId}&locale=${locale || "en"}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
    }
  });
  const data = await result.json()

  const minted = [];
  if (data?.code === 'success') {
    for (const id of data.data.ids) {
      const instrumentResult = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instrument/${id}?locale=${locale || "en"}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
        }
      });
      const instrumentData = await instrumentResult.json();
      if (instrumentData?.code === 'success') {
        const assetId = Number(instrumentData?.data?.asset_id);
        if (Number.isInteger(assetId) && assetId >= 0) {
          const token = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/token/${assetId}`)
          const tokenData = await token.json();
          minted.push(tokenData);
        }
      }
    }
  }
 
  return authContext?.isMinter
    ? <Minter locale={locale} minted={minted} />
    : <User locale={locale} minted={minted}/>;
}
