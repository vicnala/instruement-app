"use client";

import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Loading from "@/components/Loading";
import Section from "@/components/Section";
import ReceiveInstrumentCard from "@/components/ReceiveInstrumentCard";
import { CustomConnectButton } from "../CustomConnectButton";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import NotConnected from "@/components/NotConnected";

export default function User(
    { locale }: Readonly<{ locale: string }>
) {
    const t = useTranslations('components.Account.User');
    const { isLoading, owned, setReloadUser } = useStateContext()
    const activeAccount = useActiveAccount();
    const [timeout, _setTimeout] = useState<any>(null);

    useEffect(() => {
        const getUserTokens = async () => {
            try {
                const result = await fetch(`/api/tokens/${activeAccount?.address}`, { cache: 'no-store' });
                const data = await result.json();

                if (data.length > owned.length) {
                    const newInstrument = data.find((instrument: any) => {
                        // Check if this instrument's metadata.id is not in the owned array
                        return !owned.some((ownedId: any) => {
                            // Handle both cases: owned might be an array of strings (ids) or objects with metadata.id
                            if (typeof ownedId === 'string') {
                                return ownedId === instrument.metadata.id;
                            } else if (ownedId && typeof ownedId === 'object' && ownedId.metadata) {
                                return ownedId.metadata.id === instrument.metadata.id;
                            }
                            return false;
                        });
                    });
                    
                    if (newInstrument) {
                        const { metadata: instrument } = newInstrument;
                        clearTimeout(timeout);
                        clearInterval(interval);
                        alert(t("received_instrument", { name: instrument.name }));
                        setReloadUser(true);
                        document.location.replace(`/instrument/${instrument.id}`);
                        // router.replace(`/instrument/${instrument.id}`);
                    }
                }
            } catch (error) { console.log('User.getUserTokens', error); }
        }

        const interval = setInterval(() => {
            const svg = document.getElementsByTagName('svg');
            if (svg?.length > 0) {
                for (let i = 0; i < svg.length; i++) {
                    if (svg[i].getAttribute('width') === '310' && svg[i].getAttribute('height') === '310') {
                        if (!timeout) _setTimeout(setTimeout(() => clearInterval(interval), 600000));
                        if (activeAccount) getUserTokens();
                    }
                }
            }
        }, 5000);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, []);

    if (isLoading) return <Loading />

    if (!activeAccount) return <NotConnected locale={locale} />

    return (
        <div id='target-element-id'>
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
        </div>
    )
}
