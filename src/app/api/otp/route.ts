'use server'

import { headers } from "@/lib/authorizationHeaders";

export async function POST(request: Request) {
  const { email, locale } = await request.json()

  if (!email) return Response.error()

  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/otp/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, locale: locale || 'en', force: true })
    })
    const data = await result.json()

    // console.log(`POST /api/otp`, data);

    if (data?.code === 'success') {
      return Response.json({ code: 'success' })
    }
    return Response.json(
      { message: data?.message ? data.message : 'User error' },
      { status: 400 }
    )
  } catch (err: any) {
    // console.error(`/api/email/${email}:`, err.message)
    return Response.json(
      { message: err.message },
      { status: 400 }
    )
  }
}