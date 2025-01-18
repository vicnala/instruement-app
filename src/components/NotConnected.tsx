"use client";

import { ConnectButton } from "thirdweb/react";
import { baseSepolia } from "thirdweb/chains";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import Image from 'next/image'
import { client } from "@/app/client";
import Page from "@/components/Page";
import Section from "@/components/Section";

export default function NotConnected(
    { locale }: Readonly<{ locale: string }>
) {
    const t = useTranslations();
    const { theme } = useTheme();

    return (
        <Page>
            <div className='min-h-screen flex flex-col'>
                <Section>
                    <div className="min-h-[70vh] md:min-h-[60vh] flex items-center justify-center bg-it-25 dark:bg-gray-950 px-3.5 md:px-24 rounded-md">
                        <div className="text-center text-gray-1000">
                            <h2 className='text-4xl md:text-6xl font-semibold text-gray-900 dark:text-it-50 mb-2'>
                                {t('hero.heading')}
                            </h2>
                            <p className="text-lg text-gray-900 dark:text-gray-200 pb-12 md:pb-16 max-w-72 mx-auto">
                                {t('hero.sub_heading')}
                            </p>
                            <div className="">
                                <ConnectButton
                                    client={client}
                                    theme={theme === 'system' ? 'light' : theme === 'dark' ? 'dark' : 'light'}
                                    locale={locale.includes('en') ? 'en_US' : locale.includes('es') ? 'es_ES' : 'en_US'}
                                // accountAbstraction={{ chain: baseSepolia, sponsorGas: true }}
                                />
                            </div>
                            <div className='mt-4'>
                                <p className='text-md text-gray-900 dark:text-gray-400'>
                                    {t('hero.button_description')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-8">
                        <p className="text-sm text-center text-gray-900 mb-2">
                            {t('hero.auth_disclaimer')}
                        </p>
                        <div className="flex justify-center items-center">
                            <Image src="/images/thirdweb-wordmark-dark.svg" alt="thirdweb" width={100} height={100} />
                        </div>
                    </div>
                </Section>

                {/* <Section>
                    <div className='fixed inset-x-0 bottom-0 sm:hidden pb-8'>
                        <div className='mt-6 flex justify-center pt-48'>
                            <p className='text-gray-800 dark:text-gray-400 text-sm max-w-xs pr-14 pl-14'>
                                {t('hero.add_to_home_screen')}
                            </p>
                        </div>
                        { <div className="mt-2">
                        <button 
                            onClick={() => openModal({ 
                                title: t('modals.add_to_home_screen.title'), 
                                description: t('modals.add_to_home_screen.description')
                            })}
                            className="inline-flex items-center px-3 py-1 text-me-700 bg-transparent rounded-md text-xs sm:text-base">
                            <IconInfo height="1.2em" width="1.2em" className="mr-1"/> {t('hero.show_how')}
                        </button>
                    </div> }
                    </div>
                </Section> */}

                {/* <Modal isOpen={isModalOpen} content={modalContent} onClose={closeModal} /> */}

            </div>

        </Page>
    )

    //   return (
    //     <main className="flex-1">
    //       <section className="w-full py-12 md:py-24 lg:py-40">
    //         <div className="container px-4 md:px-6">
    //           <div className="flex flex-col items-center space-y-4 text-center">
    //             <div className="space-y-2">
    //               <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
    //                 {t("hero.title")}
    //               </h1>
    //               <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
    //                 {t("hero.text")}
    //               </p>
    //             </div>
    //             <div className="flex justify-center align-middle items-center gap-4 flex-wrap">
    //               <ConnectButton
    //                 client={client}
    //                 theme={theme === 'system' ? 'light' : theme === 'dark' ? 'dark': 'light'}
    //                 locale={locale.includes('en') ? 'en_US' : locale.includes('es') ? 'es_ES' : 'en_US'}
    //               />
    //             </div>
    //           </div>
    //         </div>
    //       </section>
    //     </main>
    //   );
}
