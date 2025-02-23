"use client";

import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Loading from "@/components/Loading";
import Section from "@/components/Section";
import { CustomConnectButton } from "../CustomConnectButton";

export default function Minter(
    { locale }: Readonly<{ locale: string }>
) {
    const t = useTranslations();
    const { isMinter, isLuthier, isVerified, isLoading, minter } = useStateContext()
    
    let minterConstructionSkills = [];
    if (minter && minter.skills && minter.skills.length) {
      minterConstructionSkills = minter.skills.filter((skill: any) => skill.slug.includes('construction'));
    }

    if (isLoading) return (
        <Page>
          <div className="text-center">
            <Loading />
          </div>
        </Page>
    )

    return (
        <Page>
            <Section>
                <h2 className='text-2xl text-center font-bold text-black dark:text-white'>
                    {t('navbar.account')}
                </h2>
            </Section>
            <Section>
                <div className='text-center flex flex-col'>
                    {
                        isMinter &&
                        <div className="text-sm mt-4 text-gray-500">
                            {t('account.minter_account')} {minterConstructionSkills.map((skill: any) => `"${skill.name.split(' construction')[0]}"`)}
                        </div>
                    }
                    {
                        !isMinter && isLuthier && isVerified && <div className="text-sm mt-4 text-gray-500">{t('account.verified_luthier')}</div>
                    }
                    {
                        isLuthier && !isVerified && <div className="text-sm mt-4 text-gray-500">{t('account.not_verified_luthier')}</div>
                    }
                </div>
            </Section>
            <Section>
            <div className='text-center'>
                <CustomConnectButton />
            </div>
            </Section>
        </Page>
    )
}
