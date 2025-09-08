'use server'

import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const locale = request.nextUrl.searchParams.get('locale') || 'en'

  console.log(`(server) GET /api/instrument/asset/${id}?locale=${locale}`)

  if (!id) return Response.json(
    { message: 'No id provided' },
    { status: 400 }
  )

  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instrument/asset/${id}?locale=${locale}`, {
      // cache: 'no-store',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
      }
    })
    const data = await result.json()

    if (data?.code === 'success') {
      return Response.json({ data })
    }
    return Response.json(
      { data: { message: data?.message ? data.message : `/api/instrument/asset/${id} GET error` } },
      { status: 400 }
    )
  } catch (err: any) {
    console.error(`/api/instrument/asset/${id} GET error`, err.message)
    return Response.json(
      { data: { message: err.message } },
      { status: 400 }
    )
  }
}