"use client";

import { useRouter } from "@/i18n/routing";
import { useStateContext } from "@/app/context";
import Image from "next/image";

export default function Draft({ draft }: any) {
  const router = useRouter();
  const { address } = useStateContext()

  return (
    <div
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col w-full h-[350px] bg-white/[.04] justify-stretch border overflow-hidden border-white/10 rounded-lg"
      onClick={() =>
        router.push(
          `/drafts/${draft.id.toString()}${draft.address ? `?address=${draft.address}` : `?address=${address}`}`
        )
      }
    >
      <div className="relative w-full bg-white/[.04]">
        {draft.images.length > 0 && draft.images[0][0] && (
          <Image
            src={draft.images[0][0].file_url}
            width={500}
            height={500}
            alt="Picture of the author"
          />
        )}
      </div>
      <div className="flex items-center justify-between flex-1 w-full px-3">
        <div className="flex flex-col justify-center py-3">
          <p className="max-w-full overflow-hidden text-lg text-ellipsis whitespace-nowrap">
            {draft.title}
          </p>
          <p className="text-sm font-semibold">
            #{draft.id.toString()}
          </p>
        </div>
      </div>
    </div>
  );
}
