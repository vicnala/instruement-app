"use client";

import * as React from "react";
import { ConnectButton } from "thirdweb/react";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { client } from "@/app/client";
import {
  generatePayload,
  isLoggedIn,
  login,
  logout,
} from "@/actions/login";
import chain from "@/lib/chain";

export const CustomConnectButton = (
  { callbackUrl }: Readonly<{ callbackUrl?: string | undefined }>
) => {
  const { theme } = useTheme();
  const locale = useLocale();
  return (
    <ConnectButton
      client={client}
      theme={theme === 'system' ? 'light' : theme === 'dark' ? 'dark' : 'light'}
      locale={locale.includes('en') ? 'en_US' : locale.includes('es') ? 'es_ES' : 'en_US'}
      // accountAbstraction={{ chain: chain, sponsorGas: true }}
      auth={{
        isLoggedIn: async (address) => {
          // console.log("checking if logged in!", { address });
          return await isLoggedIn();
        },
        doLogin: async (params) => {
          // console.log("logging in!");
          await login(params, callbackUrl);
        },
        getLoginPayload: async ({ address }) =>
          await generatePayload({ address, chainId: chain.id }),
        doLogout: async () => {
          // console.log("logging out!");
          await logout();
        },
      }}
    />
  );
};