import React from 'react';
import { useTranslations } from "next-intl";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, children }) => {
  const t = useTranslations();
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <button
          className="absolute top-4 right-4 p-2 text-2xl bg-white text-black"
          onClick={onClose}
        >
          {t('components.Instrument.close')}
        </button>
        <div className="p-4">{children}</div>
    </div>
  );
};
export default QRModal;