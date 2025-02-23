"use client";

import { useTranslations } from "next-intl";
import Image from 'next/image'
import Page from "@/components/Page";
import Section from "@/components/Section";
import { CustomConnectButton } from "./CustomConnectButton";

export default function NotConnected(
    { locale, callbackUrl }: Readonly<{ locale: string, callbackUrl?: string | undefined }>
) {
    const t = useTranslations();
    return (
        <Page>
            <div className='flex flex-col'>
                <Section>
                    <div className="min-h-[70vh] md:min-h-[60vh] flex items-center justify-center bg-it-50 dark:bg-gray-950 px-3.5 md:px-24 rounded-[15px] border border-it-100">
                        <div className="text-center text-gray-1000">
                            <h2 className='text-3xl md:text-6xl font-semibold text-gray-900 dark:text-it-50 mb-2'>
                                {t('hero.heading')}
                            </h2>
                            <p className="text-sm md:text-lg text-gray-900 dark:text-gray-200 pb-12 md:pb-16 max-w-[450px] mx-auto">
                                {t('hero.sub_heading')}
                            </p>
                            <div className="">
                                <CustomConnectButton callbackUrl={callbackUrl} />
                            </div>
                            <div className='mt-4'>
                                <p className='text-sm md:text-md text-gray-900 dark:text-gray-400'>
                                    {t('hero.button_description')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-8">
                        <p className="text-xs md:text-sm text-center text-gray-900 mb-2">
                            {t('hero.auth_disclaimer')}
                        </p>
                        <div className="flex justify-center items-center">
                            <Image src="/images/thirdweb-wordmark-dark.svg" alt="thirdweb" width={100} height={100} />
                        </div>
                    </div>
                </Section>
            </div>

        </Page>
    )
}
