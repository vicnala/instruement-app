"use client";

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/routing";
import { hexToBigInt } from "thirdweb/utils";
import { useStateContext } from "@/app/context";
import Image from "next/image";
import { Instrument, InstrumentImage } from "@/lib/definitions";
import Skeleton from "@/components/Skeleton";
import IconEdit from '../Icons/Edit';
import IconInfo from '../Icons/Info';

export default function Draft(
  { instrumentId, address: queryAddress, locale }: { instrumentId: string, address: string | undefined, locale: string }
) {
  const router = useRouter();
  const { address } = useStateContext()
  const [instrument, setInstrument] = useState<Instrument>()
  const [image, setImage] = useState<InstrumentImage>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const getInstrument = async () => {
      try {
        const result = await fetch(`/api/instrument/${instrumentId}?locale=${locale}`, {
          method: "GET",
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })

        const { data } = await result.json()
        // console.log("GET", `/api/instrument/${instrumentId}`, data.data);

        if (data.code !== 'success') {
          console.log(`GET /api/instrument/${instrumentId} ERROR`, data.message);
          alert(`Error: ${data.message}`);
          setIsLoading(false);
        } else {
          setInstrument(data.data);
          if (data.data.cover_image) {
            const result = await fetch(`/api/file/${data.data.cover_image}`, {
              method: "GET",
              headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            })
            const { data: imageData } = await result.json();
            // console.log('Image data:', imageData.data);
            setImage(imageData.data);
          } else {
            const _image = {
              file_url: data.data.placeholder_image || '',
              description: ''
            }
            setImage(_image as InstrumentImage);
          }
          setIsLoading(false);
        }
      } catch (error: any) {
        console.log(`GET /api/instrument/${instrumentId} ERROR`, error.message)
        alert(`Error: ${error.message}`);
        setIsLoading(false);
      } 
    }
    if (instrumentId && !isLoading) {
      setIsLoading(true);
      getInstrument();
    }
  }, []);

  return (
    <div
      className="cursor-pointer transition-all hover:shadow-lg || flex flex-col w-full justify-stretch min-h-[120vw] md:min-h-[200px] || overflow-hidden bg-it-25 border border-it-100 rounded-lg"
      onClick={() => instrument && !instrument.asset_id &&
        router.push(
          `/drafts/${instrumentId}${queryAddress ? `?address=${queryAddress}` : `?address=${address}`}`
        )
      }
    >
      <div className="relative w-full bg-white/[.04]">
        {
          instrument && instrument.asset_id ?
            <div className="text-white absolute top-2 left-2 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all">
              #{instrument.asset_id}
          </div> : 
          <div className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all">
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
          /> :
          <div className="w-full rounded-lg">
            <Skeleton width="100%" height="100%" />
          </div>
        }
      </div>
      <div className="flex items-center justify-between flex-1 w-full px-3">
        <div className="flex flex-col justify-center py-3">
          <p className="max-w-full overflow-hidden text-lg text-ellipsis whitespace-nowrap">
            {instrument?.title}
          </p>
          <p className="text-sm font-semibold">
            {instrument?.type_name}
          </p>
        </div>
      </div>
    </div>
  );
}
