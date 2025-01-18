"use client";

import { useRef, useState } from 'react'
import { useTranslations } from "next-intl";
import { QRCodeCanvas } from 'qrcode.react'
import Page from "@/components/Page";
import Section from "@/components/Section";
import Modal from "@/components/Modal/Modal";
import { useModal } from "@/components/Modal/useModal";
import IconInfo from '@/components/Icons/Info';
import { useStateContext } from '@/app/context';
import NFTGrid, { NFTGridLoading } from '@/components/NFT/NFTGrid';


export default function User(
  { locale }: Readonly<{ locale: string }>
) {
  const t = useTranslations();
  const { address, owned, isLoading, setReloadUser } = useStateContext()
  const { isModalOpen, modalContent, openModal, closeModal } = useModal()
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState<string>()
  const [otpOk, setOTPOk] = useState(false)
  const [otp, setOTP] = useState<string>()
  const emailRef = useRef<HTMLInputElement>(null)
  const otpRef = useRef<HTMLInputElement>(null)

  const toggleFormVisibility = () => {
    setShowForm(prevState => !prevState)
  }

  const sendUserConfirmationOTP = async () => {
    // Send email to https://instruement.com/wp-json/instruement/v1/otp/send
    // On success show OTP input
    // Verify OTP with email at https://instruement.com/wp-json/instruement/v1/otp/verify
    // On verification success you get a user session key
    // With session key update user’s meta: priority to add eth address and is_verified and is_verified_date 
    // Reload page to get user by address at https://instruement.com/wp-json/instruement/v1/user/{address}
    if (!email) {
      return alert('No email')
    }

    try {
      const result = await fetch(`/api/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          locale,
        }),
      })
      const { code } = await result.json()
      code === 'success' && setOTPOk(true)
      if (emailRef && emailRef.current) emailRef.current.value = ''
    } catch (error) {
      console.log('sendUserConfirmationOTP', error)
    }
  }

  const sendUserOTPVerification = async () => {
    if (!otp) return alert('No OTP')
    try {
      const result = await fetch(`/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          address
        }),
      })

      const { code } = await result.json();
      if (code !== 'success') {
        alert('OTP verification failed');
      }
      if (otpRef && otpRef.current) otpRef.current.value = '';
      setReloadUser(true);
    } catch (error) {
      console.log('sendUserOTPVerification', error)
    }
  }

  const openShareScreen = (address: String) => {
    try {
      navigator.share({
        title: 'Instruement',
        text: `mailto:?subject=send_registration_request&body=${address}`,
        url: 'https://app.instruement.com'
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  return (
    <Page>
      <Section>
        <div>
          {
            isLoading ? (<NFTGridLoading />) :
              owned && owned.length ?
                <NFTGrid nftData={owned} /> :
                <>
                  <div className='bg-it-25 p-6 rounded-md mb-3.5 border border-it-100'>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h2 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-it-50 mb-2'>
                          {t('home.user.no_instruments')}
                        </h2>
                        <p className="text-md mb-4 text-base text-gray-900 dark:text-gray-500">
                          {
                            typeof navigator.share === 'function' ?
                              t('home.user.no_instruments_sub.qr')
                              :
                              t('home.user.no_instruments_sub.mailto')
                          }
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center">
                          <div>
                            <div className="p-4 rounded-xl bg-white border border-gray-50">
                              {
                                typeof navigator.share === 'function' ?
                                  <button
                                    onClick={() => openShareScreen(address || '')}
                                    className="bg-transparent"
                                  >
                                    <QRCodeCanvas
                                      value={address || ''}
                                      size={200}
                                      bgColor="#ffffff"
                                      fgColor="#070605"
                                    />
                                    <div className="pt-4">
                                      {t('home.user.qr.press_to_share')}
                                    </div>
                                  </button>
                                  :
                                  <>
                                    <div className="flex items-center">
                                      <input
                                        type="text"
                                        value={address}
                                        className="border border-r-0 border-it-400 p-2 rounded-l-md flex-grow"
                                        readOnly
                                      ></input>
                                      <button
                                        onClick={() => copyToClipboard(address || '')}
                                        className="border border-it-400 bg-it-400 text-white p-2 rounded-r-md hover:bg-it-600 hover:border-it-600"
                                      >
                                        {t('copy_to_clipboard')}
                                      </button>
                                    </div>
                                  </>
                              }
                            </div>
                            <div className="flex justify-left mt-4">
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={() => openModal({
                                    title: t('modals.share_account_what.title'),
                                    description: t('modals.share_account_what.description')
                                  })}
                                  className="inline-flex text-it-900 text-xs"
                                >
                                  <IconInfo height="1.2em" width="1.2em" className="mr-1" /> {t('modals.share_account_what.preview')}
                                </button>
                                <button
                                  onClick={() => openModal({
                                    title: t('modals.share_account_how.title'),
                                    description: t('modals.share_account_how.description')
                                  })}
                                  className="inline-flex text-it-900 text-xs"
                                >
                                  <IconInfo height="1.2em" width="1.2em" className="mr-1" /> {t('modals.share_account_how.preview')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-me-25 p-6 rounded-md mb-3.5 border border-me-100  dark:text-me-1000">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="mb-2 text-lg text-me-950 md:text-2xl font-bold">
                          {t('home.user.no_instrument.card3_title')}
                        </h5>
                        <p className="mb-4 text-sm text-me-950 sm:text-base">
                          {t('home.user.no_instrument.card3_text')}
                        </p>
                      </div>
                      <div className='flex items-center justify-center'>
                        {!showForm ? (
                          <div className="flex flex-col sm:flex-row justify-left items-center">
                            {/*
                            <div className="px-1">
                              <a
                                href={`https://instruement.com/apply-for-invitation/?address=${address}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center bg-transparent hover:bg-me-500 text-me-1000 border border-me-500 hover:border-me-500 font-bold py-2 px-4 rounded-md text-base"
                              >
                                {t('home.user.no_instrument.apply_invitation')}
                              </a>
                            </div> 
                            */}
                            <div className="px-1 mt-2 sm:mt-0 flex justify-center">
                              <button
                                onClick={toggleFormVisibility}
                                className="inline-flex items-center bg-transparent hover:bg-me-500 text-me-1000 border border-me-500 hover:border-me-500 font-bold py-2 px-4 rounded-md text-base"
                              >
                                {t('home.user.no_instrument.confirm_invitation')}
                              </button>
                            </div>
                          </div>
                        ) : !otpOk ? (
                          <div className="flex flex-grow">
                            <input
                              ref={emailRef}
                              type="email"
                              placeholder={t('home.user.no_instrument.enter_email')}
                              className="border border-me-600 p-2 rounded-l-md border-r-0 flex-grow"
                              onChange={(e) => { setEmail(e.target.value) }}
                            />
                            <button
                              onClick={() => sendUserConfirmationOTP()}
                              className="border border-me-600 bg-me-600 text-white font-semibold py-2 px-4 rounded-r-md hover:bg-me-700 hover:border-me-700"
                            >
                              {t('home.user.no_instrument.confirm_email')}
                            </button>
                            <button
                              onClick={toggleFormVisibility}
                              className="ml-2 border border-gray-300 text-gray-700 p-2 rounded-md hover:border-gray-800 hover:text-gray-1000"
                            >
                              {t('home.user.no_instrument.cancel_email')}
                            </button>
                          </div>
                        ) : (
                          <div className="flex">
                            <input
                              ref={otpRef}
                              type="text"
                              placeholder={t('home.user.no_instrument.confirm_otp')}
                              className="border border-me-600 p-2 rounded-l-md border-r-0 flex-grow"
                              onChange={(e) => { setOTP(e.target.value) }}
                            />
                            <button
                              onClick={() => sendUserOTPVerification()}
                              className="border border-me-600 bg-me-600 text-white font-semibold py-2 px-4 rounded-r-md hover:bg-me-700 hover:border-me-700"
                            >
                              {t('home.user.no_instrument.confirm_email')}
                            </button>
                            <button
                              onClick={toggleFormVisibility}
                              className="ml-2 border border-gray-300 text-gray-700 p-2 rounded-md hover:border-gray-800 hover:text-gray-1000"
                            >
                              {t('home.user.no_instrument.cancel_email')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Modal isOpen={isModalOpen} content={modalContent} onClose={closeModal} />
                </>
          }
        </div>
      </Section>
    </Page>
  );
}
