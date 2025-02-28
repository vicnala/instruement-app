"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import Image from 'next/image'
import { useTranslations } from "next-intl";
import { ModeToggle } from "./ModeToggle";
import { useStateContext } from "@/app/context";
import { ButtonLink } from "@/components/UI/ButtonLink";
import { House, User } from "lucide-react";


export function Header() {
  const t = useTranslations('components.Header');
  const { address, isMinter } = useStateContext()
  const pathname = usePathname();

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${address ? 'hidden sm:block' : ''}`}>
      <div className='w-full'>
        <header className='bg-canvas px-safe dark:bg-black dark:bg-opacity-90'>
          <div className='mx-auto flex flex-row min-h-[10vh] max-w-screen-lg items-center justify-between px-3.5'>
            <Link href="/">
              <Image
                src="/images/instruement-logo-contrast.png"
                alt="Instruement"
                width={125}
                height={53}
                className="dark:filter dark:invert"
              />
            </Link>
            <nav className='flex items-center space-x-6'>
              {
                address && 
                <Link href="/" className={`${pathname === '/' ? 'text-it-400 dark:text-white' : 'text-gray-500 hover:text-it-400 dark:text-gray-600 dark:hover:text-it-100'}`}>
                  <House className="w-5 h-5" />
                </Link>
              }
              {
                isMinter && 
                <ButtonLink href="/drafts/new" size="sm" colorSchema="it">
                  {t('new_instrument')}
                </ButtonLink>
              }
              {
                address &&
                <div className='hidden sm:block'>
                  <div className='flex items-center space-x-6'>
                    <Link key="my-instruments" href="/account">
                      <User className={`w-5 h-5 ${pathname.includes('/account')
                            ? 'text-it-400 dark:text-white'
                            : 'text-gray-500 hover:text-it-400 dark:text-gray-600 dark:hover:text-it-100'
                        }`}
                        aria-label={t('account')}
                      />
                    </Link>
                  </div>
                </div>
              }
              {
                process.env.NODE_ENV === 'development' && <ModeToggle />
              }
            </nav>
          </div>
        </header>
      </div>
    </div>
  );
}
