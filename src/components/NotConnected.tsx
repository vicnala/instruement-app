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
            <div className='text-center min-h-screen flex flex-col'>
                <div className='sm:hidden mt-8 ml-4 min-h-1/10'>
                    <Image
                        src="/images/logo.png"
                        alt="Instruement"
                        width={125}
                        height={53}
                        className="dark:filter dark:invert mx-auto"
                    />
                </div>
                <Section>
                    <h2 className='text-3xl font-semibold text-black dark:text-it-50 min-h-1/7'>
                        {t('hero.title')}
                    </h2>
                    <div className="mt-2">
                        <ConnectButton
                            client={client}
                            theme={theme === 'system' ? 'light' : theme === 'dark' ? 'dark' : 'light'}
                            locale={locale.includes('en') ? 'en_US' : locale.includes('es') ? 'es_ES' : 'en_US'}
                        // accountAbstraction={{ chain: baseSepolia, sponsorGas: true }}
                        />
                    </div>
                    <div className='mt-4'>
                        <p className='text-xs text-black dark:text-gray-400'>
                            {t('hero.text')}
                        </p>
                    </div>
                </Section>

                <Section>
                    <div className='fixed inset-x-0 bottom-0 sm:hidden pb-8'>
                        <div className='mt-6 flex justify-center pt-48'>
                            <p className='text-gray-800 dark:text-gray-400 text-sm max-w-xs pr-14 pl-14'>
                                {t('hero.add_to_home_screen')}
                            </p>
                        </div>
                        {/* <div className="mt-2">
                        <button 
                            onClick={() => openModal({ 
                                title: t('modals.add_to_home_screen.title'), 
                                description: t('modals.add_to_home_screen.description')
                            })}
                            className="inline-flex items-center px-3 py-1 text-me-700 bg-transparent rounded-md text-xs sm:text-base">
                            <IconInfo height="1.2em" width="1.2em" className="mr-1"/> {t('hero.show_how')}
                        </button>
                    </div> */}
                    </div>
                </Section>

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
