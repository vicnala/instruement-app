"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import Page from "@/components/Page";
import Section from "@/components/Section";
import DraftService from "@/services/DraftService";
import { Instrument } from "@/lib/definitions";


export default function PaymentResult(
  { 
    status,
    id,
    name,
    context
  }: { 
    status: string;
    id: string;
    name: string;
    context: any
  }
) {
  const t = useTranslations('components.PaymentResult');
  const router = useRouter();
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
        { status === 'succeeded' ? (
          <div className="flex flex-col items-center justify-center">
            <h1 className='text-4xl font-bold text-contrast dark:text-it-200 mb-2'>
              {t('title_thank_you')}
            </h1>
            <p className="text-base">
              {t('success_message_received', { title: name })}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <h1 className='text-4xl font-bold text-contrast dark:text-it-200 mb-2'>
              {t('title_failed')}
            </h1>
            <p className="text-base">
              {t('failed_message')}
            </p>
          </div>
        )}

        <div className='text-m text-center'>
          {
            status === 'succeeded' ?
            <div className="flex flex-col items-center justify-center">
              {
                instrument ?
                <p className="text-lg">
                  {t('success_message_ready')}
                </p> 
                : 
                <div className="flex items-center justify-center gap-2 text-lg">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                          
                      </span>
                  </div>
                  {t('success_message_loading')}
                </div>
              }
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
          <div className="mt-6 text-center">
            {
              <button
                type="button"
                className="font-bold inline-flex items-center px-4 py-2 tracking-wide transition-colors duration-200 transform rounded-md focus:outline-none text-it-1000 dark:text-it-500 border-[0.1rem] border-it-500 hover:bg-it-500 hover:text-it-1000 dark:hover:text-it-1000 focus:bg-it-500 focus:text-it-600 dark:focus:text-it-800"
                onClick={() => {
                  router.push(`/instrument/${instrument.asset_id}`);
                }}
              >
                {t('go_to_instrument')}
              </button>
            }
          </div>
        </Section>
      }
    </Page>
  );
}
