'use server'

import { NextRequest } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }

) {
  const { id } = await params
  const { type, name, description } = await request.json()

  
  const postData: any = {};
  if (type) postData['type'] = type;
  if (name) postData['name'] = name;
  if (description) postData['description'] = description;
  
  // console.log(`POST /api/instrument/${id}`, postData);

  try {
    const result = await fetch(`${process.env.INSTRUEMENT_API_URL}/instrument/${id}`, {
      cache: 'no-store',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
      },
      body: JSON.stringify(postData)
    })
    const data = await result.json()

    // console.log(`POST /api/instrument/${id}`, data)

    if (data?.code === 'success') {
      return Response.json({ data })
    }
    return Response.json(
      { data: { message: data?.message ? data.message : 'Verify error' } },
      { status: 400 }
    )
  } catch (err: any) {
    console.error(`/api/instrument/${id} POST error`, err.message)
    return Response.json(
      { data: { message: err.message } },
      { status: 400 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const locale = request.nextUrl.searchParams.get('locale') || 'en'

  // console.log(`(server) GET /api/instrument/${id}?locale=${locale}`)

  try {
    const result = await fetch(`${process.env.INSTRUEMENT_API_URL}/instrument/${id}?locale=${locale}`, {
      cache: 'no-store',
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
      { data: { message: data?.message ? data.message : `/api/instrument/${id} GET error` } },
      { status: 400 }
    )
  } catch (err: any) {
    console.error(`/api/instrument/${id} GET error`, err.message)
    return Response.json(
      { data: { message: err.message } },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params

  if (!id) return Response.json(
    { message: 'No id provided' },
    { status: 400 }
  )

  try {
    const result = await fetch(`${process.env.INSTRUEMENT_API_URL}/instrument/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
      },
      body: JSON.stringify({ force: true })
    })

    const data = await result.json()

    if (data?.code === 'success') {
      return Response.json({ code: 'success', data: data?.data })
    }
    return Response.json(
      { data: { message: data?.message ? data.message : `/api/instrument/${id} DELETE error` } },
      { status: 400 }
    )
  } catch (err: any) {
    console.error(`/api/instrument/${id} DELETE error`, err)
    return Response.json(
      { data: { message: err.message } },
      { status: 400 }
    )
  }
}