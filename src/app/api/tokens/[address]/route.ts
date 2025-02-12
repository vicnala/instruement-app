'use server'

import { Engine } from "@thirdweb-dev/engine";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  if (!address) return Response.json(
    { message: 'No address provided' },
    { status: 400 }
  )

  const {
    BACKEND_WALLET_ADDRESS,
    INSTRUEMENT_API_USER,
    INSTRUEMENT_API_PASS,
    NEXT_PUBLIC_CLIENT_ID,
    ENGINE_URL,
    ENGINE_ACCESS_TOKEN,
    NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS,
    CHAIN_ID
  } = process.env;

  if (!BACKEND_WALLET_ADDRESS ||
    !INSTRUEMENT_API_USER ||
    !INSTRUEMENT_API_PASS ||
    !NEXT_PUBLIC_CLIENT_ID ||
    !ENGINE_URL ||
    !ENGINE_ACCESS_TOKEN ||
    !NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS ||
    !CHAIN_ID) {
    const message = "ERROR: check your .env file"
    return Response.json({ message })
  }

  const cahin = CHAIN_ID;
  const contractAddress = NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS;

  try {
    const engine = new Engine({
      url: ENGINE_URL,
      accessToken: ENGINE_ACCESS_TOKEN,
    });

    const { result } = await engine.erc721.getOwned(
      address,
      cahin,
      contractAddress
    );

    // console.log('tokens', result?.length);

    if (result) {
      return Response.json(result)
    }

    return Response.json(
      { message: 'Tokens error' }
    )
  } catch (err: any) {
    console.error(`/api/tokens/${address} error ${err.message}`)
    return Response.json(
      { message: err.message }
    )
  }
}