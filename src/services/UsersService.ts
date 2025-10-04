"use server";

export const getUser = async (address: string) => {
  const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/user/${address}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}` }
  })
  const data = await result.json()
  return data
}
