"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Instrument } from "@/lib/definitions";
import Page from "../Page";
import Section from "../Section";
import ConsentSection from "./ConsentSection";
import InstrumentView from "./InstrumentView";
import { useRouter } from "@/i18n/routing";

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
  const t = useTranslations('components.ElementsForm');
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

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    try {
      e.preventDefault();

      if (!address || !minterAddress || !instrument) {
        setPayment({ status: "error" });
        setErrorMessage('Missing required fields');
        return;
      }

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
        <Section>
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold">{ t('title') }</h2>
            <p className="text-md sm:text-lg text-gray-600">{ t('airdrop_subtitle') }</p>
          </div>
          <div className=" mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InstrumentView instrument={instrument} />
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">{ t('airdrop_subtitle') }</h3>
              <p className="text-md sm:text-lg text-gray-600">{ t('airdrop_explanation') }</p>
            </div>
          </div>
        </Section>
        <ConsentSection consent={consent} handleConsentChange={handleConsentChange} />
        <Section>
          <div className="mx-auto">            
            <div className="text-right">
                <button
                  className="inline-flex items-center text-lg px-6 py-3 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                  type="submit"
                  disabled={!consent.terms || !consent.privacy || payment.status !== "initial"}
                >
                  {t('airdrop_pay')}
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