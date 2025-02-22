"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import Page from "@/components/Page";
import Section from "@/components/Section";
import Loading from "@/components/Loading";
import { useStateContext } from "@/app/context";
// import PrintObject from "@/components/Stripe/PrintObject";


export default function PaymentResult(
  { status, address, id }: { status: string; address: string, id: string }
) {
  const t = useTranslations();
  const router = useRouter();
  const { isLoading } = useStateContext()

  if (isLoading) return (
    <Page>
      <div className="text-center">
        <Loading />
      </div>
    </Page>
  )

  return (
    <Page>
      <Section>
        <h2 className='text-xl font-semibold text-center'>
            {t('components.PaymentResult.title')} #{id} {status === 'succeeded' ? t('components.PaymentResult.succesful') : t('components.PaymentResult.failed')}
        </h2>
        <div className='text-m text-center'>
          {
            status === 'succeeded' ? 
            <p>
              {t('components.PaymentResult.success_message')}
            </p> : 
            <p>
              {t('components.PaymentResult.failed_message')}
            </p>
          }
        </div>
      </Section>
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
    </Page>
  );
}
