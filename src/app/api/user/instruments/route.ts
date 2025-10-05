'use server'

import { userAuthData } from "@/actions/login";
import { getLocale } from "next-intl/server";

export async function GET() {
  const locale = await getLocale();
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
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instruments?user_id=${authContext.userId}&locale=${locale || "en"}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
      },
      cache: 'no-store'
    });

    const data = await result.json()
  
    // console.log(`GET /api/user/instruments result`, data);

    if (data?.code === 'success') {
      return Response.json(data)
    }
    return Response.json(
      { data: { message: data?.message ? data.message : 'User instruments GET error' } },
      { status: 400 }
    )
  } catch (err: any) {
    console.error(`/api/user/instruments GET error`, err.message)
    return Response.json(
      { data: { message: err.message } },
      { status: 400 }
    )
  }
}