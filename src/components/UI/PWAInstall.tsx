"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { SquarePlus } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/UI/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstall = () => {
  const t = useTranslations('components.UI.PWAInstall');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if beforeinstallprompt is supported
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsSupported(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app is already installed (for iOS)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = (window.navigator as any).standalone === true;
    
    if (isIOS && !isStandalone) {
      setIsSupported(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS or browsers that don't support beforeinstallprompt
      // The browser will show its own install UI or instructions
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
    } else {
      // User dismissed the prompt
      setDeferredPrompt(null);
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Show component if supported (either has deferredPrompt or is iOS)
  if (!isSupported) {
    return null;
  }

  return (
    <div data-theme="me" className="bg-scope-25 border border-scope-50 p-6 rounded-section">
        <div className="flex flex-col items-center gap-4 p-6">
            <div className="relative">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg z-20">
                    <Image
                    src="/images/icons/apple-touch-icon-512x512.png"
                    alt={t('app_icon_alt')}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    priority
                    />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-scope-1000 text-center">
                {t('title')}
            </h2>
            <p className="text-base text-scope-700 text-center max-w-md">
                {t('description')}
            </p>
            <Button
                onClick={handleInstallClick}
                className="mt-2"
                size="lg"
                aria-label={t('install_button_label')}
                tabIndex={0}
            >
                <SquarePlus className="w-5 h-5 mr-2" />
                {t('install_button_label')}
            </Button>
        </div>
    </div>
  );
};

export default PWAInstall;

