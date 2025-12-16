"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { SquarePlus, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/UI/button";
import { CustomConnectButton } from "@/components/CustomConnectButton";
import IOSShare from "@/components/Icons/IOSShare";
import IOSAddHomescreen from "@/components/Icons/IOSAddHomescreen";
import ButtonSpinner from "@/components/UI/ButtonSpinner"; 

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Detect if PWA is running in standalone mode
 * Based on: https://github.com/faisalman/is-standalone-pwa
 */
const isStandalonePWA = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    // Standard check via matchMedia
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari standalone mode
    // @ts-expect-error - standalone is iOS-specific property
    window.navigator?.standalone === true ||
    // Android TWA (Trusted Web Activity)
    document.referrer.startsWith("android-app://") ||
    // Windows Store apps
    // @ts-expect-error - Windows is Windows-specific property
    !!window?.Windows ||
    /trident.+(msapphost|webview)\//i.test(navigator.userAgent) ||
    document.referrer.startsWith("app-info://platform/microsoft-store")
  );
};

const detectIOS = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform.toLowerCase();
  const isIOS =
    /iphone|ipad|ipod/.test(userAgent) ||
    (platform === "macintel" && window.navigator.maxTouchPoints > 1) ||
    /ipad|iphone|ipod/.test(platform);

  return isIOS;
};

type JoinConnectProps = Readonly<{
  locale: string;
}>;

const JoinConnect = ({ }: JoinConnectProps) => {
  const t = useTranslations("components.Join.JoinConnect");
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const iosDialogRef = useRef<HTMLDialogElement>(null);
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null);
  const [, setIsAndroidInstallReady] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA installed)
    const standaloneMode = isStandalonePWA();
    setIsStandalone(standaloneMode);
    setIsIOS(detectIOS());

    // Handle beforeinstallprompt event for Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setIsAndroidInstallReady(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPromptRef.current) {
      try {
        await deferredPromptRef.current.prompt();
        const { outcome } = await deferredPromptRef.current.userChoice;

        if (outcome === "accepted") {
          deferredPromptRef.current = null;
          setIsStandalone(true);
        } else {
          deferredPromptRef.current = null;
        }
      } catch {
        deferredPromptRef.current = null;
      }
    } else if (isIOS) {
      iosDialogRef.current?.showModal();
    }
  };

  const handleCloseIOSDialog = () => {
    iosDialogRef.current?.close();
  };

  const handleDialogCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    handleCloseIOSDialog();
  };

  // Loading state - initial render before detection
  if (isStandalone === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <ButtonSpinner />
      </div>
    );
  }

  // Visibility classes based on standalone state and screen size
  // Install UI: visible on small screens when NOT standalone, hidden otherwise
  const installUIClasses = isStandalone ? "hidden" : "block md:hidden";
  // Connect UI: visible on medium+ screens OR when standalone (any size)
  const connectUIClasses = isStandalone ? "block" : "hidden md:block";

  return (
    <>
      {/* Install UI - visible on small devices when NOT standalone */}
      <div className={installUIClasses}>
        <div
          data-theme="me"
          className="bg-scope-25 border border-scope-50 rounded-section"
        >
          <div className="flex flex-col items-center gap-4 p-8 md:p-12">
            {/* App Icon */}
            <div className="relative">
              <div className="relative w-24 h-24 rounded-2xl border border-me-100 overflow-hidden shadow-xl">
                <Image
                  src="/images/icons/apple-touch-icon-512x512.png"
                  alt={t("app_icon_alt")}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              {/* Pulsating dot */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-me-300 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-me-500" />
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl md:text-3xl font-bold text-scope-1000 text-center text-balance">
              {t("heading")}
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg text-us-700 text-center max-w-md text-balance whitespace-pre-line">
              {t("description")}
            </p>

            {/* Install Button */}
            <Button
              onClick={handleInstallClick}
              className="mt-4 px-6 py-3 bg-transparent focus:outline-none active:bg-scope-200"
              size="lg"
              aria-label={t("install_button_label")}
              tabIndex={0}
            >
              <SquarePlus className="w-5 h-5 mr-2" aria-hidden="true" />
              {t("install_button_label")}
            </Button>

          </div>
        </div>

      </div>

      {/* Connect UI - visible on medium+ screens OR when standalone */}
      <div className={connectUIClasses}>
        <div
          data-theme="it"
          className="min-h-[350px] flex items-center justify-center bg-scope-25 px-6 py-12 rounded-section border border-scope-50"
        >
          <div className="text-center max-w-md">
            <h2 className="text-2xl md:text-3xl font-semibold text-scope-900 mb-3 text-balance">
              {t("connect_heading")}
            </h2>
            <p className="text-md text-us-500 mb-8 text-balance">
              {t("connect_sub_heading")}
            </p>
            <CustomConnectButton cb="/join" />
          </div>
        </div>
      </div>

      {/* iOS Install Dialog */}
      <dialog
        ref={iosDialogRef}
        onCancel={handleDialogCancel}
        className="bg-transparent p-4 max-w-md w-full rounded-section border-0 outline-none backdrop:bg-black/50"
        aria-labelledby="ios-dialog-title"
      >
        <div className="bg-scope-25 rounded-section border border-scope-50 max-w-md w-full">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-scope-100">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src="/images/icons/apple-touch-icon-512x512.png"
                alt={t("app_icon_alt")}
                width={42}
                height={42}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                id="ios-dialog-title"
                className="text-lg font-bold text-scope-1000"
              >
                {t("ios_dialog.title")}
              </h3>
            </div>
            <button
              onClick={handleCloseIOSDialog}
              className="flex-shrink-0 p-2 rounded-button hover:bg-scope-100 active:bg-scope-200 transition-colors focus:outline-none focus:ring-2 focus:ring-scope-300"
              aria-label={t("ios_dialog.close_label")}
              tabIndex={0}
              type="button"
            >
              <X className="w-5 h-5 text-scope-700" aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <p className="text-base text-scope-700 mb-4">
              {t("ios_dialog.introduction")}
            </p>

            <div className="flex flex-col gap-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <IOSShare className="w-6 h-6" />
                </div>
                <p className="text-base text-scope-700 flex-1 pt-1">
                  {t("ios_dialog.step1")}
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <IOSAddHomescreen className="w-6 h-6" />
                </div>
                <p className="text-base text-scope-700 flex-1 pt-1">
                  {t("ios_dialog.step2")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default JoinConnect;

