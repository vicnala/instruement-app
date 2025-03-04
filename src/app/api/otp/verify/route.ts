'use server'

export async function POST(request: Request) {
  const { email, otp, address, accepted_terms } = await request.json()

  if (!email || !otp || !address) return Response.error()

  try {
    const result = await fetch(`${process.env.INSTRUEMENT_API_URL}/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,

      },
      body: JSON.stringify({ email, otp, accepted_terms })
    })
    const data = await result.json();

    // console.log(`/api/otp/verfy`, data);

    if (data?.code === 'success') {
      const { session } = data.data;
      if (session) {
        const userResult = await fetch(`${process.env.INSTRUEMENT_API_URL}/user/${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`
          }
        });

        const data = await userResult.json();

        if (data && data.code === 'success') {
          const { user_id } = data.data;

          const addAdress = {
            type: "blockchain",
            location: ["Ethereum"],
            address,
            user_id,
            session
          }

          const addAdressResult = await fetch(`${process.env.INSTRUEMENT_API_URL}/address`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,

            },
            body: JSON.stringify(addAdress)
          })

          if (addAdressResult && addAdressResult.status === 2000) {
            return Response.json({ code: 'success' })
          }
        }
      }
    }

    return Response.json(
      { message: data?.message ? data.message : 'Verify error' },
      { status: 400 }
    )
  } catch (err: any) {
    // console.error(`/api/otp/verify/${email}:`, err.message)
    return Response.json(
      { message: err.message },
      { status: 400 }
    )
  }
}