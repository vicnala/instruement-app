'use server'

import { NextRequest } from "next/server";
import { userAuthData } from "@/actions/login";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }

) {
  const { id } = await params
  const { type, name, description } = await request.json()
  
  console.log(`POST /api/instrument/${id}`, type, name, description.slice(0, 80));

  if (!id) return Response.json(
    { message: 'No id provided' },
    { status: 400 }
  )

  const authData: any = await userAuthData();
  const authContext = authData.parsedJWT.ctx;
  const isVerified = authContext.isVerified;
  
  if (!isVerified) {
    return Response.json(
      { data: { message: `Forbidden` } },
      { status: 401 }
    )
  }

  // const authUser = authContext.user;
  // const userInstrumentIds = authUser.instruments || [];

  // let requestedInstrumentId;
  // try {
  //   requestedInstrumentId = parseInt(id);
  // } catch (error) {
  //   return Response.json(
  //     { data: { message: `Instrument ID parse error` } },
  //     { status: 400 }
  //   )
  // }

  // if (!userInstrumentIds.includes(requestedInstrumentId)) {
  //   return Response.json(
  //     { data: { message: `Wrong instrument ID` } },
  //     { status: 400 }
  //   )
  // }

  const postData: any = {};
  if (type) postData['type'] = type;
  if (name) postData['title'] = name;
  if (description) postData['description'] = description;

  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instrument/${id}`, {
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
      return Response.json(data)
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

  if (!id) return Response.json(
    { message: 'No id provided' },
    { status: 400 }
  )

  const authData: any = await userAuthData();
  const authContext = authData.parsedJWT.ctx;
  const isMinter = authContext.isMinter;
  
  if (!isMinter) {
    return Response.json(
      { data: { message: `Forbidden` } },
      { status: 401 }
    )
  }

  // const authUser = authContext.user;
  // const userInstrumentIds = authUser.instruments || [];

  // let requestedInstrumentId;
  // try {
  //   requestedInstrumentId = parseInt(id);
  // } catch (error) {
  //   return Response.json(
  //     { data: { message: `Instrument ID parse error` } },
  //     { status: 400 }
  //   )
  // }

  // if (!userInstrumentIds.includes(requestedInstrumentId)) {
  //   return Response.json(
  //     { data: { message: `Wrong instrument ID` } },
  //     { status: 400 }
  //   )
  // }

  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instrument/${id}?locale=${locale}`, {
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
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instrument/${id}`, {
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