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
  const t = useTranslations();
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
        <h2 className='text-xl font-semibold text-center'>
            {t('components.PaymentResult.title')} #{id} {status === 'succeeded' ? t('components.PaymentResult.succesful') : t('components.PaymentResult.failed')}
        </h2>
        <div className='text-m text-center'>
          {
            status === 'succeeded' ?
            <div className="flex flex-col items-center justify-center">
              {
                instrument ?
                <p>
                  {t('components.PaymentResult.success_message_ready')}
                </p> : <>
                  <p>
                    {t('components.PaymentResult.success_message_loading')}
                  </p>
                  <Loading />
                </>
              }
            </div> :
            <div>
              <p>
                {t('components.PaymentResult.failed_message')}
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
                className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                onClick={() => router.push(`/`)}
              >
                {t('components.PaymentResult.home')}
              </button>
            }
          </div>
        </Section>
      }
    </Page>
  );
}
