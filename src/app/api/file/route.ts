'use server'

export async function POST(request: Request) {
  const formData = await request.formData()

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

    console.log('/api/file POST data', data);
    

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
