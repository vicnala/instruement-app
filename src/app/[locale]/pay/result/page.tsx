import type { Stripe } from "stripe";
import { stripe } from "@/lib/stripe";
import PaymentResult from "@/components/pages/Pay/PaymentResult";

export default async function ResultPage({
  searchParams,
}: {
  searchParams: { payment_intent: string };
}): Promise<JSX.Element> {
  if (!searchParams.payment_intent)
    throw new Error("Please provide a valid payment_intent (`pi_...`)");

  const paymentIntent: Stripe.PaymentIntent =
    await stripe.paymentIntents.retrieve(searchParams.payment_intent);

  return <PaymentResult
    status={paymentIntent.status}
    address={paymentIntent.metadata.address}
    id={paymentIntent.metadata.id}
  />;
}