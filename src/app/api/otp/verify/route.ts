'use server'

import { headers } from "@/lib/authorizationHeaders";

export async function POST(request: Request) {
  const { email, otp, address, accepted_terms } = await request.json()

  if (!address) return Response.json(
    { message: 'Address is required' },
    { status: 400 }
  )

  if (!accepted_terms) return Response.json(
    { message: 'Accepted terms are required' },
    { status: 400 }
  )

  if (!email) return Response.json(
    { message: 'Email is required' },
    { status: 400 }
  )

  if (!otp) return Response.json(
    { message: 'OTP is required' },
    { status: 400 }
  )
    
  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/otp/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, otp, accepted_terms })
    })

    if (!result) return Response.json(
      { message: 'Verify error' },
      { status: 400 }
    )

    const data = await result.json();

    if (data?.code === 'success') {
      const { session, user_id } = data.data;
      if (session && user_id) {
        const addAddress = {
          type: "blockchain",
          location: ["Ethereum"],
          address,
          user_id,
          session
        }

        const addAddressResult = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/address`, {
          method: 'POST',
          headers,
          body: JSON.stringify(addAddress)
        })

        if (addAddressResult && addAddressResult.status === 200) {
          return Response.json({ code: 'success' })
        }
      }
    }

    return Response.json(
      { message: data?.message ? data.message : 'Verify error' },
      { status: 400 }
    )
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      { status: 400 }
    )
  }
}
