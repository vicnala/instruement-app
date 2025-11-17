"use client";

import { MediaRenderer } from "thirdweb/react";
import Skeleton from "@/components/Skeleton";
import { TransitionLink } from "@/components/UI/TransitionLink";
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
  locale: string;
};

export default function NFTComponent({
  nft,
  locale,
}: Props) {
  const t = useTranslations('components.NFT');
  if (!nft) {
    return <LoadingNFTComponent />;
  }

  return (
    <TransitionLink
      locale={locale}
      href={`/instrument/${nft.metadata.id.toString()}`}
      className={`group cursor-pointer transition-all hover:shadow-lg flex flex-col w-full justify-stretch overflow-hidden rounded-lg border 
        ${nft.metadata.iAmTheOwner ? 'bg-we-25 border-we-100 dark:bg-gray-900 dark:border-we-950' 
        : 'bg-it-25 border-it-100 dark:bg-gray-900 dark:border-gray-800'}`}
      aria-label={`${nft.metadata.name || nft.metadata.id.toString()}`}
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
          nft.metadata.iAmTheOwner && nft.metadata.iAmTheMinter && (
            <div className="absolute top-2 right-2 p-3 text-white bg-black/30 rounded-full group-hover:bg-we-400 transition-all">
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
        </div>
      </div>
    </TransitionLink>
  );
}

export function LoadingNFTComponent() {
  return (
    <div className="w-full h-[250px] rounded-lg">
      <Skeleton width="100%" height="100%" />
    </div>
  );
}