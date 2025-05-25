"use client";

import { MediaRenderer } from "thirdweb/react";
import Skeleton from "@/components/Skeleton";
import { useRouter } from "@/i18n/routing";
import { client } from "@/app/client";

type Props = {
  nft: {
    id: string,
    metadata: {
      name: string,
      image: string
    }
  };
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
      className="cursor-pointer transition-all hover:shadow-lg || flex flex-col w-full bg-it-25 justify-stretch || overflow-hidden bg-it-25 border border-it-100 rounded-lg"
      onClick={() =>
        router.push(
          `/instrument/${nft.id.toString()}`
        )
      }
    >
      <div className="relative w-full aspect-square bg-it-50">
        {nft.metadata.image && (
          <MediaRenderer
            src={nft.metadata.image}
            client={client}
            style={{ objectFit: "cover" }}
            className="w-full h-full"
          />
        )}
      </div>
      <div className="flex items-center justify-between flex-1 w-full px-3">
        <div className="flex flex-col justify-center py-3">
          <p className="max-w-full overflow-hidden text-lg text-ellipsis whitespace-nowrap">
            {nft.metadata.name || JSON.stringify(nft.metadata, null, 2)}
          </p>
          <p className="text-sm font-semibold">
            #{nft.id.toString()}
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