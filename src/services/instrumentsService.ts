"use server";

export const getUserInstruments = async (userId: number, locale: string) => {
    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instruments?user_id=${userId}&locale=${locale}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
          },
          cache: 'no-store'
        });
    
        const data = await result.json()
        return data.data.ids;
      } catch (error) {
        console.log(error);
        return [];
      }
}

export const getInstrument = async (id: string, locale: string) => {  
    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instrument/asset/${id}?locale=${locale || "en"}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
          }
        });

        const data = await result.json();
        return data;
      } catch (error) {
        console.log(error);
        return null;
      }
}

export const getSavedInstrument = async (id: string, locale: string) => {
  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instrument/${id}?locale=${locale}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
      }
    })
    const data = await result.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

export const getInstrumentFile = async (id: string) => {
  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/file/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
      }
    })

    const data = await result.json();      

    if (data?.code === 'success') {
      return Response.json({ code: 'success', data })
    }
    return Response.json(
      { data: { message: data?.message ? data.message : '/api/file GET error' } },
      { status: 400 }
    )
  } catch (err: any) {
    console.error(`/api/file GET error`, err)
    return Response.json(
      { data: { message: err.message } },
      { status: 400 }
    )
  }
}
