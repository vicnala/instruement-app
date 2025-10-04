"use client";

import { useTranslations } from "next-intl";
import Page from "@/components/Page";
import Loading from "@/components/Loading";
import Section from "@/components/Section";
import ReceiveInstrumentCard from "@/components/ReceiveInstrumentCard";
import OnboardMinterCard from "@/components/UI/OnboardMinterCard";
import { CustomConnectButton } from "@/components/CustomConnectButton";
import { useActiveAccount } from "thirdweb/react";

export default function User(
    { locale, invite, context }: Readonly<{ locale: string, invite?: string, context: any }>
) {
    const t = useTranslations('components.Account.User');
    const address = context.sub;

    if (!address) return <Loading />

    return (
        <Page context={context}>
            <Section>
                <h2 className='text-2xl font-bold text-black dark:text-white'>
                    {t('title')}
                </h2>
                <p className='text-gray-500 dark:text-gray-400'>
                    {t('anonymous')}
                </p>
            </Section>
            {invite && (
                <Section>
                    <OnboardMinterCard 
                        locale={locale} 
                        invite={invite}
                    />
                </Section>
            )}
            { !invite && (
                <Section>
                    <ReceiveInstrumentCard address={address} locale={locale} context={context} />
                </Section>
            )}
            <Section>
                <div className='mb-16'>
                    <h3 className='text-lg font-bold text-black dark:text-white mb-2'>
                        {t('connect_button_title')}
                    </h3>
                    <p className='text-gray-500 dark:text-gray-400 mb-4'>
                        {t('connect_button_description')}
                    </p>
                    <CustomConnectButton cb={`/account`} />
                </div>
            </Section>
        </Page>
    )
}
