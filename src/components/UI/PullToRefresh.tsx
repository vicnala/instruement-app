"use client";

import { useEffect, useRef, useState } from "react";
import ButtonSpinner from "./ButtonSpinner";

/**
 * Client component that implements pull-to-refresh functionality.
 * When the user overscrolls at the top of the page and holds for the duration,
 * it triggers a page reload.
 * 
 * The spinner is positioned below the content (z-index -1), and the main
 * content element is transformed during the pull gesture.
 */
export const PullToRefresh = () => {
  const touchStartY = useRef<number | null>(null);
  const isPulling = useRef<boolean>(false);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const hasReachedThreshold = useRef<boolean>(false);
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isReloading, setIsReloading] = useState<boolean>(false);

  const threshold = 80; // Minimum distance in pixels to trigger refresh
  const maxPullDistance = 320; // Maximum pull distance for visual feedback
  const holdDuration = 1000; // Duration in milliseconds to hold before refresh
  const spinnerHeight = 60; // Height of spinner container in pixels

  useEffect(() => {
    // Wait for DOM to be ready
    if (typeof window === "undefined") return;

    const getMainElement = () => document.querySelector("main") as HTMLElement | null;

    const updatePullDistance = (distance: number) => {
      const mainElement = getMainElement();
      if (!mainElement) {
        return;
      }

      const clampedDistance = Math.min(distance, maxPullDistance);
      setPullDistance(clampedDistance);

      // Transform main element to push content down
      if (clampedDistance > 0) {
        mainElement.style.transform = `translateY(${clampedDistance}px)`;
        mainElement.style.transition = "transform 0.1s ease-out";
      } else {
        mainElement.style.transform = "";
        mainElement.style.transition = "transform 0.3s ease-out";
      }
    };

    const clearRefreshTimer = () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
      hasReachedThreshold.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      const scrollY = window.scrollY;
      
      if (scrollY === 0 && !isReloading) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
        clearRefreshTimer();
        updatePullDistance(0);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || touchStartY.current === null || isReloading) return;

      const deltaY = e.touches[0].clientY - touchStartY.current;

      if (deltaY > 0 && window.scrollY === 0) {
        updatePullDistance(deltaY);

        if (deltaY > 10) {
          e.preventDefault();
        }

        if (deltaY >= threshold && !hasReachedThreshold.current) {
          hasReachedThreshold.current = true;
          refreshTimer.current = setTimeout(() => {
            setIsReloading(true);
            const mainElement = getMainElement();
            const body = document.querySelector("body");
            
            // Reset main element transform
            if (mainElement) {
              mainElement.style.transform = "";
              mainElement.style.transition = "";
            }
            
            // Add page-transition class (same as TransitionLink)
            body?.classList.add("page-transition");
            
            // Small delay to ensure transition class is applied before reload
            setTimeout(() => {
              window.location.reload();
            }, 50);
          }, holdDuration);
        }

        if (deltaY < threshold && hasReachedThreshold.current) {
          clearRefreshTimer();
        }
      } else {
        isPulling.current = false;
        touchStartY.current = null;
        clearRefreshTimer();
        updatePullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      clearRefreshTimer();
      updatePullDistance(0);
      isPulling.current = false;
      touchStartY.current = null;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      clearRefreshTimer();

      const mainElement = getMainElement();
      if (mainElement) {
        mainElement.style.transform = "";
        mainElement.style.transition = "";
      }
    };
  }, [isReloading]);

  const showSpinner = pullDistance > 10 || isReloading;
  const spinnerOpacity = Math.min(pullDistance / 40, 1);

  // Hide component when reloading to allow page-transition to take over
  if (isReloading) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 flex pointer-events-none bg-us-200 dark:bg-us-800  min-h-full"
      style={{
        height: `${spinnerHeight}px`,
        opacity: spinnerOpacity,
        transition: pullDistance === 0 ? "opacity 0.3s ease-out" : "none",
        zIndex: -1,
      }}
    >
      {showSpinner && (
        <div className={`text-primary  h-[60px] w-full flex items-center justify-center`}>
          <ButtonSpinner />
        </div>
      )}
    </div>
  );
};

