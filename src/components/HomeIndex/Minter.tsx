"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Page from "@/components/Page";
import Section from "@/components/Section";
import { useModal } from "@/components/Modal/useModal";
import Modal from "@/components/Modal/Modal";
import IconInfo from "@/components/Icons/Info";
import { useStateContext } from "@/app/context";
import NFTGrid, { NFTGridLoading } from "@/components/NFT/NFTGrid";
import DraftGrid from "@/components/Drafts/DraftGrid";

export default function Minter(
  { locale }: Readonly<{ locale: string }>
) {
  const t = useTranslations();
  const { isModalOpen, modalContent, openModal, closeModal } = useModal()
  const { minter, owned, isLoading } = useStateContext()

  return (
    <Page>
      <Section>
        {
          isLoading ? (<NFTGridLoading />) : 
            <div className='flex flex-col'>
              <DraftGrid locale={locale}/>
            </div>
        }
      </Section>
      <Section>
        {
          isLoading ? (<NFTGridLoading />) :
            owned && owned.length ?
              <div className="flex flex-col pt-4">
                <NFTGrid nftData={owned} /> 
              </div>
              :
              <>
                <h2 className='text-xl font-semibold text-zinc-800 dark:text-zinc-200'>
                  {t('home.minter.hello')} {minter.first_name}
                </h2>
                <p className="mb-4 text-base">
                  {t('home.minter.verified_since')} {new Date(minter.is_verified_since).toLocaleDateString()}
                </p>
                <div className="block rounded-lg bg-it-25 p-6 dark:text-it-1000 mb-6">
                  <h5 className="mb-2 text-md sm:text-xl font-bold">
                    {t('home.minter.register_title')}
                  </h5>
                  <p className="mb-4 text-sm sm:text-base">
                    {t('home.minter.register_text')}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-left items-center">

                    <div className="px-1">
                      <Link href="/drafts/new">
                        <div className="bg-transparent hover:bg-it-500 text-it-1000 hover:text-white border border-it-300 hover:border-it-500 font-bold py-2 px-4 rounded-md text-sm">
                          {t('home.minter.register_now')}
                        </div>
                      </Link>
                    </div>

                    <div className="px-1">
                      <IconInfo height="1.2em" width="1.2em" className="mr-1" /> {t('home.minter.register_more')}
                    </div>
                  </div>
                </div>

                <div className="block rounded-lg bg-me-50 p-6 dark:text-me-1000">
                  <h5 className="mb-2 text-md text-me-950 sm:text-xl font-bold">
                    {t('home.minter.invite_title')}
                  </h5>
                  <p className="mb-4 text-sm text-me-950 sm:text-base">
                    {t('home.minter.invite_text')}
                  </p>
                  <div className="flex justify-left items-center">
                    <div className="px-1">
                      <button className="bg-transparent hover:bg-me-500 text-me-950 hover:text-white border border-me-300 hover:border-me-500 font-bold py-2 px-4 rounded-md text-sm">
                        {t('home.minter.invite_now')}
                      </button>
                    </div>

                  </div>
                </div>
                <Modal isOpen={isModalOpen} content={modalContent} onClose={closeModal} />
              </>
        }
      </Section>
    </Page>
  );
}
