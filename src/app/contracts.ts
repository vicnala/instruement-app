import { getContract } from "thirdweb";
import { client } from "./client";
import chain from "@/lib/chain";

let contract: any = null;

try {
  if (process.env.NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS) {
    contract = getContract({
      client,
      address: process.env.NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS,
      chain: chain,
    });
  }
} catch (error) {
  console.warn('Failed to create contract:', error);
}

export { contract };
