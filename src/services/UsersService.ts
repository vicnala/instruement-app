"use server";

import { headers } from "@/lib/authorizationHeaders";

export const getUser = async (address: string) => {
  const result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/user/${address}`, { headers });
  const data = await result.json()
  return data
}
