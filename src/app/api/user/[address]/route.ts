'use server'

import { headers } from "@/lib/authorizationHeaders";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  if (!address) return Response.json(
    { message: 'No address provided' },
    { status: 400 }
  )

  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/user/${address}`, {
      headers,
      cache: 'no-store'
    })
    const data = await result.json()

    if (data?.code === 'success') {
      return Response.json(data.data)
    }

    return Response.json(
      { message: data?.message ? data.message : 'User error' }
    )
  } catch (err: any) {
    console.error(`/api/user/[${address}] error ${err.message}`)
    return Response.json(
      { message: err.message }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params
  const { user_id, session } = await request.json()

  if (!address) return Response.json(
    { message: 'No address provided' },
    { status: 400 }
  )

  if (!user_id) return Response.json(
    { message: 'User ID is required' },
    { status: 400 }
  )

  if (!session) return Response.json(
    { message: 'Session is required' },
    { status: 400 }
  )

  try {
    const addAddressBody = {
      type: "blockchain",
      location: ["Ethereum"],
      address,
      user_id,
      session
    }

    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/address`, {
      method: 'POST',
      headers,
      body: JSON.stringify(addAddressBody)
    })

    const data = await result.json()

    if (result.status === 200 && data?.code === 'success') {
      return Response.json({ code: 'success', data: data.data })
    }

    return Response.json(
      { message: data?.message || 'Failed to add address' },
      { status: 400 }
    )
  } catch (err: any) {
    console.error(`/api/user/[${address}] POST error:`, err.message)
    return Response.json(
      { message: err.message },
      { status: 400 }
    )
  }
}