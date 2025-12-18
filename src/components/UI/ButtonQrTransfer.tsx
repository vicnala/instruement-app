"use client";

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from "next-intl";
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Info } from 'lucide-react';
import Modal from "@/components/Modal/Modal";
import { useModal } from "@/components/Modal/useModal";
import ButtonSpinner from "./ButtonSpinner";


export default function ButtonQrTransfer({
    address,
    locale,
    context
  }: Readonly<{
    address: string,
    locale: string,
    context: any
  }>)
{
  const t = useTranslations('components.UI.ButtonQrTransfer');
  const tAccount = useTranslations('components.Account.User');
  const { isModalOpen, modalContent, openModal, closeModal } = useModal();
  const activeAccount = context?.sub;
  const [isExpanded, setIsExpanded] = useState(false);
  const [timer, setTimer] = useState(180); // 3 minutes in seconds
  const [ owned, setOwned ] = useState([]);

  // Reset timer when expanded
  useEffect(() => {
    if (isExpanded) {
      setTimer(180);
    }
  }, [isExpanded]);

  // Countdown effect
  useEffect(() => {
    const getUserTokens = async () => {
      if (!activeAccount) return;
      try {
          const result = await fetch(`/api/tokens/${activeAccount}`);
          const data = await result.json();
          if (!owned.length) {
            setOwned(data);
            return;
          }

          if (data.length > owned.length) {
              const newInstrument = data.find((instrument: any) => {
                  // Check if this instrument's metadata.id is not in the owned array
                  return !owned.some((ownedId: any) => {
                      // Handle both cases: owned might be an array of strings (ids) or objects with metadata.id
                      if (typeof ownedId === 'string') {
                          return ownedId === instrument.metadata.id;
                      } else if (ownedId && typeof ownedId === 'object' && ownedId.metadata) {
                          return ownedId.metadata.id === instrument.metadata.id;
                      }
                      return false;
                  });
              });
              
              if (newInstrument) {
                  const { metadata: instrument } = newInstrument;
                  clearInterval(interval);
                  alert(tAccount("received_instrument", { name: instrument.name }));
                  document.location.replace(`/instrument/${instrument.id}`);
                  // router.replace(`/instrument/${instrument.id}`);
              }
          }
      } catch (error) { console.log('User.getUserTokens', error); }
    }

    if (!isExpanded) return;

    if (timer === 0) {
      setIsExpanded(false);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      if (timer % 5 === 0) {
        getUserTokens();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isExpanded, timer, owned, activeAccount, tAccount]);

  // Format timer as mm:ss
  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOpenInfoModal = () => {
    openModal({
      title: t('modals.share_account_what.title'),
      description: t('modals.share_account_what.description')
    });
  };

  return (
    <>
      <div>
        <div className="p-4 rounded-lg bg-scope-25 border-[0.1rem] border-scope-500 hover:bg-scope-50">
          <div className={`flex justify-between items-center ${isExpanded ? 'flex-col gap-4' : 'gap-2'}`}>
            <button
              onClick={handleToggleExpanded}
              className="grow bg-transparent transition-all duration-300 ease-in-out leading-[1.5]"
            >
              {!isExpanded && (
                <div className="flex items-center gap-2">
                  <QrCode className="text-scope-1000 h-6 w-6" />
                  <p className="text-scope-1000 text-base font-bold">{t('show_qr')}</p>
                </div>
              )}
              {isExpanded && (
                <>
                  <div className="p-2 bg-white"><QRCodeCanvas
                    value={address || ''}
                    size={250}
                    bgColor="#ffffff"
                    fgColor="#070605"
                  />
                  </div>
                  <div className="flex items-center justify-between mt-4 w-full">
                    <ButtonSpinner />
                    <span className="text-scope-600 text-xs font-medium">
                      {t('awaiting_transfer')}
                    </span>
                    <span className="text-scope-400 text-sm font-mono px-2 py-1 select-none">
                      {formatTime(timer)}
                    </span>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="flex justify-left mt-4">
          <div className="flex flex-col space-y-2" data-theme="us">
            <button
              onClick={handleOpenInfoModal}
              className="text-scope-400 hover:text-scope-700 text-sm flex items-center"
            >
              <Info className="h-5 w-5 mr-1" />
              {t('modals.share_account_what.preview')}
            </button>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} content={modalContent} onClose={closeModal} />
    </>
  );
}
