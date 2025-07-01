import { useTranslations } from "next-intl";
import ButtonQrTransfer from "@/components/UI/ButtonQrTransfer";
import React from "react";

interface ReceiveInstrumentCardProps {
  address: string;
  locale: string;
}

const ReceiveInstrumentCard: React.FC<ReceiveInstrumentCardProps> = ({ address, locale }) => {
  const t = useTranslations('components.HomeIndex.User');

  return (
    <div className='p-6 rounded-[15px] md:mb-6 border border-it-100 dark:border-gray-900 bg-it-50 dark:bg-gray-900'>
      <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-6">
        <div>
          <h2 className='text-4xl font-bold text-contrast dark:text-it-200 mb-2'>
            {t('no_instruments')}
          </h2>
          <p className="text-md mb-4 text-base text-gray-900 dark:text-gray-300">
            {t('no_instruments_sub')}
          </p>
        </div>
        <div>
          <div className="flex items-center justify-center">
            <ButtonQrTransfer address={address} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveInstrumentCard;
