"use client";

import { useState } from "react";
import type { StripeError } from "@stripe/stripe-js";
import { useLocale, useTranslations } from "next-intl";
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from "@stripe/react-stripe-js";

import { createPaymentIntent } from "@/actions/stripe";
import getStripe from "@/lib/get-stripejs";
import { formatAmountForDisplay } from "@/lib/stripe-helpers";
import { Instrument } from "@/lib/definitions";
import Page from "../Page";
import Section from "../Section";
import ConsentSection from "./ConsentSection";
import InstrumentView from "./InstrumentView";

function CheckoutForm({
    amount,
    address,
    minterAddress,
    name,
    id,
    instrument
  }: { amount: number,
    address?: string,
    minterAddress: string,
    name: string,
    id: string,
    instrument: Instrument
   }): JSX.Element
{
  const locale = useLocale();
  const t = useTranslations('components.ElementsForm');

  const [input, setInput] = useState<{ cardholderName: string; }>({ cardholderName: "" });

  const [paymentType, setPaymentType] = useState<string>("");
  const [payment, setPayment] = useState<{status: "initial" | "processing" | "error";}>({ status: "initial" });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [ready, setReady] = useState<boolean>(false);

  const stripe = useStripe();
  const elements = useElements();

  const currency = process.env.NEXT_PUBLIC_CURRENCY ? process.env.NEXT_PUBLIC_CURRENCY.toUpperCase() : "EUR";

  const [consent, setConsent] = useState({
    terms: false,
    privacy: false
  });

  const handleConsentChange = (field: 'terms' | 'privacy') => {
    setConsent(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const PaymentStatus = ({ status }: { status: string }) => {
    switch (status) {
      case "processing":
      case "requires_payment_method":
      case "requires_confirmation":
        return <h2>{t("requires_confirmation")}...</h2>;

      case "requires_action":
        return <h2>{t('requires_action')}...</h2>;

      case "succeeded":
        return <h2>{t('payment_succeeded')} 🥳</h2>;

      case "error":
        return (
          <>
            <h2>{t('payment_error')}</h2>
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
      const { client_secret: clientSecret } = await createPaymentIntent(amount, address || '', name, id, minterAddress);

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
        <Section>
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold">{ t('title') }</h2>
            <p className="text-md sm:text-lg text-scope-700">{ t('subtitle') }</p>
          </div>
          <div className=" mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InstrumentView instrument={instrument} />
            <div>
              <fieldset className="elements-style mx-auto">
                {paymentType === "card" ? (
                  <div className="flex flex-col gap-0 pb-3">
                    <label htmlFor="cardholderName" className="block text-md text-scope-1000">
                      {t('name')}
                    </label>
                    <input
                      placeholder={t('card_name')}
                      className="elements-style px-4 py-2 text-it-950 border border-scope-50 shadow-sm rounded-md focus:border-gray-400 focus:ring-it-300 focus:outline-none focus:ring focus:ring-opacity-40 placeholder:text-scope-600 placeholder:text-md"
                      type="Text"
                      name="cardholderName"
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ) : null}
                <div className="FormRow elements-style">
                  <PaymentElement
                    onReady={(el) => setReady(true)}
                    onChange={(e) => setPaymentType(e.value.type)}
                  />
                </div>
              </fieldset>
            </div>
          </div>
        </Section>
        <ConsentSection consent={consent} handleConsentChange={handleConsentChange} />
        <Section>
          <div className="mx-auto">            
            <div className="text-right">
              {ready && (
                <button
                  className="inline-flex items-center text-lg px-6 py-3 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                  type="submit"
                  disabled={
                    !["initial", "succeeded", "error"].includes(payment.status) ||
                    !stripe ||
                    !consent.terms ||
                    !consent.privacy
                  }
                >
                  {t('pay')} {formatAmountForDisplay(amount, currency)}
                </button>
              )}
            </div>
          </div>
        </Section>
      </form>
      <Section>
        <PaymentStatus status={payment.status} />
      </Section>
    </>
  );
}

export default function ElementsForm(
  { id,
    urlAddress,
    minterAddress,
    instrument, 
    amount
  }: Readonly<
    { id: string,
      urlAddress?: string,
      minterAddress: string,
      instrument: Instrument,
      amount: number
    }>
): JSX.Element | null {
  const address = urlAddress || minterAddress;
  
  return (instrument && minterAddress && amount > 0 && minterAddress) ? (
    <Page>
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
        <CheckoutForm 
          amount={amount}
          address={address}
          minterAddress={minterAddress}
          name={instrument.title}
          id={id}
          instrument={instrument}
        />
      </Elements>
    </Page>
  ) : null;
}