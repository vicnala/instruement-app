'use server'

export async function POST(request: Request) {
  const { user_id, type, name } = await request.json()

  console.log('/api/instrument', user_id, type, name);

  try {
    const result = await fetch(`${process.env.INSTRUEMENT_API_URL}/instrument`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
      },
      body: JSON.stringify({ user_id, type, title: name })
    })
    const data = await result.json()

    console.log(`/api/instrument`, data)

    if (data?.code === 'success') {
      return Response.json({ data })
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