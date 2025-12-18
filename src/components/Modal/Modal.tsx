import React from 'react';
import { useTranslations } from "next-intl";
interface ModalItem {
  title: string;
  description: string;
}

interface ModalProps {
  isOpen: boolean;
  content: ModalItem | null;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, content, onClose }) => {
  const t = useTranslations('components.Modal');
  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="relative z-10 mx-4 px-4 py-6 border w-96 border-none rounded-section bg-us-25">
        <div className="text-left mb-6">
          <h2 className='text-xl font-bold mb-4 text-us-1000'>{content.title}</h2>
          <p className='text-sm text-us-700'>{content.description}</p>
        </div>
        <div className="flex justify-center">
          <button
          onClick={onClose}
          className="uppercase px-4 py-2 rounded-button outline-none focus:outline-none transition-all duration-150 cursor-pointer
          text-xs text-us-700 
          border-[0.1rem] border-us-100 active:border-us-300
          bg-transparent hover:bg-us-100 active:bg-us-200"
          type="button"
          >
            {t('close')}
          </button>
        </div>

      </div>
      <div onClick={onClose} className='absolute z-1 top-0 bottom-0 w-full'></div>
    </div>
  );
};

export default Modal;
