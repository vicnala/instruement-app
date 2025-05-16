"use client";

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Instrument, InstrumentImage } from "@/lib/definitions";
import Skeleton from "@/components/Skeleton";
import IconEdit from '../Icons/Edit';
import InstrumentService from "@/services/InstrumentService";

export default function Draft(
  { instrumentId, locale, api_key }: { instrumentId: string, locale: string, api_key: string }
) {
  const router = useRouter();
  const t = useTranslations('components.Drfat');
  const [instrument, setInstrument] = useState<Instrument>()
  const [image, setImage] = useState<InstrumentImage>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const getInstrument = async () => {
      if (!instrumentId || isLoading) return;
      
      setIsLoading(true);
      try {
        const data = await InstrumentService.getInstrument(instrumentId, locale, api_key);
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
      setIsLoading(true);
      getInstrument();
    }
  }, [instrumentId, locale, api_key, isLoading, instrument]);

  return (
    <div
      className="cursor-pointer transition-all hover:shadow-lg || flex flex-col w-full justify-stretch min-h-[200px] || overflow-hidden bg-it-25 border border-it-100 rounded-lg"
      onClick={() => instrument && !instrument.queue_id && !instrument.asset_id ? router.push(`/drafts/${instrumentId}`) : null}
    >
      <div className="relative w-full aspect-square bg-white/[.04]">
        {
          isLoading ?
          <Skeleton width="100%" height="100%" /> :
          <>
            {
              instrument && instrument.queue_id && !instrument.asset_id ?
              <div className="absolute top-2 left-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all">
                {t("registering")}
              </div> : instrument && instrument.asset_id ?
              <div className="absolute top-2 left-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all">
                #{instrument.asset_id}
              </div> :
              <div className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all">
                <IconEdit 
                  width="20"
                  height="20"
                  className="text-white"
                />
              </div>
            }
            { image ? 
              <Image
                src={image.file_url}
                width={500}
                height={500}
                alt={image.description}
                className="object-cover w-full h-full"
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
