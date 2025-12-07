"use client";

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl";
import Page from "@/components/Page";
import Section from "@/components/Section";
import Loading from "@/components/Loading"
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { Instrument } from "@/lib/definitions";
import { Expand, Download, ArrowLeft, ArrowRight } from "lucide-react";
import { TransitionLink } from "@/components/UI/TransitionLink";
import InstrumentService from "@/services/InstrumentService";
import { marked } from "marked";

// Configure marked options
marked.use({
  breaks: true
});

export default function Preview(
  { locale,
    id,
    context,
    minter
  }: Readonly<
    { locale: string,
      id?: string,
      context: any,
      minter: any
    }>
) {
  const t = useTranslations('components.Preview');
  const isLoading = context.ctx.isLoading;
  const address = context.sub;
  const [instrument, setInstrument] = useState<Instrument>()
  const [isLoadingInstrument, setIsLoadingInstrument] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const getInstrument = async () => {
      if (!id || isLoadingInstrument) return;
      setIsLoadingInstrument(true);
      const data = await InstrumentService.getInstrument(id, locale, minter?.api_key);
      
      if (data) {
        setInstrument(data);
      }
      
      setIsLoadingInstrument(false);
    }

    if (id && !isLoadingInstrument && !instrument) {
      setIsLoadingInstrument(true);
      getInstrument();
    }

  }, [id, locale, isLoadingInstrument, instrument, minter?.api_key]);

  if (isLoading || isLoadingInstrument || !address) return <Loading />

  return (
    <Page context={context}>
      { minter && <>
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 md:mt-8">
            {/* Left Column - Cover Image and Description */}
            <div className="flex flex-col space-y-8 md:space-y-10">
              {instrument?.cover_image && (
                <div>
                  <div className="rounded-section relative bg-scope-50 border border-scope-100 overflow-hidden">
                    <div className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all cursor-pointer" 
                         onClick={() => window.open(instrument.cover_image.file_url, '_blank')}
                         onKeyDown={(e) => e.key === 'Enter' && window.open(instrument.cover_image.file_url, '_blank')}
                         tabIndex={0}
                         role="button"
                         aria-label="View full size image">
                      <Expand
                        size={20}
                        className="text-white" 
                      />
                    </div>
                    <div className="w-full bg-white/[.04]"> 
                      <Image 
                        src={instrument.cover_image.file_url}
                        alt={instrument.cover_image.description || t('no_description')}
                        width={800}
                        height={800}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {/* <p className="text-it-1000 p-4">
                      {instrument.cover_image.description || t('no_description')}
                    </p> */}
                  </div>
                </div>
              )}
              {instrument?.images && instrument.images.length > 0 && (
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    {instrument.images.map((image, index) => (
                      <div key={index} className="relative bg-scope-25 border border-scope-50 rounded-button overflow-hidden">
                        <div 
                          className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all cursor-pointer"
                          onClick={() => window.open(image.file_url, '_blank')}
                          onKeyDown={(e) => e.key === 'Enter' && window.open(image.file_url, '_blank')}
                          tabIndex={0}
                          role="button"
                          aria-label="View full size image"
                        >
                          <Expand
                            size={20}
                            className="text-white"
                          />
                        </div>
                        <div className="w-full aspect-square bg-white/[.04]">
                          <Image
                            src={image.file_url}
                            alt={image.description || t('no_description')}
                            width={400}
                            height={400}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <p className={`p-2 text-sm ${image.description ? 'text-it-1000' : 'text-us-500'}`}>
                          {image.description || t('no_description')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {instrument?.files && instrument.files.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">{t('documents')}</h2>
                  <div className="flex flex-col gap-2">
                  {instrument.files.map((file, index) => (
                      <a
                        key={index}
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-4 border-[0.1rem] border-scope-400 rounded-button hover:bg-scope-50 transition-colors group"
                        tabIndex={0}
                        role="link" 
                        aria-label={`Download ${file.title}`}
                        download={file.title}
                      >
                        <div className="flex flex-col items-start">
                          <h3 className="text-lg font-medium text-scope-1000 group-hover:text-scope-900">{file.title}</h3>
                          <p className="text-sm text-scope-700">
                            {file.description || t('no_description')}
                          </p>
                        </div>
                        <Download className="w-6 h-6 text-us-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Instrument Description */}
            <div>
              <div className="text-scope-1000">
                {instrument?.updated_at && (
                  <p className="text-sm text-right text-scope-700">
                    {new Date(instrument.updated_at).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
                <div>
                  <h1 className="text-3xl font-bold">{instrument?.title}</h1>
                  <h3 className="text-xl mb-3">{instrument?.type_name}</h3>

                  <div className="rounded-section bg-scope-50 border border-scope-100 p-4 mb-4">
                    <h4 className="text-sm text-scope-700">{minter?.business_name ? `${t('registered_by')} ${minter.business_name}` : ''}</h4>
                  </div>
                
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-4 text-scope-1000">{t('description')}</h2>
              <div 
                className="text-base text-scope-700 flex flex-col gap-4"
                dangerouslySetInnerHTML={{ __html: marked.parse(instrument?.description || '') as string }}
              />
            </div>
          </div>

          {
            instrument && instrument.type && instrument.title && instrument.description && instrument.images?.length > 0 &&
            <div className="flex justify-between items-center my-8" data-theme="it">
              {/* Button to go back to draft */}
              <TransitionLink
                href={`/drafts/${instrument.id}`}
                locale={locale}
                className="
                inline-flex items-center px-4 py-2 transition-colors duration-200 transform focus:outline-none
                text-scope-500 font-bold hover:text-scope-1000 
                bg-transparent hover:bg-scope-500 
                border-[0.1rem] border-scope-300 hover:border-scope-500 focus:border-scope-25
                rounded-button"
                aria-label={t('back_to_draft')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('back_to_draft')}
              </TransitionLink>
              <TransitionLink
                href={`/pay/${instrument.id}${address && `?address=${address}`}`}
                locale={locale}
                className="
                inline-flex items-center px-4 py-2 transition-colors duration-200 transform focus:outline-none
                text-scope-500 font-bold hover:text-scope-1000 
                bg-transparent hover:bg-scope-500 
                border-[0.1rem] border-scope-300 hover:border-scope-500 focus:border-scope-25
                rounded-button"
                aria-label={t('register_now')}
              >
                {t('register_now')}
                <ArrowRight className="w-4 h-4 ml-2" />                
              </TransitionLink>
            </div>
          }
        </Section>
      </> }
    </Page>
  );
}
