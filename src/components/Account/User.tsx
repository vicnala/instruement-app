"use client";

import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Loading from "@/components/Loading";
import Section from "@/components/Section";
import { CustomConnectButton } from "../CustomConnectButton";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "@/i18n/routing";

export default function User(
    { locale }: Readonly<{ locale: string }>
) {
    const t = useTranslations();
    const { isLoading, owned, setReloadUser } = useStateContext()
    const activeAccount = useActiveAccount();
    const [timeout, _setTimeout] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const getUserTokens = async () => {
            try {
                const result = await fetch(`/api/tokens/${activeAccount?.address}`, { cache: 'no-store' });
                const data = await result.json();
                const { metadata: instrument } = data[data.length - 1];                
                if (data.length > owned.length) {
                    clearTimeout(timeout);
                    clearInterval(interval);
                    alert(`${t("components.Instrument.instrument")} #${instrument.id} "${instrument.name}" ${t("components.Instrument.new_instrument_received")}`);
                    setReloadUser(true);
                    router.push(`/instrument/${instrument.id}`);
                }
            } catch (error) {
                console.log('User.getUserTokens', error);
            }
        }

        const interval = setInterval(() => {
            const svg = document.getElementsByTagName('svg');
            if (svg?.length > 0) {
                for (let i = 0; i < svg.length; i++) {
                    if (svg[i].getAttribute('width') === '310' && svg[i].getAttribute('height') === '310') {
                        if (!timeout) {
                            _setTimeout(setTimeout(() => clearInterval(interval), 600000));
                        }
                        if (activeAccount) {
                            getUserTokens();
                        }
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

    return (
        <div id='target-element-id'>
            <Page>
                <Section>
                    <h2 className='text-2xl text-center font-bold text-black dark:text-white'>
                        {t('navbar.account')}
                    </h2>
                </Section>
                <Section>
                    <div className='text-center'>
                        <CustomConnectButton />
                    </div>
                </Section>
            </Page>
        </div>
    )
}
