"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/routing";

/**
 * Client component that removes the page-transition class from the body
 * when the new page has loaded. This ensures smooth transitions that
 * sync with actual page loading rather than fixed timings.
 * 
 * Uses usePathname to detect route changes and remove the transition
 * class when navigation completes.
 */
export const PageTransitionHandler = () => {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.querySelector("body");
    
    // Remove the transition class when the route changes
    // This ensures the new page removes the transition, not the old one
    if (body?.classList.contains("page-transition")) {
      body.classList.remove("page-transition");
    }
  }, [pathname]);

  return null;
};

