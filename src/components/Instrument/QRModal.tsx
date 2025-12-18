import React, { useEffect } from 'react';
import { useTranslations } from "next-intl";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, children }) => {
  const t = useTranslations();
  
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
    
    return () => {
      document.body.classList.remove('focus-mode');
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/80">
        <button
          className="absolute top-4 right-4 px-2 py-1 text-md bg-transparent text-we-300 border-[0.1rem] border-we-500 rounded-button"
          onClick={onClose}
        >
          {t('components.Instrument.close')}
        </button>
        <div className="p-4">{children}</div>
    </div>
  );
};
export default QRModal;