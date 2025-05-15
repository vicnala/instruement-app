"use client";

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Section from "@/components/Section";
import Loading from "@/components/Loading";
import NotConnected from "@/components/NotConnected";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { Instrument } from "@/lib/definitions";
import { Expand, Download } from "lucide-react";
import InstrumentService from "@/services/InstrumentService";

export default function Preview(
  { locale, id }: Readonly<{ locale: string, id?: string }>
) {
  const t = useTranslations('components.Preview');
  const { minter, isLoading, address } = useStateContext()
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

    if (id && !isLoadingInstrument && !instrument && minter) {
      setIsLoadingInstrument(true);
      getInstrument();
    }

  }, [id, locale, isLoadingInstrument, instrument, minter]);

  if (isLoading || isLoadingInstrument) return (
    <Page>
      <div className="text-center">
        <Loading />
      </div>
    </Page>
  )

  return (
    minter ?
    <Page>
        <Section>
          <div className="flex justify-between items-start px-3 md:px-6 py-2 md:py-4 border border-it-100 bg-it-50 rounded-[15px]">
            <div>
              <h1 className="text-3xl font-bold text-it-1000">{instrument?.title}</h1>
              <p className="text-lg text-it-900">{instrument?.type_name}</p>
            </div>
            {instrument?.updated_at && (
              <p className="text-sm font-bold text-it-800">
                {new Date(instrument.updated_at).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 md:mt-8">
            {/* Left Column - Cover Image and Description */}
            <div className="flex flex-col space-y-8 md:space-y-10">
              {instrument?.cover_image && (
                <div>
                  <div className="rounded-lg relative bg-it-100 border border-it-200 shadow-md overflow-hidden">
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
                    <div className="w-full aspect-square bg-white/[.04]"> 
                      <Image 
                        src={instrument.cover_image.file_url}
                        alt={instrument.cover_image.description || t('no_description')}
                        width={800}
                        height={800}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <p className="text-it-1000 p-4">
                      {instrument.cover_image.description || t('no_description')}
                    </p>
                  </div>
                </div>
              )}
              {instrument?.images && instrument.images.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">{t('additional_images')}</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {instrument.images.map((image, index) => (
                      <div key={index} className="relative bg-it-100 border border-it-200 rounded-lg overflow-hidden">
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
                        <p className="text-it-1000 p-2 text-sm">
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
                        className="w-full flex items-center justify-between p-4 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
                        tabIndex={0}
                        role="link" 
                        aria-label={`Download ${file.title}`}
                        download={file.title}
                      >
                        <div className="flex flex-col items-start">
                          <h3 className="text-lg font-medium">{file.title}</h3>
                          <p className="text-sm text-gray-500">
                            {file.description || t('no_description')}
                          </p>
                        </div>
                        <Download className="w-6 h-6 text-gray-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Instrument Description */}
            <div>
              <p className="text-lg text-gray-800">
                {instrument?.description}
              </p>
            </div>
          </div>

          {
            instrument && instrument.type && instrument.title && instrument.description && instrument.images?.length > 0 &&
            <div className="mt-6 px-3 md:px-6 py-2 md:py-4 text-center border border-it-100 bg-it-50 rounded-[15px]">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                onClick={() => router.push(`/pay/${instrument.id}${address && `?address=${address}`}`)}
              >
                {t('register_now')}
              </button>
            </div>
          }
        </Section>
    </Page> :
    <NotConnected locale={locale} />
  );
}
