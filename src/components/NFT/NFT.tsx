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
      theme={nft.metadata.iAmTheOwner ? "we" : "it"}
      className="group cursor-pointer transition-all hover:shadow-sm flex flex-col w-full justify-stretch overflow-hidden rounded-lg border bg-scope-25 hover:bg-scope-50 border-scope-100 hover:border-scope-200 border-[0.1rem]"
      aria-label={`${nft.metadata.name || nft.metadata.id.toString()}`}
    >
      <div className="relative w-full aspect-square">
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
            <div className="absolute top-2 right-2 p-2 text-scope-100 group-hover:text-scope-25 rounded-full bg-scope-500 border border-scope-500 border-[0.1rem] transition-all">
              <Send className="w-4 h-4" />
            </div>
          )
        }
      </div>
      <div className="flex items-center justify-between flex-1 w-full px-3">
        <div className="flex flex-col justify-center py-3">
          <h3 className="max-w-full overflow-hidden text-xl font-bold text-ellipsis text-scope-1000">
            {nft.metadata.name || JSON.stringify(nft.metadata, null, 2)}
          </h3>
        </div>
      </div>
    </TransitionLink>
  );
}

export function LoadingNFTComponent() {
  return (
    <div className="w-full aspect-square rounded-lg">
      <Skeleton width="100%" height="100%" />
    </div>
  );
}