"use client";

import { MediaRenderer } from "thirdweb/react";
import Skeleton from "@/components/Skeleton";
import { useRouter } from "@/i18n/routing";
import { client } from "@/app/client";
import { Send } from "lucide-react";
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
      className={`cursor-pointer transition-all hover:shadow-lg flex flex-col w-full justify-stretch overflow-hidden rounded-lg ${nft.metadata.iAmTheOwner ? 'bg-we-25 border border-we-100' : 'bg-it-25 border border-it-100'}`}
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
            className="aspect-square w-full h-full"
          />
        )}
        { 
          nft.metadata.iAmTheOwner && (
            <div className="absolute top-2 right-2 p-3 text-white bg-black/30 rounded-full hover:bg-we-400 transition-all">
              <Send className="w-4 h-4 text-white" />
            </div>
          )
        }
      </div>
      <div className="flex items-center justify-between flex-1 w-full px-3">
        <div className="flex flex-col justify-center py-3">
          <h3 className="max-w-full overflow-hidden text-xl font-bold text-ellipsis">
            {nft.metadata.name || JSON.stringify(nft.metadata, null, 2)}
          </h3>
          
          {/* <p className="text-sm font-semibold">
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
          </p> */}
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