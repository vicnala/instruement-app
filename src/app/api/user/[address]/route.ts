'use server'

// import { isLoggedIn } from "@/actions/login"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  if (!address) return Response.json(
    { message: 'No address provided' },
    { status: 400 }
  )

  // if(!await isLoggedIn()) return Response.json(
  //   { message: 'User is not logged in' },
  //   { status: 401 }
  // )

  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/user/${address}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
      }
    })
    const data = await result.json()

    if (data?.code === 'success') {
      return Response.json(data.data)
    }

    return Response.json(
      { message: data?.message ? data.message : 'User error' }
    )
  } catch (err: any) {
    console.error(`/api/user/[${address}] error ${err.message}`)
    return Response.json(
      { message: err.message }
    )
  }
}