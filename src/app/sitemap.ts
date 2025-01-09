import { locales } from "@/i18n/routing";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://app.instruement.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "yearly" as "yearly", // Explicitly type the string
      priority: 1,
    },
    ...locales.map((locale) => ({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as "monthly", // Explicitly type the string
      priority: 0.8,
    })),
  ];
}
