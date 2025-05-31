"use client";

import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Loading from "@/components/Loading";
import Section from "@/components/Section";
import { CustomConnectButton } from "../CustomConnectButton";

export default function User(
    { locale }: Readonly<{ locale: string }>
) {
    const t = useTranslations();
    const { isLoading } = useStateContext()

    if (isLoading) return <Loading />

    return (
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
    )
}
