"use client";

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import Page from "@/components/Page";
import Section from "@/components/Section";
import Loading from "@/components/Loading";
import NotConnected from "@/components/NotConnected";
import { useRouter } from "@/i18n/routing";
import { Instrument, InstrumentFile, InstrumentImage } from "@/lib/definitions";

export default function Preview(
  { locale, id }: Readonly<{ locale: string, id?: string }>
) {
  const t = useTranslations();
  const { minter, isLoading, address } = useStateContext()
  const [instrument, setInstrument] = useState<Instrument>()
  const [isLoadingInstrument, setIsLoadingInstrument] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const getInstrument = async () => {
      setIsLoadingInstrument(true);
      try {
        const result = await fetch(`/api/instrument/${id}?locale=${locale}`, {
          method: "GET",
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        const { data } = await result.json()
        // console.log("GET", `/api/instrument/${id}`, data.data);

        if (data.code !== 'success') {
          console.log(`GET /api/instrument/${id} ERROR`, data.message);
          alert(`Error: ${data.message}`);
        } else {
          const imageIds = data.data.images;
          const fileIds = data.data.files;
          const coverId = data.data.cover_image;

          if (imageIds && imageIds.length > 0) {
            const sorted = imageIds
              .filter((id: number) => id !== coverId)
              .sort((ida: number, idb: number) => ida > idb ? 1 : -1);
            const _images: InstrumentImage[] = await Promise.all(
              sorted.map(async (imgId: number) => {
                const result = await fetch(`/api/file/${imgId}`, {
                  method: "GET",
                  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
                })
                const { data: imageData } = await result.json()
                if (imageData.code !== 'success') {
                  console.log(`GET /api/file/${imgId} ERROR`, imageData.message);
                  return ({
                    id: imgId,
                    file_url: data.data.placeholder_image,
                    description: 'Image not found'
                  })
                } else {
                  return imageData.data;
                }
              })
            ) || [];
          
            data.data.images = _images;
          }

          if (fileIds && fileIds.length > 0) {
            const sorted = fileIds.sort((ida: number, idb: number) => ida > idb ? 1 : -1);
            const files: InstrumentFile[] = await Promise.all(
              sorted.map(async (fileId: number) => {
                const result = await fetch(`/api/file/${fileId}`, {
                  method: "GET",
                  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
                })
                const { data: fileData } = await result.json()
                if (fileData.code !== 'success') {
                  console.log(`GET /api/file/${fileId} ERROR`, fileData.message);
                  return ({
                    id: fileId,
                    file_url: "/images/icons/android-chrome-512x512.png",
                    description: 'File not found'
                  })
                } else {
                  return fileData.data;
                }
              })
            ) || [];
          
            data.data.files = files;
          }

          if (coverId) {
            const result = await fetch(`/api/file/${coverId}`, {
              method: "GET",
              headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            })
            const { data: imageData } = await result.json()
            if (imageData.code !== 'success') {
              console.log(`GET /api/file/${coverId} ERROR`, imageData.message);
            } else {
              data.data.cover_image = imageData.data;
            }
          }
          setInstrument(data.data);
        }
        setIsLoadingInstrument(false);
      } catch (error: any) {
        console.log(`POST /api/instrument/${id} ERROR`, error.message)
        alert(`Error: ${error.message}`);
        setIsLoadingInstrument(false);
      } 
    }
    if (id && !isLoadingInstrument) {
      getInstrument();
    }
  }, []);

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
          <p>
            {JSON.stringify(instrument)}
          </p>

          {
            instrument && instrument.type && instrument.title && instrument.description && instrument.images?.length > 0 &&
            <div className="mt-6 text-center">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                onClick={() => router.push(`/pay/${instrument.id}${address && `?address=${address}`}`)}
              >
                {t('register.register')}
              </button>
            </div>
          }
        </Section>
    </Page> :
    <NotConnected locale={locale} />
  );
}
