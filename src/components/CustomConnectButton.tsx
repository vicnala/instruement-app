"use client";

import { ConnectButton } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
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

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "email", "phone", "apple", "facebook"/*, "guest"*/],
    },
  }),
  createWallet("io.metamask"),
  createWallet("walletConnect"),
];

export const CustomConnectButton = (
  { cb, invite }: Readonly<{ cb?: string | undefined, invite?: string | undefined }>
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
        label: t('components.CustomConnectButton.switch_network')
      }}
      autoConnect={true}
      accountAbstraction={{ chain: chain, sponsorGas: true }}
      wallets={wallets}
      connectModal={{
        // privacyPolicyUrl: "https://instruement.com/privacy-policy",
        // size: "compact",
        // termsOfServiceUrl: "https://instruement.com/terms-of-use",
        titleIcon: "https://instruement.com/wp-content/uploads/2023/09/favicon-96x96-1.png",
      }}
      auth={{
        isLoggedIn: async (address) => {
          // console.log("checking if logged in!", { address });
          return await isLoggedIn();
        },
        doLogin: async (params) => {
          // console.log("logging in!");
          await login(params, cb, invite);
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