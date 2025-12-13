import Minter from "@/components/Account/Minter";
import User from "@/components/Account/User";
import { getLocale } from "next-intl/server";
import { authedOnly } from "@/actions/login";
import { getUser } from "@/services/UsersService";
import NotFound from "@/app/not-found";

type Props = {
  searchParams: Promise<{ invite?: string, ticket?: string }>
}

export default async function AccountPage({ searchParams }: Props) {
  const locale = await getLocale();
  const { invite, ticket } = await searchParams;
  
  const authResult: any = await authedOnly("/account", invite || undefined, ticket || undefined);

  const authContext = authResult.parsedJWT.ctx;
  const isMinter = authContext.isMinter;

  let userData;
  try {
    userData = await getUser(authResult.parsedJWT.sub);
  } catch (error: any) {
    console.error("/user fetch error", error.message);
    return <NotFound />;
  }

  return isMinter ? 
    <Minter locale={locale} context={authResult.parsedJWT} minter={userData.data} /> :
    <User locale={locale} invite={invite} ticket={ticket} context={authResult.parsedJWT} />
}
