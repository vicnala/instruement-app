import type { Stripe } from "stripe";
import { stripe } from "@/lib/stripe";
import PaymentResult from "@/components/Pay/PaymentResult";
import NotFound from "@/app/not-found";
import { userAuthData } from "@/actions/login";

export default async function ResultPage({
  searchParams,
}: {
  searchParams: { payment_intent: string };
}): Promise<JSX.Element> {
  const authResult: any = await userAuthData();
  if (!searchParams.payment_intent) {
    return <NotFound />;
  }

  const paymentIntent: Stripe.PaymentIntent =
  await stripe.paymentIntents.retrieve(searchParams.payment_intent);

  
  return <PaymentResult
    status={paymentIntent.status}
    id={paymentIntent.metadata.id}
    name={paymentIntent.metadata.name}
    context={authResult.parsedJWT}
  />;
}