import { authedOnly } from "@/actions/login";
import NotFound from "@/app/not-found";
import DraftForm from "@/components/Drafts/DraftForm";

export default async function NewDraftPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const authResult: any = await authedOnly(`/drafts/new`);
  const authContext = authResult.parsedJWT.ctx;
  const isMinter = authContext.isMinter;
  
  return (
    isMinter ? <DraftForm locale={locale} /> : <NotFound />
  );
}
