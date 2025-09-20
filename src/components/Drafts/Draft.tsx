"use client";

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Instrument, InstrumentImage } from "@/lib/definitions";
import Skeleton from "@/components/Skeleton";
import { Loader2, Pencil } from "lucide-react";
import InstrumentService from "@/services/InstrumentService";

export default function Draft(
  { instrumentId, locale, api_key }: { instrumentId: string, locale: string, api_key: string }
) {
  const router = useRouter();
  const t = useTranslations('components.Draft');
  const [instrument, setInstrument] = useState<Instrument>()
  const [image, setImage] = useState<InstrumentImage>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const getInstrument = async () => {
      setIsLoading(true);
      try {
        const data = await InstrumentService.getInstrument(instrumentId, locale, api_key, true);
        if (data) {
          setInstrument(data);
          if (data.cover_image) {
            setImage(data.cover_image);
          } else {
            setImage({ file_url: data.placeholder_image || '', description: '' } as InstrumentImage);
          }
        }
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    }

    if (instrumentId && !isLoading && !instrument) {
      getInstrument();
    }
  }, [instrumentId, locale, api_key, isLoading, instrument]);

  return (
    <div
      className={`${!instrument?.queue_id ? 'cursor-pointer transition-all hover:shadow-lg' : 'cursor-wait'} flex flex-col w-full justify-stretch overflow-hidden bg-it-25 border border-it-100 rounded-lg`}
      onClick={() => instrument && !instrument.queue_id ? router.push(`/drafts/${instrumentId}`) : null}
    >
      <div className="relative w-full aspect-square bg-white/[.04]">
        {
          isLoading ?
          <Skeleton width="100%" height="100%" /> :
          <>
            {
              instrument && instrument.queue_id ?
              <div className="absolute text-white top-2 left-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all text-center flex items-center justify-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("registering")}
              </div> 
              :
              <div className="absolute top-2 right-2 p-2 bg-black/30 rounded-full hover:bg-it-400 transition-all">
                <Pencil className="w-4 h-4 text-white" />
              </div>
            }
            { image ? 
              <Image
                src={image.file_url}
                width={500}
                height={500}
                alt={image.description}
                className="object-cover aspect-square w-full"
              /> :
              <div className="w-full h-full rounded-lg">
              </div>
            }
          </>
        }
      </div>
      <div className="flex items-center justify-between flex-1 w-full px-3">
        <div className="flex flex-col justify-center py-3">
          <p className="max-w-full overflow-hidden text-md md:text-lg text-ellipsis whitespace-nowrap">
            {instrument?.title}
          </p>
          <p className="text-xs md:text-sm font-semibold">
            {instrument?.type_name}
          </p>
        </div>
      </div>
    </div>
  );
}
