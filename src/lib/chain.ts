import { defineChain } from "thirdweb/chains";
 
export default defineChain({
  id: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "421614")
});