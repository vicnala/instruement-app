"use client";

import { useTranslations } from "next-intl";
import Page from "@/components/Page";
import Section from "@/components/Section";
import { CustomConnectButton } from "../CustomConnectButton";
import Image from "next/image";
import ButtonQrTransfer from "../UI/ButtonQrTransfer";
import { ButtonLink } from "../UI/ButtonLink";
import { ExternalLink } from 'lucide-react';

export default function Minter(
    { locale, context, minter }: Readonly<{ locale: string, context: any, minter: any }>
) {
    const t = useTranslations('components.Account.Minter');
    const address = context.sub;

    const isMinter = context.ctx.isMinter;
    const isLuthier = context.ctx.isLuthier;
    const isVerified = context.ctx.isVerified;
    
    let minterConstructionSkills = [];
    if (minter && minter.skills && minter.skills.length) {
        minterConstructionSkills = minter.skills.filter((skill: any) => skill.slug.includes('construction'));
    }

    // Group skills by instrument type based on slug matching
    const getInstrumentTypeWithSkills = () => {
        if (!minter?.instrument_types || !minter?.skills) return [];
        
        return minter.instrument_types.map((instrumentType: any) => {
            const matchingSkills = minter.skills.filter((skill: any) => {
                // Check if skill slug starts with instrument type slug followed by a hyphen
                return skill.slug.startsWith(`${instrumentType.slug}-`);
            });
            
            return {
                instrumentType,
                skills: matchingSkills
            };
        }).filter((item: any) => item.skills.length > 0); // Only return instrument types that have matching skills
    };

    const instrumentTypesWithSkills = getInstrumentTypeWithSkills();

    return (
        <Page context={context}>
            {/* Cover Image Section */}
            <div className="relative w-full h-[100px] md:h-60 mb-10 md:mb-16">
                <div className="w-full h-full overflow-hidden rounded-section">
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
                    <div className="absolute bottom-0 left-1/2 transform translate-y-1/2 -translate-x-1/2">
                        <div className="overflow-hidden
                        w-24 h-24 md:w-32 md:h-32 
                        rounded-full 
                        border-[0.2rem] border-us-100 dark:border-us-700 
                        shadow-lg 
                        bg-us-300 dark:bg-me-700"
                        >
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
                            <h1 className="text-2xl text-scope-1000 font-bold text-center md:text-left mb-4">
                                {minter.business_name}
                            </h1>
                        )}

                        {/* Full Name */}
                        {(minter?.alt_luthier_name || minter?.first_name || minter?.last_name) && (
                            <h2 className="text-lg text-scope-700 text-center md:text-left mb-0">
                                {minter.alt_luthier_name || `${minter.first_name} ${minter.last_name}`}
                            </h2>
                        )}

                        {/* Verified Since */}
                        {minter?.is_verified && minter?.is_verified_since && (
                            <div className="mb-6 text-center md:text-left">
                                <span className="text-xs text-scope-700">
                                    {t('verfied_since')}:
                                </span>
                                <span className="text-xs text-scope-700 ml-2">
                                    {minter.is_verified_since}
                                </span>
                            </div>
                        )}

                        {/* Endorsed Skills */}
                        {minter?.skills && minter.skills.length > 0 && (
                            <div className="mb-6" data-theme="us">
                                {isMinter && instrumentTypesWithSkills.length > 0 && (
                                    <div className="">
                                        <h3 className="text-lg text-scope-1000 font-semibold mb-2">{t('account.minter_account')}</h3>
                                        <div className="flex flex-col gap-3">
                                            {instrumentTypesWithSkills.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-scope-700 font-medium text-md">
                                                        {item.instrumentType.name}
                                                    </span>
                                                    <span className="text-scope-500 ">›</span>
                                                    <div className="flex flex-wrap gap-1 gap-y-2">
                                                        {item.skills.map((skill: any, skillIdx: number) => (
                                                            <span key={skillIdx} className="px-3 py-1 bg-scope-100 text-scope-900 rounded-full text-md">
                                                                {skill.name.split(' construction')[0]}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {!isMinter && isLuthier && isVerified && (
                                    <h4 className="text-sm mt-4 text-us-500">
                                        {t('account.verified_luthier')}
                                    </h4>
                                )}
                                {isLuthier && !isVerified && (
                                    <h4 className="text-sm mt-4 text-us-500">
                                        {t('account.not_verified_luthier')}
                                    </h4>
                                )}
                            </div>
                        )}

                        {/* View complete profile on instruement.com/?author=[minter.user_id] */}
                        <div className="mb-6 pt-6">
                            <ButtonLink 
                                href={`https://www.instruement.com/?author=${minter?.user_id}`} 
                                theme="me" 
                                external={true}
                                size="md"
                                aria-label={t('view_complete_profile')}
                            >
                                {t('view_complete_profile')} <ExternalLink className="w-4 h-4" />
                            </ButtonLink>
                        </div>
                    </div>
                    <div className="flex flex-col justify-start items-end" data-theme="me">
                        <div className="w-full bg-scope-25 rounded-section px-4 py-4 mb-3">
                            {/* Address details: */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2 text-scope-1000">{t('address')}</h3>
                                <div className="text-scope-700">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={address || "No wallet address available"}
                                            disabled
                                            className="bg-scope-100 text-scope-700 p-2 rounded-button w-full"
                                            aria-label="Wallet address"
                                        />
                                        <button
                                            onClick={() => {
                                                if (address) {
                                                    navigator.clipboard.writeText(address);
                                                    const icon = document.querySelector('#copy-icon');
                                                    if (icon) {
                                                        icon.classList.remove('text-us-600');
                                                        icon.classList.add('text-me-500');
                                                        setTimeout(() => {
                                                            icon.classList.remove('text-us-500');
                                                            icon.classList.add('text-me-600');
                                                        }, 1000);
                                                    }
                                                }
                                            }}
                                            className="p-2 text-scope-700 hover:text-scope-1000 disabled:opacity-50"
                                            disabled={!address}
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
                                address && (
                                    <div className="mb-6">
                                        <ButtonQrTransfer address={address} locale={locale} context={context} />
                                    </div>
                                )
                            }
                        </div>
                        <div className="w-full bg-scope-25 rounded-section px-4 py-4 mb-12">
                            <h3 className="text-lg font-semibold mb-2 text-scope-1000">{t('wallet_actions_title')}</h3>
                            <p className="text-sm text-scope-700 mb-4">{t('wallet_actions_description')}</p>
                            {/* Connect Button */}
                            <CustomConnectButton cb={`/account`} />
                        </div>
                    </div>
                </div>
            </Section>
        </Page>
    );
}
