"use client";

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/routing";
import { useStateContext } from "@/app/context";
import Image from "next/image";
import { Instrument, InstrumentImage } from "@/lib/definitions";
import Skeleton from "@/components/Skeleton";

export default function Draft(
  { instrumentId, address: queryAddress }: { instrumentId: string, address: string | undefined}
) {
  const router = useRouter();
  const { address } = useStateContext()
  const [instrument, setInstrument] = useState<Instrument>()
  const [image, setImage] = useState<InstrumentImage>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const getInstrument = async () => {     
      try {
        const result = await fetch(`/api/instrument/${instrumentId}`, {
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

          const imageIds = data.data.images;
          if (imageIds && imageIds.length > 0) {
            const sorted = imageIds.sort((ida: number, idb: number) => ida > idb ? 1 : -1);
            const coverId = sorted[0];
            const result = await fetch(`/api/file/${coverId}`, {
              method: "GET",
              headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            })
            const { data } = await result.json()
            // console.log("GET", `/api/file/${coverId}`, data.data);
            setImage(data.data);
          }
          setIsLoading(false);
        }
      } catch (error: any) {
        console.log(`POST /api/instrument/${instrumentId} ERROR`, error.message)
        alert(`Error: ${error.message}`);
        setIsLoading(false);
      } 
    }
    if (instrumentId && !image && !isLoading) {
      setIsLoading(true);
      getInstrument();
    }
  }, [instrumentId, image, isLoading]);

  return (
    <div
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col w-full h-[350px] bg-white/[.04] justify-stretch border overflow-hidden border-white/10 rounded-lg"
      onClick={() =>
        router.push(
          `/drafts/${instrumentId}${queryAddress ? `?address=${queryAddress}` : `?address=${address}`}`
        )
      }
    >
      <div className="relative w-full bg-white/[.04]">
        { image ? 
          <Image
            src={image.file_url}
            width={500}
            height={500}
            alt={image.description}
          /> :
          <div className="w-full h-[250px] rounded-lg">
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
            #{instrumentId}
          </p>
        </div>
      </div>
    </div>
  );
}
