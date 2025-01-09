"use client";

import { MediaRenderer } from "thirdweb/react";
import Skeleton from "@/components/Skeleton";
import { useRouter } from "@/i18n/routing";
import { client } from "@/app/client";

type Props = {
  nft: any;
};

export default function NFTComponent({
  nft,
}: Props) {
  const router = useRouter();

  if (!nft) {
    return <LoadingNFTComponent />;
  }

  return (
    <div
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col w-full h-[250px] bg-white/[.04] justify-stretch border overflow-hidden border-white/10 rounded-lg"
      onClick={() =>
        router.push(
          `/instrument/${nft.metadata.id.toString()}`
        )
      }
    >
      <div className="relative w-full bg-white/[.04]">
        {nft.metadata.image && (
          <MediaRenderer
            src={nft.metadata.image}
            client={client}
            className="object-cover object-center"
          />
        )}
      </div>
      <div className="flex items-center justify-between flex-1 w-full px-3">
        <div className="flex flex-col justify-center py-3">
          <p className="max-w-full overflow-hidden text-lg text-ellipsis whitespace-nowrap">
            {nft.metadata.name}
          </p>
          <p className="text-sm font-semibold">
            #{nft.metadata.id.toString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoadingNFTComponent() {
  return (
    <div className="w-full h-[250px] rounded-lg">
      <Skeleton width="100%" height="100%" />
    </div>
  );
}