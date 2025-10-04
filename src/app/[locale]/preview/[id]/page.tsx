import { authedOnly } from "@/actions/login";
import NotFound from "@/app/not-found";
import Preview from "@/components/Drafts/Preview";
import { getUser } from "@/services/UsersService";

export default async function PreviewPage({
  params: { locale, id }
}: {
  params: { locale: string, id: string };
}) {
  const authResult: any = await authedOnly(`/preview/${id}`, "");
  const context = authResult.parsedJWT;
  
  let userData;
  try {
    userData = await getUser(authResult.parsedJWT.sub);
  } catch (error: any) {
    console.error("/user fetch error", error.message);
    return <NotFound />;
  }

  return <Preview
    id={id}
    locale={locale}
    context={context}
    minter={userData.data}
  />;
}
