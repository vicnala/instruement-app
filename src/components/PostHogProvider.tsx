"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export const PostHogProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!posthogKey) {
      console.warn("PostHog: NEXT_PUBLIC_POSTHOG_KEY is not set. PostHog will not initialize.");
      return;
    }
    
    // Check if PostHog is already initialized to avoid re-initialization
    if ((posthog as any).__loaded || (posthog as any).__initialized) {
      return;
    }
    
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    });
  }, []);

  // Simply return children without wrapping in PHProvider to avoid ErrorBoundary issues
  return <>{children}</>;
};

