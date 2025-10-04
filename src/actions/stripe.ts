"use server";

import type { Stripe } from "stripe";

import { headers } from "next/headers";

import { stripe } from "@/lib/stripe";
import { formatAmountForStripe } from "@/lib/stripe-helpers";

export async function createCheckoutSession(
  data: FormData,
): Promise<{ client_secret: string | null; url: string | null }> {
  const ui_mode = data.get(
    "uiMode",
  ) as Stripe.Checkout.SessionCreateParams.UiMode;

  const origin: string = headers().get("origin") as string;

  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "donate",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: process.env.NEXT_PUBLIC_CURRENCY || 'eur',
            product_data: {
              name: "Custom amount donation",
            },
            unit_amount: formatAmountForStripe(
              Number(data.get("customDonation") as string),
              process.env.NEXT_PUBLIC_CURRENCY || 'eur',
            ),
          },
        },
      ],
      ...(ui_mode === "hosted" && {
        success_url: `${origin}/donate-with-checkout/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/donate-with-checkout`,
      }),
      ...(ui_mode === "embedded" && {
        return_url: `${origin}/donate-with-embedded-checkout/result?session_id={CHECKOUT_SESSION_ID}`,
      }),
      ui_mode,
    });

  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  };
}

export async function createPaymentIntent(
  amount: number,
  address: string,
  name: string,
  id: string,
  minterAddress: string
): Promise<{ client_secret: string }> {
  const paymentIntent: Stripe.PaymentIntent =
    await stripe.paymentIntents.create({
      amount: formatAmountForStripe(
        amount,
        process.env.NEXT_PUBLIC_CURRENCY || 'eur',
      ),
      automatic_payment_methods: { enabled: true },
      currency: process.env.NEXT_PUBLIC_CURRENCY || 'eur',
      metadata: {
        address,
        name,
        id,
        minterAddress
      }
    });

  return { client_secret: paymentIntent.client_secret as string };
}