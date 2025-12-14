"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Page from "@/components/Page";
import Section from "@/components/Section";
import DraftService from "@/services/DraftService";
import { Instrument } from "@/lib/definitions";
import { TransitionLink } from "@/components/UI/TransitionLink";
import { House } from "lucide-react";
import ButtonSpinner from "@/components/UI/ButtonSpinner";

export default function PaymentResult(
  { 
    status,
    id,
    name,
    context,
    paymentType = "payment"
  }: { 
    status: string;
    id: string;
    name: string;
    context: any;
    paymentType?: "payment" | "airdrop";
  }
) {
  const t = useTranslations('components.PaymentResult');
  const locale = useLocale();
  const [instrument, setInstrument] = useState<Instrument>();

  useEffect(() => {
    const getInstrument = async () => {
      try {
        const { data } = await DraftService.getInstrument(id, locale);
        if (data.data.code === 'success' && data.data.data.asset_id) {
          setInstrument(data.data.data);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error fetching instrument", error);
        return false;
      }
    }

    const pollInterval = setInterval(async () => {
      const hasAssetId = await getInstrument();
      if (hasAssetId) {
        clearInterval(pollInterval);
      }
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  }, [id, locale]);

  return (
    <Page context={context}>
      <Section>
        {!instrument && (
          status === 'succeeded' ? (
            <div className="flex flex-col items-center justify-center max-w-md mx-auto">
              <h1 className='text-4xl font-bold text-contrast dark:text-it-200 mb-2'>
                {t('title_thank_you')}
              </h1>
              <p className="text-base">
                {paymentType === "airdrop" 
                  ? t('success_message_received_airdrop', { title: name })
                  : t('success_message_received', { title: name })
                }
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center max-w-md mx-auto">
              <h1 className='text-4xl font-bold text-contrast dark:text-it-200 mb-2'>
                {t('title_failed')}
              </h1>
              <p className="text-base">
                {t('failed_message')}
              </p>
              <TransitionLink 
              href="/" 
              locale={locale} 
              className="mt-6 inline-flex items-center px-4 py-2 mb-6 transition-colors duration-200 transform focus:outline-none 
              rounded-button 
              text-base text-scope-500 hover:text-scope-1000  
              border-[0.1rem] border-scope-500 
              bg-transparent hover:bg-scope-500 
              focus:bg-scope-500 focus:text-scope-1000" 
              aria-label={t('go_back_to_home')}>
                <House className="w-4 h-4 mr-2" />
                {t('go_back_to_home')}
              </TransitionLink>
            </div>
          )
        )}

        <div className='text-md text-center pt-6'>
          {
            status === 'succeeded' ?
            <div className="flex flex-col items-center justify-center">
              {!instrument && (
                <div className="flex items-center justify-center gap-2 text-lg">
                  <ButtonSpinner />
                  {t('success_message_loading')}
                </div>
              )}
            </div>
            :
            <div className="flex flex-col items-center justify-center">
              <p>
                {t('failed_message')}
              </p>
            </div>
          }
        </div>
      </Section>
      {
        instrument && 
        <Section>
          <div data-theme="it" className="mt-6 text-center rounded-section bg-scope-50 border border-scope-100 p-4 mb-12 max-w-xl mx-auto">
            <div className="flex flex-col items-center justify-center mb-6">
              <h3 className="text-2xl font-bold text-scope-1000 mb-2">
                {t('success_message_ready_title')}
              </h3>
              <p className="text-lg">
                {t('success_message_ready')}
              </p>
            </div>
            <TransitionLink
              href={`/instrument/${instrument.asset_id}`}
              locale={locale}
              className="font-bold inline-flex items-center px-4 py-2 mb-6 transition-colors duration-200 transform focus:outline-none 
              rounded-button 
              text-scope-500 hover:text-scope-1000  
              border-[0.1rem] border-scope-500 
              bg-transparent hover:bg-scope-500 
              focus:bg-scope-500 focus:text-scope-1000"
              aria-label={t('go_to_instrument')}
            >
              {t('go_to_instrument')}
            </TransitionLink>
          </div>
        </Section>
      }
    </Page>
  );
}
