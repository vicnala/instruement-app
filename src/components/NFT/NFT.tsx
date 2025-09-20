"use client";

import { MediaRenderer } from "thirdweb/react";
import Skeleton from "@/components/Skeleton";
import { useRouter } from "@/i18n/routing";
import { client } from "@/app/client";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  nft: {
    metadata: {
      id: string,
      name: string,
      image: string,
      isMinted: boolean,
      iAmTheOwner: boolean,
      iAmTheMinter: boolean
    }
  };
};

export default function NFTComponent({
  nft,
}: Props) {
  const router = useRouter();
  const t = useTranslations();
  if (!nft) {
    return <LoadingNFTComponent />;
  }

  return (
    <div
      className="cursor-pointer transition-all hover:shadow-lg || flex flex-col w-full bg-it-25 justify-stretch || overflow-hidden bg-it-25 border border-it-100 rounded-lg"
      onClick={() =>
        router.push(
          `/instrument/${nft.metadata.id.toString()}`
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
        <div className="sm:hidden absolute top-2 right-2 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-all">
          <Eye className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="flex items-center justify-between flex-1 w-full px-3">
        <div className="flex flex-col justify-center py-3">
          <p className="max-w-full overflow-hidden text-lg text-ellipsis whitespace-nowrap">
            {nft.metadata.name || JSON.stringify(nft.metadata, null, 2)}
          </p>
          <p className="text-sm font-semibold">
            #{nft.metadata.id.toString()}
            <span className="text-sm font-semibold">
              {nft.metadata.iAmTheOwner && (
                <span className="text-xs font-semibold">
                  {" "} {t('components.NFT.owner')}
                </span>
              )}
            </span>
            {
              nft.metadata.iAmTheOwner && nft.metadata.iAmTheMinter && (
                <span className="text-xs font-semibold">
                  {" "} {t('components.NFT.and')}
                </span>
              )
            }
            <span className="text-sm font-semibold">
              {nft.metadata.iAmTheMinter && (
                <span className="text-xs font-semibold">
                  {" "} {t('components.NFT.minter')}
                </span>
              )}
            </span>
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