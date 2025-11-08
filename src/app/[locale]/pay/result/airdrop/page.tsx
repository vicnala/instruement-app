import PaymentResult from "@/components/Pay/PaymentResult";
import NotFound from "@/app/not-found";
import { userAuthData } from "@/actions/login";

export default async function ResultPage({
  searchParams,
}: {
  searchParams: { id: string, name: string };
}): Promise<JSX.Element> {
  const authResult: any = await userAuthData();
  if (!authResult?.parsedJWT?.sub || !searchParams.id || !searchParams.name) {
    return <NotFound />;
  }
  
  return <PaymentResult
    status="succeeded"
    id={searchParams.id}
    name={searchParams.name}
    context={authResult.parsedJWT}
  />;
}