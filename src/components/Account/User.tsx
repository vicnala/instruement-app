"use client";

import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Loading from "@/components/Loading";
import Section from "@/components/Section";
import ReceiveInstrumentCard from "@/components/ReceiveInstrumentCard";
import { CustomConnectButton } from "../CustomConnectButton";
import { useActiveAccount } from "thirdweb/react";
import NotConnected from "@/components/NotConnected";

export default function User(
    { locale }: Readonly<{ locale: string }>
) {
    const t = useTranslations('components.Account.User');
    const { isLoading, owned, setReloadUser } = useStateContext()
    const activeAccount = useActiveAccount();

    if (isLoading) return <Loading />

    if (!activeAccount) return <NotConnected locale={locale} />

    return (
        <Page>
            <Section>
                <h2 className='text-2xl font-bold text-black dark:text-white'>
                    {t('title')}
                </h2>
                <p className='text-gray-500 dark:text-gray-400'>
                    {t('anonymous')}
                </p>
            </Section>
            <Section>
                <ReceiveInstrumentCard address={activeAccount.address} locale={locale} />
            </Section>
            <Section>
                <div className='mb-16'>
                    <h3 className='text-lg font-bold text-black dark:text-white mb-2'>
                        {t('connect_button_title')}
                    </h3>
                    <p className='text-gray-500 dark:text-gray-400 mb-4'>
                        {t('connect_button_description')}
                    </p>
                    <CustomConnectButton />
                </div>
            </Section>
        </Page>
    )
}
