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
import { useTranslations } from "next-intl";

export const CustomConnectButton = (
  { cb }: Readonly<{ cb?: string | undefined }>
) => {
  const { theme } = useTheme();
  const locale = useLocale();
  const t = useTranslations();
  return (
    <ConnectButton
      client={client}
      theme={theme === 'system' ? 'light' : theme === 'dark' ? 'dark' : 'light'}
      locale={locale.includes('en') ? 'en_US' : locale.includes('es') ? 'es_ES' : 'en_US'}
      chain={chain}
      switchButton={{
        label: t('switch_network')
      }}
      autoConnect={true}
      // accountAbstraction={{ chain: chain, sponsorGas: true }}
      auth={{
        isLoggedIn: async (address) => {
          // console.log("checking if logged in!", { address });
          return await isLoggedIn();
        },
        doLogin: async (params) => {
          // console.log("logging in!");
          await login(params, cb);
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