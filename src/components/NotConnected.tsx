"use client";

import { useTranslations } from "next-intl";
import Image from 'next/image'
import Link from "next/link";
import Page from "@/components/Page";
import Section from "@/components/Section";
import { CustomConnectButton } from "./CustomConnectButton";
import { useActiveAccount } from "thirdweb/react";
import ButtonSpinner from "./UI/ButtonSpinner";

export default function NotConnected(
    { locale, cb, invite }: Readonly<{ locale: string, cb?: string | undefined, invite?: string | undefined }>
) {
    const t = useTranslations('components.NotConnected');
    const account = useActiveAccount();

    return (
        <Page>
            <div className='flex flex-col'>
                <Section>
                    <div className="min-h-[550px] h-[60vh] max-h-[700px] flex items-center justify-center bg-it-50 dark:bg-gray-950 px-3.5 md:px-24 rounded-[15px] dark:border-gray-900">
                        <div className="text-center text-gray-1000">
                            <h2 className='text-4xl md:text-5xl font-semibold text-gray-900 dark:text-it-50 mb-6 text-balance'>
                                {t('heading')}
                            </h2>
                            {/* <p className="text-md md:text-lg text-gray-900 dark:text-gray-200 pb-12 md:pb-16 max-w-[400px] text-balance mx-auto">
                                {t('sub_heading')}
                            </p> */}
                            <div className="relative">
                                <div className={account?.address ? 'invisible' : ''}>
                                    <CustomConnectButton cb={cb} invite={invite} />
                                </div>
                                {account?.address && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ButtonSpinner />
                                    </div>
                                )}
                            </div>
                            <div className='mt-4'>
                                <p className='text-sm md:text-md text-gray-900 dark:text-gray-400'>
                                    {t('button_description')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center items-center mt-6">
                        <Link href="https://www.instruement.com" target="_blank" className="text-xs text-gray-600 dark:text-gray-700 hover:text-it-500 dark:hover:text-it-300">
                            {t('visit_instruement')}
                        </Link>
                    </div>
                </Section>
            </div>

        </Page>
    )
}
