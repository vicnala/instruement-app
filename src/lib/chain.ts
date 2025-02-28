import { defineChain } from "thirdweb/chains";
 
export default defineChain({
  id: parseInt(process.env.CHAIN_ID || "84532")
});