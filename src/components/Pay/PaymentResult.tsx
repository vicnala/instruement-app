"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import Page from "@/components/Page";
import Section from "@/components/Section";
import Loading from "@/components/Loading";
import { useStateContext } from "@/app/context";
import DraftService from "@/services/DraftService";
import { Instrument } from "@/lib/definitions";
// import PrintObject from "@/components/Stripe/PrintObject";


export default function PaymentResult(
  { status, address, id }: { status: string; address: string, id: string }
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
    <Page>
      <Section>
        { status === 'succeeded' ? (
          <>
            <h1 className='text-4xl font-bold text-contrast dark:text-it-200 mb-2'>
              {t('title_thank_you')}
            </h1>
            <p className="text-base">
              {t('success_message_received', { title: instrument?.title })}
            </p>
          </>
        ) : (
          <>
            <h1 className='text-4xl font-bold text-contrast dark:text-it-200 mb-2'>
              {t('title_failed')}
            </h1>
            <p className="text-base">
              {t('failed_message')}
            </p>
          </>
        )}

        <div className='text-m text-center'>
          {
            status === 'succeeded' ?
            <>
              {
                instrument ?
                <p className="text-lg">
                  {t('success_message_ready')}
                </p> 
                : 
                <p className="flex items-center justify-center gap-2 text-lg">
                  <Loading />
                  {t('success_message_loading')}
                </p>
              }
            </> 
            :
            <>
              <p>
                {t('failed_message')}
              </p>
            </>
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
                onClick={() => router.push(`/instrument/${instrument.asset_id}`)}
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
