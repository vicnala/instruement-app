"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { SquarePlus, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/UI/button";
import IOSShare from "@/components/Icons/IOSShare";
import IOSAddHomescreen from "@/components/Icons/IOSAddHomescreen";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const detectIOS = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
                (platform === 'macintel' && window.navigator.maxTouchPoints > 1) ||
                /ipad|iphone|ipod/.test(platform);
  
  return isIOS;
};

const PWAInstall = () => {
  const t = useTranslations('components.UI.PWAInstall');
  const router = useRouter();
  const pathname = usePathname();
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const iosDialogRef = useRef<HTMLDialogElement>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const isIOS = detectIOS();

    // Check if the app is already installed
    // Standard check - works on Android/Chrome and other platforms
    // Note: iOS detection is unreliable, so we skip it for iOS
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
    
    if (isStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    // Note: We don't set isInstalled based on iOS check since it's unreliable
    // The component will show on iOS even after installation, which is acceptable

    // Handle beforeinstallprompt event - works on all supporting browsers/platforms
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the browser from displaying the default install dialog
      e.preventDefault();
      
      // Stash the event so it can be triggered later when the user clicks the button
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setIsSupported(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    const isIOS = detectIOS();

    // If the deferredEvent exists, call its prompt method to display the install dialog
    if (deferredPromptRef.current) {
      try {
        await deferredPromptRef.current.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPromptRef.current.userChoice;
        
        if (outcome === "accepted") {
          deferredPromptRef.current = null;
          setIsInstalled(true);
        } else {
          // User dismissed the prompt
          deferredPromptRef.current = null;
        }
      } catch (error) {
        // Handle any errors (e.g., if prompt was already called)
        deferredPromptRef.current = null;
      }
    } else if (isIOS) {
      iosDialogRef.current?.showModal();
    }
  };

  const handleCloseIOSDialog = () => {
    iosDialogRef.current?.close();
    
    const locale = pathname.split('/')[1] || 'en';
    const homepagePath = `/${locale}`;
    
    router.push(homepagePath);
  };

  const handleDialogCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    handleCloseIOSDialog();
  };

  // Don't show if already installed. Not working on iOS.
  if (isInstalled) {
    return null;
  }

  const isIOS = detectIOS();
  const shouldShowIOSCard = isIOS && (!isSupported || !deferredPromptRef.current);

  // Show iOS install card if on iOS and no deferred prompt
  if (shouldShowIOSCard) {
    return (
      <>
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
              className="mt-2 px-4 py-2 bg-transparent focus:outline-none active:bg-scope-200"
              size="lg"
              aria-label={t('install_button_label')}
              tabIndex={0}
            >
              <SquarePlus className="w-5 h-5 mr-2" />
              {t('install_button_label')}
            </Button>
          </div>
        </div>

        {/* iOS Install Dialog */}
        <dialog
          ref={iosDialogRef}
          onCancel={handleDialogCancel}
          className="bg-transparent p-4 max-w-md w-full rounded-section border-0 outline-none"
        >
          <div className="bg-scope-25 rounded-section border border-scope-50 max-w-md w-full">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-scope-100">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src="/images/icons/apple-touch-icon-512x512.png"
                  alt={t('app_icon_alt')}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-scope-1000">
                  {t('ios_dialog.title')}
                </h3>
              </div>
              <button
                onClick={handleCloseIOSDialog}
                className="flex-shrink-0 p-2 rounded-button hover:bg-scope-100 active:bg-scope-200 transition-colors focus:outline-none focus:ring-2 focus:ring-scope-300"
                aria-label={t('ios_dialog.close_label')}
                tabIndex={0}
              >
                <X className="w-5 h-5 text-scope-700" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              <p className="text-base text-scope-700 mb-4">
                {t('ios_dialog.introduction')}
              </p>
              
              <div className="flex flex-col gap-4">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <IOSShare className="w-6 h-6" />
                  </div>
                  <p className="text-base text-scope-700 flex-1 pt-1">
                    {t('ios_dialog.step1')}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <IOSAddHomescreen className="w-6 h-6" />
                  </div>
                  <p className="text-base text-scope-700 flex-1 pt-1">
                    {t('ios_dialog.step2')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </dialog>
      </>
    );
  }

  // Only show if we have a deferred prompt (beforeinstallprompt fired)
  if (!isSupported || !deferredPromptRef.current) {
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
                className="mt-2 px-4 py-2 bg-transparent focus:outline-none active:bg-scope-200"
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

