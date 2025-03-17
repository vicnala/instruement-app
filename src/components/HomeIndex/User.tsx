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
import NFTGrid from '@/components/NFT/NFTGrid';
import NotConnected from '../NotConnected';
import ButtonSpinner from '@/components/UI/ButtonSpinner';
import FormSaveButton from '@/components/UI/FormSaveButton';
import { OTPForm } from "@/components/UI/OtpInput";
import { CircleCheck } from 'lucide-react';
import { logout } from '@/actions/login';

export default function User(
  { locale }: Readonly<{ locale: string }>
) {
  const t = useTranslations('components.HomeIndex.User');
  const { address, owned, isLoading, setReloadUser } = useStateContext()
  const { isModalOpen, modalContent, openModal, closeModal } = useModal()
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState<string>('')
  const [isValidEmail, setIsValidEmail] = useState(false)
  const [otpOk, setOTPOk] = useState(false)
  const [otp, setOTP] = useState<string>('')
  const [isValidOTP, setIsValidOTP] = useState(false)
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false)
  const [otpError, setOtpError] = useState<string>('')
  const [isSendingOTP, setIsSendingOTP] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const otpRef = useRef<HTMLInputElement>(null)
  const emailButtonRef = useRef<HTMLButtonElement>(null)
  const otpButtonRef = useRef<HTMLButtonElement>(null)

  const toggleFormVisibility = () => {
    setShowForm(prevState => !prevState)
  }

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // OTP validation function
  const validateOTP = (otp: string) => {
    const otpRegex = /^\d{6}$/
    return otpRegex.test(otp)
  }

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    setIsValidEmail(validateEmail(newEmail))
  }

  // Handle OTP change
  const handleOTPChange = (value: string) => {
    setOTP(value)
    setIsValidOTP(validateOTP(value))
  }

  const sendUserConfirmationOTP = async () => {
    // Send email to https://instruement.com/wp-json/instruement/v1/otp/send
    // On success show OTP input
    // Verify OTP with email at https://instruement.com/wp-json/instruement/v1/otp/verify
    // On verification success you get a user session key
    // With session key update user's meta: priority to add eth address and is_verified and is_verified_date 
    // Reload page to get user by address at https://instruement.com/wp-json/instruement/v1/user/{address}
    if (!email) {
      return setOtpError(t('luthier.errors.no_valid_email'))
    }

    try {
      setOtpError('')
      setIsSendingOTP(true)
      const result = await fetch(`/api/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          locale,
        }),
      })
      const data = await result.json()
      
      if (data.code === 'success') {
        setOTPOk(true)
        if (emailRef && emailRef.current) emailRef.current.value = ''
      } else {
        setOtpError(data.message || t('luthier.errors.otp_failed'))
      }
    } catch (error) {
      console.log('sendUserConfirmationOTP', error)
      setOtpError(t('luthier.errors.otp_failed'))
    } finally {
      setIsSendingOTP(false)
      if (emailButtonRef.current) emailButtonRef.current.blur()
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
          address,
          accepted_terms: privacyPolicyAccepted
        }),
      })

      const { code } = await result.json();
      if (code !== 'success') {
        alert('OTP verification failed');
      }
      if (otpRef && otpRef.current) otpRef.current.value = '';
      setReloadUser(true);
      await logout();
    } catch (error) {
      console.log('sendUserOTPVerification', error)
    } finally {
      if (otpButtonRef.current) otpButtonRef.current.blur()
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
            isLoading ? 
            (
              <div className="flex justify-center items-center h-full">
                <ButtonSpinner />
              </div>
            ) :
              owned && owned.length ?
                <div className="flex flex-col pt-4">
                  <NFTGrid nftData={owned} />
                </div> :
                address ?
                <>
                  <div className='p-6 rounded-[15px] mb-4 md:mb-6 border border-it-100 dark:border-it-800 bg-it-50 dark:bg-gray-950'>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h2 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-it-200 mb-2'>
                          {t('no_instruments')}
                        </h2>
                        <p className="text-md mb-4 text-base text-gray-900 dark:text-gray-300">
                          {t('no_instruments_sub.qr')}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center">
                          <div>
                            <div className="p-4 rounded-xl bg-white border border-gray-50">
                              <button
                                onClick={() => copyToClipboard(address || '')}
                                className="bg-transparent"
                              >
                                <QRCodeCanvas
                                  value={address || ''}
                                  size={200}
                                  bgColor="#ffffff"
                                  fgColor="#070605"
                                />
                                <div className="pt-4 text-gray-500">
                                  {t('share.copy_to_clipboard')}
                                </div>
                              </button>
                              {/* {
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
                                      {t('qr.press_to_share')}
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
                                        {t('share.copy_to_clipboard')}
                                      </button>
                                    </div>
                                  </>
                              } */}
                            </div>
                            <div className="flex justify-left mt-4">
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={() => openModal({
                                    title: t('modals.share_account_what.title'),
                                    description: t('modals.share_account_what.description')
                                  })}
                                  className="inline-flex text-gray-500 dark:text-gray-500 text-sm"
                                >
                                  <IconInfo height="1.2em" width="1.2em" className="mr-1" /> 
                                  {t('modals.share_account_what.preview')}
                                </button>
                                
                                <button
                                  onClick={() => openModal({
                                    title: t('modals.share_account_how.title'),
                                    description: t('modals.share_account_how.description')
                                  })}
                                  className="inline-flex text-gray-500 dark:text-gray-500 text-sm"
                                >
                                  <IconInfo height="1.2em" width="1.2em" className="mr-1" /> 
                                  {t('modals.share_account_how.preview')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-[15px] mb-3.5 border border-me-100 dark:border-me-800 bg-me-25 dark:bg-gray-950">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="mb-2 text-2xl md:text-3xl text-me-1000 dark:text-me-200 font-bold">
                          {t('luthier.title')}
                        </h3>
                        <p className="mb-4 text-md text-gray-900 dark:text-gray-300 ">
                          {t('luthier.description')}
                        </p>
                      </div>
                      <div className='flex items-center justify-center'>
                        {!showForm ? (
                          <div className="flex flex-col sm:flex-row justify-left items-center">
                            <div className="px-1 mt-2 sm:mt-0 flex justify-center">
                              <button
                                onClick={toggleFormVisibility}
                                className="inline-flex items-center text-me-1000 hover:text-me-1000 dark:text-me-200 dark:hover:text-me-1000   bg-transparent hover:bg-me-400 border-2 border-me-400 font-bold py-2 px-4 rounded-md text-base"
                              >
                                {t('luthier.confirm_invitation_do')}
                              </button>
                            </div>
                          </div>
                        ) : !otpOk ? (
                          <div className="flex flex-col w-full">
                            <label htmlFor="business-email" className="block text-md font-bold text-me-1000 dark:text-me-200 mb-1">
                              {t('luthier.confirm_invitation_email_label')}
                            </label>
                            <div className="relative">
                              <input
                                ref={emailRef}
                                type="email"
                                id="business-email"
                                placeholder={t('luthier.confirm_invitation_email_placeholder')}
                                className="border border-me-600 p-2 rounded-md w-full pr-10"
                                onChange={handleEmailChange}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <CircleCheck 
                                  className={`h-6 w-6 ${email ? (isValidEmail ? 'text-green-500' : 'text-gray-100') : 'hidden'}`} 
                                />
                              </div>
                            </div>
                            <p className="text-md text-gray-700 dark:text-gray-300 pt-2 mb-2">
                              {t('luthier.confirm_invitation_email_description')}
                            </p>
                            <div className="flex justify-end items-center w-full">
                              <div className="flex justify-between items-center gap-2">
                                {otpError && (
                                  <p className="text-red-500 text-sm">{otpError}</p>
                                )}
                                <FormSaveButton
                                  ref={emailButtonRef}
                                  disabled={!isValidEmail}
                                  onClick={() => sendUserConfirmationOTP()}
                                  theme="me"
                                  isLoading={isSendingOTP}
                                >
                                  {t('luthier.confirm_invitation_confirm_email')}
                                </FormSaveButton>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col w-full">
                            <label htmlFor="business-email" className="block text-md font-bold text-gray-700 dark:text-gray-300 mb-1">
                              {t('luthier.confirm_invitation_otp_label')}
                            </label>
                            <div className="relative">
                              <OTPForm
                                maxLength={6}
                                value={otp}
                                onChange={(value) => handleOTPChange(value)}
                              />
                            </div>
                            <div className="grid grid-cols-[3fr_minmax(130px,_1fr)] gap-2 pt-4 pb-2">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="privacy-policy"
                                  className="mr-2 h-4 w-4 text-me-600 focus:ring-me-500 border-gray-300 rounded"
                                  onChange={(e) => setPrivacyPolicyAccepted(e.target.checked)}
                                />
                                <label htmlFor="privacy-policy" className="text-sm text-gray-700 dark:text-gray-300">
                                  {t('luthier.privacy_policy')}{' '}
                                  <a 
                                    href="https://instruement.com/privacy-policy/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-me-600 hover:text-me-800 underline"
                                  >
                                    {t('luthier.privacy_policy_link')}
                                  </a>
                                </label>
                              </div>
                              <div className="flex items-center justify-end">
                                <FormSaveButton
                                  ref={otpButtonRef}
                                  disabled={!isValidOTP || !privacyPolicyAccepted}
                                  onClick={() => sendUserOTPVerification()}
                                  theme="me"
                                >
                                  {t('luthier.confirm_invitation_confirm_otp')}
                                </FormSaveButton>
                              </div>
                            </div>
                            {isValidOTP && privacyPolicyAccepted && (
                              <p className="text-md text-me-600 italic mt-2 border-l-2 border-me-600 pl-2">
                                {t('luthier.reload_notice')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Modal isOpen={isModalOpen} content={modalContent} onClose={closeModal} />
                </> : <NotConnected locale={locale} />
          }
        </div>
      </Section>
    </Page>
  );
}
