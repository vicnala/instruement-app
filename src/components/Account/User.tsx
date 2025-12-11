"use client";

import { useTranslations } from "next-intl";
import Page from "@/components/Page";
import Loading from "@/components/Loading";
import Section from "@/components/Section";
import ReceiveInstrumentCard from "@/components/ReceiveInstrumentCard";
import OnboardMinterCardInvite from "@/components/UI/OnboardMinterCardInvite";
import OnboardMinterCardToken from "../UI/OnboardMinterCardToken";
import { CustomConnectButton } from "@/components/CustomConnectButton";


export default function User(
    { locale, invite, token, context }: Readonly<{ locale: string, invite?: string, token?: string, context: any }>
) {
    const t = useTranslations('components.Account.User');
    const address = context.sub;

    if (!address) return <Loading />

    return (
        <Page context={context}>
            {(invite || token) && (
                invite ? (
                    <OnboardMinterCardInvite 
                        locale={locale} 
                        invite={invite}
                    />
                ) : (
                    <OnboardMinterCardToken 
                        locale={locale} 
                        token={token}
                    />
                )
            )}
            { (!invite && !token) && (
                <Section>
                    <ReceiveInstrumentCard address={address} locale={locale} context={context} />
                </Section>
            )}
            <Section>
                <div data-theme="us" className="mb-16 bg-scope-25 border border-scope-50 p-6 rounded-section">
                    <h2 className="text-xl font-bold text-scope-1000 mb-4">
                        {t('account')}
                    </h2>
                    <div className="md:flex gap-6">

                        <div className="mb-6 min-w-[30%]">
                            <h3 className='text-sm font-bold text-scope-700 mb-2'>
                                {t('type')}
                            </h3>
                            <p className='text-3xl text-scope-400 font-bold'>
                                {t('anonymous')}
                            </p>
                        </div>
                        <div className="">
                            <h3 className='text-sm font-bold text-scope-700 mb-2'>
                                {t('connect_button_title')}
                            </h3>
                            <CustomConnectButton cb={`/account`} />
                            <p className='text-scope-800 mb-4 mt-2'>
                                {t('connect_button_description')}
                            </p>
                        </div>
                    </div>
                </div>
            </Section>
        </Page>
    )
}
