"use client";

import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Section from "@/components/Section";
import { CustomConnectButton } from "../CustomConnectButton";
import Image from "next/image";
import Loading from "@/components/Loading";
import { useActiveAccount } from "thirdweb/react";
import ButtonQrTransfer from "../UI/ButtonQrTransfer";
import { ButtonLink } from "../UI/ButtonLink";
import { ExternalLink } from 'lucide-react';

export default function Minter(
    { locale }: Readonly<{ locale: string }>
) {
    const t = useTranslations('components.Account.Minter');
    const { isMinter, isLuthier, isVerified, isLoading, minter } = useStateContext();
    const activeAccount = useActiveAccount();

    let minterConstructionSkills = [];
    if (minter && minter.skills && minter.skills.length) {
        minterConstructionSkills = minter.skills.filter((skill: any) => skill.slug.includes('construction'));
    }

    if (isLoading || !activeAccount?.address) return <Loading />

    return (
        <Page>
            {/* Cover Image Section */}
            <div className="relative w-full h-60 mb-16">
                <div className="w-full h-full overflow-hidden rounded-[15px]">
                    <Image
                        src={minter?.cover_image?.url || "https://static.instruement.com/web/img/default-cover.jpg"}
                        alt={minter?.business_name || "Cover"}
                        className="w-full h-full object-cover"
                        width={1000}
                        height={250}
                        priority
                    />
                </div>

                {/* Profile Photo floating on cover image */}
                {minter?.profile_photo && (
                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <Image
                                src={minter.profile_photo.url}
                                alt={`${minter.first_name} ${minter.last_name}`}
                                className="w-full h-full object-cover"
                                width={150}
                                height={150}
                                priority
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Information */}
            <Section>
                <div className="grid md:grid-cols-2 gap-4 pt-6 ">
                    <div className="flex flex-col">
                        {/* Business Name */}
                        {minter?.business_name && (
                            <h1 className="text-3xl text-contrast dark:text-gray-25 font-bold mb-1">
                                {minter.business_name}
                            </h1>
                        )}

                        {/* Full Name */}
                        {(minter?.first_name || minter?.last_name) && (
                            <h2 className="text-2xl text-gray-700 dark:text-gray-300 mb-4">
                                {minter.first_name} {minter.last_name}
                            </h2>
                        )}

                        {/* Verified Since */}
                        {minter?.is_verified && minter?.is_verified_since && (
                            <div className="mb-6">
                                <span className="text-sm font-medium text-gray-300 dark:text-gray-500">
                                    {t('verfied_since')}:
                                </span>
                                <span className="ml-2 text-sm text-gray-300 dark:text-gray-500">
                                    {minter.is_verified_since}
                                </span>
                            </div>
                        )}

                        {/* Instrument Types */}
                        {/* {minter?.instrument_types && minter.instrument_types.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">{t('instrument_type_specialization')}</h3>
                                <div className="flex flex-wrap gap-1 gap-y-2">
                                    {minter.instrument_types.map((type: any, index: number) => (
                                        <span key={index} className="px-3 py-1 bg-it-100 text-it-950 rounded-md text-md">
                                            {type.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )} */}

                        {/* Endorsed Skills */}
                        {minter?.skills && minter.skills.length > 0 && (
                            <div className="mb-6">
                                {/* <h3 className="text-lg font-semibold mb-2">{t('endorsed_skills')}</h3>
                                <div className="flex flex-wrap gap-1 gap-y-2">
                                    {minter.skills.map((skill: any, index: number) => (
                                        <span key={index} className="px-3 py-1 bg-gray-50 text-gray-800 rounded-md text-md">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div> */}
                                {isMinter && minterConstructionSkills.length > 0 && (
                                    <div className="">
                                        <h3 className="text-lg font-semibold mb-2">{t('account.minter_account')}</h3>
                                        <div className="flex flex-wrap gap-1 gap-y-2">
                                            {minterConstructionSkills.map((skill: any, idx: number) => (
                                                <span key={idx} className="px-3 py-1 bg-it-100 text-it-950 rounded-md text-md">
                                                    {skill.name.split(' construction')[0]}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {!isMinter && isLuthier && isVerified && (
                                    <h4 className="text-sm mt-4 text-gray-500">
                                        {t('account.verified_luthier')}
                                    </h4>
                                )}
                                {isLuthier && !isVerified && (
                                    <h4 className="text-sm mt-4 text-gray-500">
                                        {t('account.not_verified_luthier')}
                                    </h4>
                                )}
                            </div>
                        )}

                        {/* Products & Services Section */}
                        {/* <div className="mb-6 max-w-md">
                            {minter?.products_services && minter.products_services.length > 0 ? (
                                minter.products_services
                                .filter((item: any) => item.lang === locale)
                                .map((item: any, index: number) => (
                                    <>
                                        <h3 className="text-md font-semibold mb-2">{item.title}</h3>
                                        <div 
                                            key={index} 
                                            className="text-gray-600 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                        />
                                    </>
                                    ))
                            ) : (
                                <p className="text-gray-600">{t('no_content_available')}</p>
                            )}
                        </div> */}
                        {/* View complete profile on instruement.com/?author=[minter.user_id] */}
                        <div className="mb-6 pt-6">
                            <ButtonLink href={`https://www.instruement.com/?author=${minter?.user_id}`} colorSchema="gray" external={true}>
                                {t('view_complete_profile')} <ExternalLink className="w-4 h-4" />
                            </ButtonLink>
                        </div>
                    </div>
                    <div className="flex flex-col justify-start items-end">
                        <div className="w-full bg-gray-25 rounded-lg px-4 py-4 mb-12">
                            {/* Address details: */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2 text-gray-1000 dark:text-gray-800">{t('address')}</h3>
                                <div className="text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={activeAccount?.address || "No wallet address available"}
                                            disabled
                                            className="bg-gray-100 text-gray-600 p-2 rounded-md w-full"
                                            aria-label="Wallet address"
                                        />
                                        <button
                                            onClick={() => {
                                                if (activeAccount?.address) {
                                                    navigator.clipboard.writeText(activeAccount?.address);
                                                    const icon = document.querySelector('#copy-icon');
                                                    if (icon) {
                                                        icon.classList.remove('text-gray-600');
                                                        icon.classList.add('text-green-500');
                                                        setTimeout(() => {
                                                            icon.classList.remove('text-green-500');
                                                            icon.classList.add('text-gray-600');
                                                        }, 1000);
                                                    }
                                                }
                                            }}
                                            className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                            disabled={!activeAccount?.address}
                                            aria-label="Copy wallet address"
                                        >
                                            <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {
                                activeAccount?.address && (
                                    <div className="mb-6">
                                        <ButtonQrTransfer address={activeAccount?.address} locale={locale} />
                                    </div>
                                )
                            }
                            <h3 className="text-lg font-semibold mb-2 text-gray-1000 dark:text-gray-800">{t('wallet_actions_title')}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('wallet_actions_description')}</p>
                            {/* Connect Button */}
                            <CustomConnectButton />
                        </div>
                    </div>
                </div>
            </Section>
        </Page>
    );
}
