'use server'

import { userAuthData } from "@/actions/login";

export async function POST(request: Request) {
  const formData: any = await request.formData()

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
  //   requestedInstrumentId = parseInt(formData.instrument_id);
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
    const result = await fetch(`${process.env.INSTRUEMENT_API_URL}/file`, {
      method: 'POST',
      headers: {
        // 'accept': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
        // 'Content-Type': 'multipart/form-data',
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
      },
      body: formData
    })
    const data = await result.json()
    // console.log('/api/file POST data', data);   

    if (data?.code === 'success') {
      return Response.json({ code: 'success', data })
    }
    return Response.json(
      { data: { message: data?.message ? data.message : 'Upload error' } },
      { status: 400 }
    )
  } catch (err: any) {
    console.error(`/api/file POST error`, err.message)
    return Response.json(
      { data: { message: err.message } },
      { status: 400 }
    )
  }
}
