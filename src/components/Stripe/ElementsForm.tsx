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

import { createPaymentIntent } from "@/actions/stripe";
import getStripe from "@/lib/get-stripejs";
import { formatAmountForDisplay } from "@/lib/stripe-helpers";
import { Instrument } from "@/lib/definitions";
import Page from "../Page";
import Section from "../Section";
import Image from "next/image";


function CheckoutForm({ amount, address, id, instrument, minter }: { amount: number, address?: string, id: string, instrument: Instrument, minter: any }): JSX.Element {
  const locale = useLocale();
  const t = useTranslations('components.ElementsForm');

  const [input, setInput] = React.useState<{ cardholderName: string; }>({ cardholderName: "" });

  const [paymentType, setPaymentType] = React.useState<string>("");
  const [payment, setPayment] = React.useState<{status: "initial" | "processing" | "error";}>({ status: "initial" });
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [ready, setReady] = React.useState<boolean>(false);

  const stripe = useStripe();
  const elements = useElements();

  const currency = process.env.NEXT_PUBLIC_CURRENCY ? process.env.NEXT_PUBLIC_CURRENCY.toUpperCase() : "EUR";

  const [consent, setConsent] = React.useState({
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
      const { client_secret: clientSecret } = await createPaymentIntent(amount, address || '', id, minter.api_key);

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
            <p className="text-md sm:text-lg text-gray-600">{ t('subtitle') }</p>
          </div>
          <div className=" mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="grid grid-cols-3 gap-6 bg-it-50 border border-it-100 shadow-sm rounded-[15px] overflow-hidden">
                <div className="col-span-1">
                  <Image
                    src={instrument.cover_image.file_url}
                    alt={instrument.cover_image.description || 'Instrument cover image'}
                    width={300}
                    height={300}
                    className="object-cover"
                  />
                </div>
                <div className="col-span-2 py-4">
                  <h2 className="text-xl text-3xl font-semibold">
                    {instrument.title}
                  </h2>
                  <p className="text-gray-600">
                    {instrument.type_name}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <fieldset className="elements-style mx-auto">
                {paymentType === "card" ? (
                  <div className="flex flex-col gap-0 pb-3">
                    <label htmlFor="cardholderName" className="block text-md text-gray-1000">
                      {t('name')}
                    </label>
                    <input
                      placeholder={t('card_name')}
                      className="elements-style px-4 py-2 text-it-950 border border-gray-50 shadow-sm rounded-md focus:border-gray-400 focus:ring-it-300 focus:outline-none focus:ring focus:ring-opacity-40 placeholder:text-gray-700 placeholder:text-md"
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
        <Section>
          <div className="mx-auto">
            <div className="flex flex-col gap-3 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent.terms}
                  onChange={() => handleConsentChange('terms')}
                  className="w-4 h-4 text-it-500 rounded focus:ring-it-500"
                  aria-label={t('terms_consent')}
                />
                <span className="text-sm text-gray-600">
                  {t('i_accept')} <a href="https://instruement.com/terms-of-use/" className="text-it-500 hover:text-it-700 underline" target="_blank" rel="noopener noreferrer">{t('terms_of_use')}</a>
                </span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent.privacy}
                  onChange={() => handleConsentChange('privacy')}
                  className="w-4 h-4 text-it-500 rounded focus:ring-it-500"
                  aria-label={t('privacy_consent')}
                />
                <span className="text-sm text-gray-600">
                  {t('i_accept')} <a href="https://instruement.com/privacy-policy/" className="text-it-500 hover:text-it-700 underline" target="_blank" rel="noopener noreferrer">{t('privacy_policy')}</a>
                </span>
              </label>
            </div>
            
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
    context,
    instrument,
    minter,
    amount
  }: Readonly<
    { id: string,
      urlAddress?: string,
      context: any,
      instrument: Instrument,
      minter: any,
      amount: number
    }>
): JSX.Element | null {
  const t = useTranslations();
  const address = urlAddress || context.sub;
  const minterAddress = context.sub;
  
  return (instrument && minter && amount > 0 && minterAddress) ? (
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
          id={id}
          instrument={instrument}
          minter={minter}
        />
      </Elements>
    </Page>
  ) : null;
}