import { getContract } from "thirdweb";
import { client } from "./client";
import chain from "@/lib/chain";

export const contract = getContract({
    client,
    address: process.env.NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS!,
    chain: chain,
});
