"use client";

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from "next-intl";
import { logout } from '@/actions/login';
import { useActiveAccount } from "thirdweb/react";
import ButtonSpinner from '@/components/UI/ButtonSpinner';

type VerificationStatus = 'waiting' | 'verifying' | 'adding_address' | 'fetching_user' | 'success' | 'error';

interface UserData {
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface OnboardMinterCardTicketProps {
  locale?: string;
  ticket?: string;
}

export default function OnboardMinterCardTicket({ ticket }: OnboardMinterCardTicketProps) {
  const t = useTranslations('components.Account.OnboardMinterCardTicket');
  const [status, setStatus] = useState<VerificationStatus>('waiting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const activeAccount = useActiveAccount();

  const fetchUserInfo = useCallback(async (userId: string): Promise<UserData | null> => {
    try {
      const response = await fetch(`/api/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('fetchUserInfo error:', error);
      return null;
    }
  }, []);

  const addWalletAddress = useCallback(async (
    address: string, 
    userId: string, 
    session: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/user/${address}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          session
        }),
      });

      const result = await response.json();
      return result.code === 'success';
    } catch (error) {
      console.error('addWalletAddress error:', error);
      return false;
    }
  }, []);

  const verifyTicket = useCallback(async (address: string) => {
    if (!ticket) return;

    setStatus('verifying');
    setErrorMessage('');

    try {
      const response = await fetch('/api/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket: ticket }),
      });

      const result = await response.json();

      if (result.code !== 'success') {
        setStatus('error');
        setErrorMessage(result.message || t('errors.verification_failed'));
        return;
      }

      const { user_id, session, purpose } = result.data;

      // Check if purpose is add_wallet_address
      if (purpose !== 'add_wallet_address') {
        setStatus('error');
        setErrorMessage(t('errors.ticket_failed'));
        return;
      }

      // Step 2: Add wallet address
      setStatus('adding_address');
      const addressAdded = await addWalletAddress(address, user_id, session);

      if (!addressAdded) {
        setStatus('error');
        setErrorMessage(t('errors.address_failed'));
        return;
      }

      // Step 3: Fetch user info
      setStatus('fetching_user');
      const userInfo = await fetchUserInfo(user_id);
      
      if (userInfo) {
        setUserData(userInfo);
        setWalletAddress(address);
      }

      setStatus('success');

    } catch (error) {
      console.error('verifyTicket error:', error);
      setStatus('error');
      setErrorMessage(t('errors.verification_failed'));
    }
  }, [ticket, t, addWalletAddress, fetchUserInfo]);

  // Auto-trigger verification when wallet address is available
  useEffect(() => {
    if (!ticket || !activeAccount?.address || status !== 'waiting') return;

    verifyTicket(activeAccount.address);
  }, [ticket, activeAccount?.address, status, verifyTicket]);

  // Don't render if no ticket
  if (!ticket) {
    return null;
  }

  // Waiting for wallet address
  if (status === 'waiting') {
    return (
      <div data-theme="me" className="p-6 rounded-section bg-scope-25 border border-scope-50">
        <h3 className="text-xl font-bold text-scope-1000">{t('title_activating')}</h3>
        <div className="flex items-center gap-2">
          <ButtonSpinner />
          <p className="text-lg text-scope-1000">
            {t('status.waiting_wallet')}
          </p>
        </div>
      </div>
    );
  }

  // Verifying ticket
  if (status === 'verifying') {
    return (
      <div data-theme="me" className="p-6 rounded-section bg-scope-25 border border-scope-50 animate-pulse-border">
        <h3 className="text-xl font-bold text-scope-1000">{t('title_activating')}</h3>
        <div className="flex items-center gap-2">
          <ButtonSpinner />
          <p className="text-lg text-scope-1000">
            {t('status.verifying_account')}
          </p>
        </div>
      </div>
    );
  }

  // Adding wallet address
  if (status === 'adding_address') {
    return (
      <div data-theme="me" className="p-6 rounded-section bg-scope-25 border border-scope-50 animate-pulse-border">
        <h3 className="text-xl font-bold text-scope-1000">{t('title_activating')}</h3>
        <div className="flex items-center gap-2">
          <ButtonSpinner />
          <p className="text-lg text-scope-1000">
            {t('status.adding_address')}
          </p>
        </div>
      </div>
    );
  }

  // Fetching user info
  if (status === 'fetching_user') {
    return (
      <div data-theme="me" className="p-6 rounded-section bg-scope-25 border border-scope-50 animate-pulse-border">
        <div className="flex items-center gap-4">
          <ButtonSpinner />
          <p className="text-lg text-scope-1000">
            {t('status.fetching_user')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    const handleRetry = () => {
      setStatus('waiting');
      setErrorMessage('');
    };

    return (
      <div data-theme="me" className="p-6 rounded-section bg-red-50 border border-red-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-6 h-6 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-800">
              {t('errors.title')}
            </h3>
            <p className="text-red-700 mb-4">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label={t('status.retry')}
              tabIndex={0}
            >
              {t('status.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    const firstName = userData?.first_name || '';

    const handleContinue = async () => {
      await logout();
    };
    
    return (
      <div data-theme="me" className="p-6 rounded-section bg-green-50 border border-green-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              {t('status.success_title', { firstName })}
            </h3>
            <p className="text-green-700 mb-4">
              {t('status.success_description')}
            </p>
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">
                {t('status.wallet_address_label')}
              </p>
              <p className="font-mono text-sm text-green-900 break-all">
                {walletAddress}
              </p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label={t('status.continue')}
              tabIndex={0}
            >
              {t('status.continue')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
