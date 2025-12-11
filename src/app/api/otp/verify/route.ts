'use server'

import { headers } from "@/lib/authorizationHeaders";

export async function POST(request: Request) {
  const { email, otp, token, address, accepted_terms } = await request.json()

  console.log('email', email);
  console.log('otp', otp);
  console.log('token', token);
  console.log('address', address);
  console.log('accepted_terms', accepted_terms);

  if (!address) return Response.json(
    { message: 'Address is required' },
    { status: 400 }
  )

  if (!accepted_terms) return Response.json(
    { message: 'Accepted terms are required' },
    { status: 400 }
  )

  if (email && !otp) return Response.json(
    { message: 'OTP is required' },
    { status: 400 }
  )

  if (otp && !email) return Response.json(
    { message: 'Email is required' },
    { status: 400 }
  )

  if (!token) return Response.json(
    { message: 'Token is required' },
    { status: 400 }
  )
    
  try {
    let result;
    if (email && otp) {
      result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/otp/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, otp, accepted_terms })
      })
    } else if (token) {
      result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/otp/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ token, accepted_terms })
      })
    }

    if (!result) return Response.json(
      { message: 'Verify error' },
      { status: 400 }
    )


    const data = await result.json();

    // console.log(`/api/otp/verfy`, data);

    if (data?.code === 'success') {
      const { session } = data.data;
      if (session) {
        const userResult = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/user/${encodeURIComponent(email)}`, {
          method: 'GET',
          headers,
        });

        const data = await userResult.json();

        if (data && data.code === 'success') {
          const { user_id } = data.data;

          const addAdress = {
            type: "blockchain",
            location: ["Ethereum"],
            address,
            user_id,
            session
          }

          const addAdressResult = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/address`, {
            method: 'POST',
            headers,
            body: JSON.stringify(addAdress)
          })

          if (addAdressResult && addAdressResult.status === 200) {
            return Response.json({ code: 'success' })
          }
        }
      }
    }

    return Response.json(
      { message: data?.message ? data.message : 'Verify error' },
      { status: 400 }
    )
  } catch (err: any) {
    // console.error(`/api/otp/verify/${email}:`, err.message)
    return Response.json(
      { message: err.message },
      { status: 400 }
    )
  }
}