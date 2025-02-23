import { getLocale } from "next-intl/server";
import { authedOnly } from "@/actions/login";
import Instrument from "@/components/Instrument/Instrument";
import NotFound from "@/app/not-found";

export default async function InstrumentPage({
  searchParams,
  params: {  id },
}: {
  searchParams?: { to?: string };
  params: { locale: string, id: string };
}) {
  const locale = await getLocale();
  const authResult: any = await authedOnly("/");
  const authContext = authResult.parsedJWT.ctx;
  const isMinter = authContext.isMinter;
  const authUser = authContext.user;
  const userInstrumentIds = authUser.instruments || [];

  let requestedInstrumentId;
  try {
    requestedInstrumentId = parseInt(id);
  } catch (error) {
    return <NotFound />;
  }

  if (!userInstrumentIds.includes(requestedInstrumentId)) {
    return <NotFound />;
  }

  if (!isMinter) {
    return <NotFound />;
  }
  
  return <Instrument id={id} locale={locale} to={searchParams?.to} />;
}
