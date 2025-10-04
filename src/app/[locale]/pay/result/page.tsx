import type { Stripe } from "stripe";
import { stripe } from "@/lib/stripe";
import PaymentResult from "@/components/Pay/PaymentResult";

export default async function ResultPage({
  searchParams,
}: {
  searchParams: { payment_intent: string };
}): Promise<JSX.Element> {

  if (!searchParams.payment_intent) {
    // throw new Error("Please provide a valid payment_intent (`pi_...`)");
    return <></>;
  }

  const paymentIntent: Stripe.PaymentIntent =
  await stripe.paymentIntents.retrieve(searchParams.payment_intent);

  
  return <PaymentResult
    status={paymentIntent.status}
    id={paymentIntent.metadata.id}
    name={paymentIntent.metadata.name}
  />;
}