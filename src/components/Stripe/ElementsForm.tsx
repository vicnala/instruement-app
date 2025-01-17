"use client";

import type { StripeError } from "@stripe/stripe-js";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from "@stripe/react-stripe-js";

import { useStateContext } from "@/app/context";
import { createPaymentIntent } from "@/actions/stripe";
import getStripe from "@/lib/get-stripejs";
import { formatAmountForDisplay } from "@/lib/stripe-helpers";
import { Instrument } from "@/lib/definitions";
import Page from "../Page";
import Loading from "../Loading";

function CheckoutForm({ amount, address, id, minterAddress }: { amount: number, address?: string, id: string, minterAddress: string }): JSX.Element {
  const locale = useLocale();
  const t = useTranslations();
  const [input, setInput] = React.useState<{ cardholderName: string; }>({ cardholderName: "" });

  const [paymentType, setPaymentType] = React.useState<string>("");
  const [payment, setPayment] = React.useState<{
    status: "initial" | "processing" | "error";
  }>({ status: "initial" });
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const stripe = useStripe();
  const elements = useElements();

  const PaymentStatus = ({ status }: { status: string }) => {
    switch (status) {
      case "processing":
      case "requires_payment_method":
      case "requires_confirmation":
        return <h2>Processing...</h2>;

      case "requires_action":
        return <h2>Authenticating...</h2>;

      case "succeeded":
        return <h2>Payment Succeeded 🥳</h2>;

      case "error":
        return (
          <>
            <h2>Error 😭</h2>
            <p className="error-message">{errorMessage}</p>
          </>
        );

      default:
        return null;
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setInput({
      ...input,
      [e.currentTarget.name]: e.currentTarget.value,
    });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    try {
      e.preventDefault();
      // Abort if form isn't valid
      if (!e.currentTarget.reportValidity()) return;
      if (!elements || !stripe) return;

      setPayment({ status: "processing" });

      const { error: submitError } = await elements.submit();

      if (submitError) {
        setPayment({ status: "error" });
        setErrorMessage(submitError.message ?? "An unknown error occurred");

        return;
      }

      // Create a PaymentIntent with the specified amount.
      const { client_secret: clientSecret } = await createPaymentIntent(amount, address || '', id, minterAddress);

      // Use your card Element with other Stripe.js APIs
      const { error: confirmError } = await stripe!.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/${locale}/pay/result`,
          payment_method_data: {
            billing_details: {
              name: input.cardholderName,
            },
          },
        },
      });

      if (confirmError) {
        setPayment({ status: "error" });
        setErrorMessage(confirmError.message ?? "An unknown error occurred");
      }
    } catch (err) {
      const { message } = err as StripeError;

      setPayment({ status: "error" });
      setErrorMessage(message ?? "An unknown error occurred");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <fieldset className="elements-style">
          <legend>Your payment details:</legend>
          {paymentType === "card" ? (
            <div className="p-6 flex flex-col gap-2">
              <input
                placeholder="Cardholder name"
                className="elements-style"
                type="Text"
                name="cardholderName"
                onChange={handleInputChange}
                required
              />
            </div>
          ) : null}
          <div className="FormRow elements-style">
            <PaymentElement
              onChange={(e) => {
                setPaymentType(e.value.type);
              }}
            />
          </div>
        </fieldset>
        <button
          className="elements-style-background"
          type="submit"
          disabled={
            !["initial", "succeeded", "error"].includes(payment.status) ||
            !stripe
          }
        >
          Pay {formatAmountForDisplay(amount, "EUR")}
        </button>
      </form>
      <PaymentStatus status={payment.status} />
    </>
  );
}

export default function ElementsForm(
  { locale, id, address }: Readonly<{ locale: string, id: string, address?: string }>
): JSX.Element {
  const t = useTranslations();
  const { address: minterAddress, minter, isLoading } = useStateContext()
  const [instrument, setInstrument] = React.useState<Instrument>()
  const [amount, setAmount] = React.useState<number>(0)


  React.useEffect(() => {
    const getInstrument = async () => {     
      try {
        const result = await fetch(`/api/instrument/${id}`, {
          method: "GET",
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        const { data } = await result.json()
        // console.log("GET", `/api/instrument/${id}`, data.data);

        if (data.code !== 'success') {
          console.log(`GET /api/instrument/${id} ERROR`, data.message);
          alert(`Error: ${data.message}`);
        } else {
          const _instrument = data.data;
          const type = minter?.instrument_types.find((ins: any) => ins.slug === _instrument.type);
          if (type) {
            setAmount(type.user_register_price_eur);
          }
          setInstrument(_instrument);
        }
      } catch (error: any) {
        console.log(`POST /api/instrument/${id} ERROR`, error.message)
        alert(`Error: ${error.message}`);
      } 
    }
    if (id && minter && !instrument) {
      getInstrument();
    }
  }, [id, minter, instrument]);

  if (isLoading) return (
    <Page>
      <div className="text-center">
        <Loading />
      </div>
    </Page>
  )

  return (instrument && minter && amount > 0 &&
    <Elements
      stripe={getStripe()}
      options={{
        appearance: {
          variables: {
            colorIcon: "#6772e5",
            fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
          },
        },
        currency: process.env.NEXT_PUBLIC_CURRENCY || 'eur',
        mode: "payment",
        amount: Math.round((amount * 100)),
      }}
    >
      <CheckoutForm amount={amount} address={address} id={id} minterAddress={minterAddress || ''} />
    </Elements>
  );
}