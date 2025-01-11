"use client";

import { ConnectButton } from "thirdweb/react";
import { baseSepolia } from "thirdweb/chains";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import { client } from "@/app/client";
import NotConnected from "@/components/NotConnected";
import Loading from "@/components/Loading";
import Page from "@/components/Page";
import Section from "@/components/Section";

export default function AccountPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { theme } = useTheme();
  const { address, isMinter, isLuthier, isVerified, isLoading, minter } = useStateContext()

  if (isLoading) return (
    <Page>
      <div className="text-center">
        <Loading />
      </div>
    </Page>
  )

  let minterConstructionSkills = [];
  if (minter && minter.skills && minter.skills.length) {
    minterConstructionSkills = minter.skills.filter((skill: any) => skill.slug.includes('construction'));
  }

  return (
    address ?
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
            <ConnectButton
              client={client}
              theme={theme === 'system' ? 'light' : theme === 'dark' ? 'dark' : 'light'}
              locale={locale.includes('en') ? 'en_US' : locale.includes('es') ? 'es_ES' : 'en_US'}
            // accountAbstraction={{ chain: baseSepolia, sponsorGas: true }}
            />
          </div>
        </Section>
      </Page> :
      <NotConnected locale={locale} />
  );
}
