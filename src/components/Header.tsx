"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import Image from 'next/image'
import { useTranslations } from "next-intl";
import { ModeToggle } from "./ModeToggle";
import { useStateContext } from "@/app/context";

export function Header() {
  const t = useTranslations();
  const { address, isMinter } = useStateContext()
  const pathname = usePathname();

  return (
    <div className=''>
      <div className='fixed top-0 left-0 z-20 w-full'>
        <header className='bg-white bg-opacity-90 px-safe dark:bg-black dark:bg-opacity-90'>
          <div className='mx-auto flex flex-row min-h-[15vh] md:min-h-[10vh] max-w-screen-lg items-center justify-between px-3.5'>
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Instruement"
                width={125}
                height={53}
                className="dark:filter dark:invert"
              />
            </Link>
            <nav className='flex items-center space-x-6'>
              {
                isMinter && <>
                  <div className='hidden sm:block'>
                    <div className='flex items-center space-x-6'>
                      <Link key="drafts" href="/drafts">
                        <div
                          className={`text-sm ${pathname.includes('/drafts') && !pathname.includes('/drafts/new')
                              ? 'text-it-400 dark:text-white'
                              : 'text-gray-500 hover:text-it-400 dark:text-gray-600 dark:hover:text-it-100'
                            }`}
                        >
                          {t('navbar.drafts')}
                        </div>
                      </Link>
                    </div>
                  </div>
                  <div className='hidden sm:block'>
                    <div className='flex items-center space-x-6'>
                      <Link key="drafts" href="/drafts/new">
                        <div
                          className={`text-sm ${pathname.includes('/drafts/new')
                              ? 'text-it-400 dark:text-white'
                              : 'text-gray-500 hover:text-it-400 dark:text-gray-600 dark:hover:text-it-100'
                            }`}
                        >
                          {t('navbar.new_draft')}
                        </div>
                      </Link>
                    </div>
                  </div>
                </>
              }
              {
                address &&
                <div className='hidden sm:block'>
                  <div className='flex items-center space-x-6'>
                    <Link key="my-instruments" href="/account">
                      <div
                        className={`text-sm ${pathname.includes('/account')
                            ? 'text-it-400 dark:text-white'
                            : 'text-gray-500 hover:text-it-400 dark:text-gray-600 dark:hover:text-it-100'
                          }`}
                      >
                        {t('navbar.account')}
                      </div>
                    </Link>
                  </div>
                </div>
              }
              {/* <LocalSwitcher /> */}
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
