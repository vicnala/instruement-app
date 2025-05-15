'use server'

import { userAuthData } from "@/actions/login";

export async function POST(request: Request) {
  const { user_id, type, name } = await request.json()
  console.log('POST /api/instrument', user_id, type, name);

  const authData: any = await userAuthData();
  const authContext = authData.parsedJWT.ctx;
  const isMinter = authContext.isMinter;

  if (!isMinter) {
    return Response.json(
      { data: { message: `Forbidden` } },
      { status: 401 }
    )
  }

  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instrument`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
      },
      body: JSON.stringify({ user_id, type, title: name })
    })
    const data = await result.json()
    // console.log(`/api/instrument`, data)

    if (data?.code === 'success') {
      return Response.json(data)
    }
    return Response.json(
      { data: { message: data?.message ? data.message : 'Instrument POST error' } },
      { status: 400 }
    )
  } catch (err: any) {
    console.error(`/api/instrument POST error`, err.message)
    return Response.json(
      { data: { message: err.message } },
      { status: 400 }
    )
  }
}