import DraftForm from "@/components/Drafts/DraftForm";
import { authedOnly } from "@/actions/login";
import NotFound from "@/app/not-found";

export default async function DraftEditPage({
  params: { locale, id },
}: {
  params: { locale: string, id: string };
}) {
  const authResult: any = await authedOnly(`/drafts/${id}`);
  const authContext = authResult.parsedJWT.ctx;
  const isMinter = authContext.isMinter;

  return (
    isMinter ? <DraftForm locale={locale} instrumentId={id} /> : <NotFound />
  );
}
