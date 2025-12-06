import type { Metadata } from "next";
import { Catamaran } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { jsonLdScriptProps } from "react-schemaorg";
import { WebSite } from "schema-dts";
import { ThirdwebProvider } from "thirdweb/react";
import { locales } from "@/i18n/routing";
import { IOSSplashScreens } from "@/components/IOSSplashScreens";
import { PostHogProvider } from "@/components/PostHogProvider";

const catamaran = Catamaran({ subsets: ["latin"] });

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();
  setRequestLocale(locale);

  const isArabic = locale === "ar";

  return (
    <html lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <head>
        <link
          rel="canonical"
          href={process.env.NEXT_PUBLIC_SERVER_URL || `https://app.instruement.com`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        <IOSSplashScreens />
        
        <script
          {...jsonLdScriptProps<WebSite>({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Instruement",
            description: "Manage your musical instruments with self-custody blockchain technology.",
            url: process.env.NEXT_PUBLIC_SERVER_URL || `https://app.instruement.com`,
          })}
        />
      </head>
      <body className={`${catamaran.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <PostHogProvider />
            <ThirdwebProvider>
              {children}
            </ThirdwebProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
