"use client";

import { useTranslations } from "next-intl";
import Page from "@/components/Page";
import Section from "@/components/Section";

export default function PaymentResult(
  { 
    context
  }: { 
    context: any
  }
) {
  const t = useTranslations('components.PaymentResult');

  return (
    <Page context={context}>
      <Section>
          <div className="flex flex-col items-center justify-center">
            <h1 className='text-4xl font-bold text-contrast dark:text-it-200 mb-2'>
              {t('processing_title')}
            </h1>
            <p className="text-base">
              {t('processing_message')}
            </p>
          </div>
      </Section>      
    </Page>
  );
}
