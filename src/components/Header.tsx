"use client";

import { usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { TransitionLink } from "@/components/UI/TransitionLink";
import Image from 'next/image'
import { useTranslations } from "next-intl";
import { ModeToggle } from "./ModeToggle";
import { House, User } from "lucide-react";
import RegisterPlus from '@/components/Icons/RegisterPlus'


export function Header({ context }: { context: any }) {
  const t = useTranslations('components.Header');
  const pathname: string = usePathname();
  const locale: string = useLocale();
  const isMinter = context?.ctx?.isMinter;
  const address = context?.sub;

  return (
    <div className={`${address ? 'hidden sm:block' : ''}`}>
      <div className='w-full'>
        <header className='bg-canvas px-safe'>
          <div className='mx-auto flex flex-row min-h-[max(10vh,85px)] max-w-screen-lg items-center justify-between px-3.5'>
            <TransitionLink href="/" locale={locale}>
              <div className="relative">
                <Image
                  src="/images/instruement-logo-contrast.png"
                  alt="Instruement"
                  width={125}
                  height={53}
                  className="block dark:hidden"
                />
                <Image
                  src="/images/instruement-logo-dark.png"
                  alt="Instruement"
                  width={125}
                  height={53}
                  className="hidden dark:block"
                />
              </div>
            </TransitionLink>
            <nav className='flex items-center space-x-6'>
              {
                isMinter && 
                (pathname === '/' || pathname === '/account' || pathname.includes('/instrument')) &&
                <TransitionLink 
                  href="/drafts/new" 
                  locale={locale}
                  theme="us"
                  className="flex flex-col items-center font-medium text-sm
                  text-scope-400 hover:text-it-500"
                  aria-label={t('new_instrument')}
                >
                  <RegisterPlus className="w-5 h-5" />
                  <span className="text-xs">{t('new_instrument')}</span>
                </TransitionLink>
              }
              {
                address && 
                  <div className='flex flex-col items-center space-x-6'>
                    <TransitionLink 
                    disabled={pathname === '/account'}
                    href="/account" 
                    key="my-instruments" 
                    locale={locale} 
                    theme="us"
                    className={`flex flex-col items-center hover:text-scope-1000 ${pathname.includes('/account') ? 'text-scope-1000' : 'text-scope-400'}`}>
                      <User className="w-5 h-5" aria-label={t('account')} />
                      <span className="text-xs">{t('account')}</span>
                    </TransitionLink>
                  </div>
              }
              {
                address && ( pathname === '/account' || pathname.includes('/instrument') || pathname.includes('/drafts')) &&
                <TransitionLink 
                disabled={pathname === '/'}
                href="/" 
                locale={locale} 
                theme="us" 
                className={`flex flex-col items-center ${pathname === '/' ? 'text-scope-1000' : 'text-scope-300 hover:text-scope-700'}`}>
                  <House className="w-5 h-5" />
                  <span className="text-xs">{t('home')}</span>
                </TransitionLink>
              }
              { process.env.NODE_ENV === 'development' && <ModeToggle /> }
            </nav>
          </div>
        </header>
      </div>
    </div>
  );
}
