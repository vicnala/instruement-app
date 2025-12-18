'use server'

import { headers } from "@/lib/authorizationHeaders";

export async function POST(request: Request) {
  const { ticket } = await request.json()

  if (!ticket) return Response.json(
    { message: 'Ticket is required' },
    { status: 400 }
  )

  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/ticket/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ticket })
    })

    if (!result.ok) return Response.json(
      { message: 'Ticket verification failed' },
      { status: 400 }
    )

    const data = await result.json()

    if (data?.code === 'success') {
      const { user_id, session, purpose } = data.data
      
      return Response.json({
        code: 'success',
        data: {
          user_id,
          session,
          purpose
        }
      })
    }

    return Response.json(
      { message: data?.message || 'Ticket verification failed' },
      { status: 400 }
    )
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      { status: 400 }
    )
  }
}
