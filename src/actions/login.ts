"use server";

import { VerifyLoginPayloadParams, createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { client } from "@/app/client";
import { redirect } from "@/i18n/routing";
import { getLuthierPermissions } from "@/lib/luthierPermissions";
import { locales } from "@/i18n/routing";

const privateKey = process.env.AUTH_PRIVATE_KEY || "";
 
if (!privateKey) {
  throw new Error("Missing AUTH_PRIVATE_KEY in .env file.");
}
 
const thirdwebAuth = createAuth({
  domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || "",
  adminAccount: privateKeyToAccount({ client, privateKey }),
  client: client,
});
 
export const generatePayload = thirdwebAuth.generatePayload;
 
export async function login(payload: VerifyLoginPayloadParams, cb: string | undefined) {
  const locale = await getLocale();
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
  if (verifiedPayload.valid) {
    let result, userData;
    const context = {
      isMinter: false,
      isLuthier: false,
      isVerified: false,
      userId: undefined
    };

    let userLang = '';
    try {
      result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/user/${verifiedPayload.payload.address}`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}` },
        cache: 'no-store'
      })
      userData = await result.json()
      if (userData) {
        if (userData?.code === 'success') {
          if (userData.data) {
            const { isLuthier, isVerified, isMinter } = getLuthierPermissions(userData.data);
            context.isLuthier = isLuthier;
            context.isVerified = isVerified;
            context.isMinter = isMinter;
            context.userId = userData.data.user_id;
            userLang = userData.data.lang;
          }
        }
      }
    } catch (error: any) {
      console.error("/user fetch error", error.message);
    }

    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
      context,
    });
    cookies().set("jwt", jwt);
    redirect({ href: cb || '/', locale: locales.includes(userLang) ? userLang : locale });
  }
}
 
export async function isLoggedIn() {
  const jwt = cookies().get("jwt");
  if (!jwt?.value) {
    return false;
  }
 
  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
  return authResult.valid;
}

export async function authedOnly(cb: string) {
  const locale = await getLocale();

  const jwt = cookies().get("jwt");
  if (!jwt?.value) {
    redirect({ href: `/login?cb=${cb}`, locale });
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt?.value || '' });
  if (!authResult.valid) {
    redirect({ href: `/login?cb=${cb}`, locale });
  }
  return authResult;
}

export async function userAuthData() {
  const jwt = cookies().get("jwt");
  if (!jwt?.value) {
    return;
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt?.value || '' });
  return authResult;
}

export async function logout() {
  cookies().delete("jwt");
}