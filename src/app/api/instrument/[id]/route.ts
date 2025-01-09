'use server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }

) {
  const { id } = await params
  const { type, name, description } = await request.json()

  console.log(`/api/instrument/${id}`, type, name, description);

  try {
    const result = await fetch(`${process.env.INSTRUEMENT_API_URL}/instrument/${id}`, {
      cache: 'no-store',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
      },
      body: JSON.stringify({
        type,
        name,
        description
      })
    })
    const data = await result.json()

    console.log(`/api/instrument/${id}`, data)

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