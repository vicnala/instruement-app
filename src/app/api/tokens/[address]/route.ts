'use server'

// import { Engine } from "@thirdweb-dev/engine";

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
    NEXT_PUBLIC_CHAIN_ID
  } = process.env;

  if (!BACKEND_WALLET_ADDRESS ||
    !INSTRUEMENT_API_USER ||
    !INSTRUEMENT_API_PASS ||
    !NEXT_PUBLIC_CLIENT_ID ||
    !ENGINE_URL ||
    !ENGINE_ACCESS_TOKEN ||
    !NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS ||
    !NEXT_PUBLIC_CHAIN_ID) {
    const message = "ERROR: check your .env file"
    return Response.json({ message })
  }

  try {
    // const engine = new Engine({
    //   url: ENGINE_URL,
    //   accessToken: ENGINE_ACCESS_TOKEN
    // });

    // const { result } = await engine.erc721.getOwned(
    //   address,
    //   NEXT_PUBLIC_CHAIN_ID,
    //   NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS
    // );

    const fetchResult = await fetch(`${ENGINE_URL}/contract/${NEXT_PUBLIC_CHAIN_ID}/${NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS}/erc721/get-owned?walletAddress=${address}`, {
      headers: { Authorization: `Bearer ${ENGINE_ACCESS_TOKEN}` }
    })
    const { result } = await fetchResult.json()
    
    if (result) {
       console.log(address, 'has', result?.length, 'tokens from', NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS, 'on chain', NEXT_PUBLIC_CHAIN_ID);
      return Response.json(result)
    }

    return Response.json(
      { message: 'Tokens error' },
      { status: 400 }
    )
  } catch (err: any) {
    console.error(`/api/tokens/${address} error ${err.message}`)
    return Response.json(
      { message: err.message },
      { status: 400 }
    )
  }
}