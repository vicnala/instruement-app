"use client";

import posthog from "posthog-js";
import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";

const warningMessage =
  "PostHog: NEXT_PUBLIC_POSTHOG_KEY is not set. Analytics are disabled.";

export const PostHogProvider = () => {
  const hasInitialized = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasInitialized.current) return;

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!posthogKey) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(warningMessage);
      }
      return;
    }

    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      capture_pageview: false,
    });

    hasInitialized.current = true;
  }, []);

  useEffect(() => {
    if (!hasInitialized.current) return;
    if (!pathname) return;

    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
};

