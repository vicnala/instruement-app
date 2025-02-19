import { createThirdwebClient } from "thirdweb";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = process.env.NEXT_PUBLIC_CLIENT_ID!;
// const secretKey = process.env.THIRDWEB_SECRET_KEY!;
const secretKey = '';

if (!clientId) {
  throw new Error("No client ID provided");
}

export const client = createThirdwebClient(
  secretKey ? { secretKey } : { clientId },
);