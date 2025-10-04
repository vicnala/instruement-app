import { authedOnly } from "@/actions/login";
import NotFound from "@/app/not-found";
import Preview from "@/components/Drafts/Preview";

export default async function PreviewPage({
  params: { locale, id },
}: {
  params: { locale: string, id: string };
}) {
  const authResult: any = await authedOnly(`/preview/${id}`, "");
  const authContext = authResult.parsedJWT.ctx;
  const isMinter = authContext.isMinter;
  
  if (!isMinter) {
    return <NotFound />;
  }

  return <Preview id={id} locale={locale} context={authResult.parsedJWT} />;
}
