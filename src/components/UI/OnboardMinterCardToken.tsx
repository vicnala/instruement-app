"use client";

import { useRef, useState } from 'react'
import { useTranslations } from "next-intl";
import FormSaveButton from '@/components/UI/FormSaveButton';
import { logout } from '@/actions/login';
import { useActiveAccount } from "thirdweb/react";

interface OnboardMinterCardTokenProps {
  locale?: string;
  token?: string;
  onReloadUser?: () => void;
}

export default function OnboardMinterCardToken({ locale, token }: OnboardMinterCardTokenProps) {
  const t = useTranslations('components.UI.OnboardMinterCard');
  const [showForm, setShowForm] = useState(false)
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const activeAccount = useActiveAccount();

  const toggleFormVisibility = () => {
    setShowForm(prevState => !prevState)
  }

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const sendUserTokenVerification = async () => {
    if (!token) return alert('No Token or Invite')
    try {
      setIsVerifying(true)
      const result = await fetch(`/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          address: activeAccount?.address,
          accepted_terms: privacyPolicyAccepted
        }),
      })

      const { code } = await result.json();
      if (code !== 'success') {
        alert('Token verification failed');
        return
      }
      // onReloadUser();
      await logout();
    } catch (error) {
      console.log('sendUserTokenVerification', error)
      alert('Token verification failed');
    } finally {
      setIsVerifying(false)
      if (buttonRef.current) buttonRef.current.blur()
    }
  }

  // Don't render if no token
  if (!token) {
    return null;
  }

  return (
    <div data-theme="me" className="p-6 rounded-section bg-scope-25 border border-scope-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="mb-2 text-3xl font-bold text-scope-1000">
            {t('title')}
          </h3>
          <p className="mb-4 text-base text-us-700 dark:text-us-300">
            {t('description')}
          </p>
        </div>
        <div className='flex items-center justify-center'>
            <div className="flex flex-col w-full">
              <div className="grid grid-cols-[3fr_minmax(130px,_1fr)] gap-2 pt-4 pb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="privacy-policy"
                    className="mr-2 h-4 w-4 text-me-600 focus:ring-me-500 border-gray-300 rounded"
                    onChange={(e) => setPrivacyPolicyAccepted(e.target.checked)}
                  />
                  <label htmlFor="privacy-policy" className="text-xs text-us-700 dark:text-us-300">
                    {t('privacy_policy')}{' '}
                    <a 
                      href="https://instruement.com/privacy-policy/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-me-600 hover:text-me-800 underline"
                    >
                      {t('privacy_policy_link')}
                    </a>
                  </label>
                </div>
                <div className="flex items-center justify-end">
                  <FormSaveButton
                    ref={buttonRef}
                    disabled={!privacyPolicyAccepted}
                    onClick={() => sendUserTokenVerification()}
                    theme="me"
                    isLoading={isVerifying}
                  >
                    {t('confirm_invitation_confirm_otp')}
                  </FormSaveButton>
                </div>
              </div>
              {privacyPolicyAccepted && (
                <p className="text-md text-me-600 italic mt-2 border-l-2 border-me-600 pl-2 text-pretty">
                  {t('reload_notice')}
                </p>
              )}
            </div>

        </div>
      </div>
    </div>
  );
} 