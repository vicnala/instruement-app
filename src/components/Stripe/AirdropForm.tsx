"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Instrument } from "@/lib/definitions";
import Page from "../Page";
import Section from "../Section";
import ConsentSection from "./ConsentSection";
import InstrumentView from "./InstrumentView";
import { useRouter } from "@/i18n/routing";
import ButtonSpinner from "../UI/ButtonSpinner";

function AirdropCheckoutForm({
  address,
  minterAddress,
  name,
  id,
  instrument
}: {
  address?: string,
  minterAddress: string,
  name: string,
  id: string,
  instrument: Instrument
 }): JSX.Element
{
  const t = useTranslations('components.AirdropForm');
  const locale = useLocale();
  const [consent, setConsent] = useState({
    terms: false,
    privacy: false
  });
  const router = useRouter();
  const [payment, setPayment] = useState<{status: "initial" | "processing" | "error";}>({ status: "initial" });
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleConsentChange = (field: 'terms' | 'privacy') => {
    setConsent(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const AirdropStatus = ({ status }: { status: string }) => {
    switch (status) {
      case "processing":
        return (
          <>
            <ButtonSpinner />
            <h2>{t('processing_title')}...</h2>
          </>
        );
      case "succeeded":
        return <h2>{t('airdrop_succeeded')}</h2>;
      case "error":
        return (
          <>
            <h2>{t('airdrop_error')}</h2>
            <p className="error-message">{errorMessage}</p>
          </>
        );

      default:
        return null;
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    try {
      e.preventDefault();

      if (!address || !minterAddress || !instrument) {
        setPayment({ status: "error" });
        setErrorMessage('Missing required fields');
        return;
      }

      setPayment({ status: "processing" });

      const result = await fetch(`/api/token/airdrop`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ address, name, id, instrument }),
      });

      const data = await result.json();

      if (data.code === 'success') {
        router.push(`/pay/result/airdrop?id=${id}&name=${name}`);
      } else {
        setPayment({ status: "error" });
        setErrorMessage(data.data.message);
      }
    } catch (err) {
      setPayment({ status: "error" });
      setErrorMessage((err as any).message ? (err as any).message : 'An unknown error occurred');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Section className="max-w-xl mx-auto mb-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold">{ t('title') }</h2>
            <p className="text-md sm:text-lg text-scope-700">{ t('subtitle') }</p>
          </div>
          <div className="mx-auto grid grid-cols-1 gap-6">
            <InstrumentView instrument={instrument} />
          </div>
        </Section>
        <Section className="max-w-lg mx-auto">
          <ConsentSection consent={consent} handleConsentChange={handleConsentChange} />
        </Section>
        <Section className="max-w-lg mx-auto">
          <div className="mx-auto">            
            <div className="text-right" data-theme="it">
                <button
                  className="
                  inline-flex items-center px-6 py-3 tracing-wide focus:outline-none
                  transition-all duration-200 transform hover:-translate-y-0.5 disabled:hover:-translate-y-0
                  hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--scope-500)_45%,transparent)]
                  disabled:shadow-none
                  text-scope-1000 font-bold disabled:text-us-200
                  bg-scope-500  hover:bg-scope-600 focus:bg-scope-600 disabled:bg-transparent
                  border-[0.1rem] border-scope-500 hover:border-scope-600 focus:border-scope-800 disabled:border-us-100
                  disabled:cursor-not-allowed
                  "
                  type="submit"
                  disabled={!consent.terms || !consent.privacy || payment.status !== "initial"}
                >
                  {t('register_now')}
                </button>
            </div>
          </div>
        </Section>
      </form>
      <Section>
        <AirdropStatus status={payment.status} />
      </Section>
    </>
  );
}

export default function AirdropForm(
  { id,
    urlAddress,
    minterAddress,
    instrument, 
  }: Readonly<
    { id: string,
      urlAddress?: string,
      minterAddress: string,
      instrument: Instrument,
    }>
): JSX.Element | null {
  const address = urlAddress || minterAddress;
  
  return (instrument && minterAddress && minterAddress) ? (
    <Page>
        <AirdropCheckoutForm
            address={address}
            minterAddress={minterAddress}
            name={instrument.title}
            id={id}
            instrument={instrument}
        />
    </Page>
  ) : null;
}