"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

const getEnvironment = (): string => {
  if (typeof window === "undefined") return "unknown";
  
  return process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || "unknown";
};

export const PostHogProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const environment = getEnvironment();
    const isProduction = environment === "production" || process.env.NODE_ENV === "production";
    
    if (!posthogKey) {
      if (!isProduction) {
        console.warn("PostHog: NEXT_PUBLIC_POSTHOG_KEY is not set. PostHog will not initialize.");
      }
      return;
    }
    
    // Check if PostHog is already initialized to avoid re-initialization
    if ((posthog as any).__loaded || (posthog as any).__initialized) {
      return;
    }
    
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      loaded: (posthogInstance) => {
        // Register environment property when PostHog is loaded
        posthogInstance.register({
          environment,
        });
        
        // Only enable debugging and expose to window in non-production environments
        if (!isProduction) {
          posthogInstance.debug();
          if (typeof window !== "undefined") {
            (window as any).posthog = posthogInstance;
          }
          console.log("PostHog initialized with environment:", environment);
        }
      },
    });
    
    // Only expose PostHog module to window for debugging in non-production environments
    if (!isProduction && typeof window !== "undefined") {
      (window as any).posthog = posthog;
    }
  }, []);

  // Simply return children without wrapping in PHProvider to avoid ErrorBoundary issues
  return <>{children}</>;
};

