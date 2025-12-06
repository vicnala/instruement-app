import { useTranslations } from "next-intl";
import ButtonQrTransfer from "@/components/UI/ButtonQrTransfer";
import React from "react";

interface ReceiveInstrumentCardProps {
  address: string;
  locale: string;
  context: any;
}

const ReceiveInstrumentCard: React.FC<ReceiveInstrumentCardProps> = ({ address, locale, context }) => {
  const t = useTranslations('components.HomeIndex.User');

  return (
    <div className='p-6 rounded-section bg-scope-25 border border-scope-50' data-theme="it">
      <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-6">
        <div>
          <h2 className='text-3xl font-bold text-scope-1000 mb-2'>
            {t('no_instruments')}
          </h2>
          <p className="text-md mb-4 text-base text-us-700">
            {t('no_instruments_sub')}
          </p>
        </div>
        <div>
          <div className="flex items-center justify-center">
            <ButtonQrTransfer address={address} locale={locale} context={context} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveInstrumentCard;
