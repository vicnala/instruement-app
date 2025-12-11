"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
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
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
                (platform === 'macintel' && navigator.maxTouchPoints > 1) ||
                /ipad|iphone|ipod/.test(platform);
  
  console.log('[PWAInstall] iOS Detection:', {
    userAgent,
    platform,
    isIOS,
    maxTouchPoints: navigator.maxTouchPoints,
    standalone: (window.navigator as any).standalone
  });
  
  return isIOS;
};

const PWAInstall = () => {
  const t = useTranslations('components.UI.PWAInstall');
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const iosDialogRef = useRef<HTMLDialogElement>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const isIOS = detectIOS();
    
    console.log('[PWAInstall] Component mounted', {
      isIOS,
      userAgent: window.navigator.userAgent,
      platform: window.navigator.platform,
      standalone: (window.navigator as any).standalone,
      displayMode: window.matchMedia("(display-mode: standalone)").matches
    });

    // Check if the app is already installed
    // Standard check for most platforms
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
    console.log('[PWAInstall] Standalone mode check:', {
      isStandaloneMode,
      matches: isStandaloneMode
    });
    
    if (isStandaloneMode) {
      console.log('[PWAInstall] App is already installed (standalone mode detected)');
      setIsInstalled(true);
      return;
    }

    // iOS-specific check for standalone mode
    const iosStandalone = (window.navigator as any).standalone === true;
    console.log('[PWAInstall] iOS standalone check:', {
      iosStandalone,
      standaloneValue: (window.navigator as any).standalone
    });
    
    if (iosStandalone) {
      console.log('[PWAInstall] App is already installed (iOS standalone detected)');
      setIsInstalled(true);
      return;
    }

    // Handle beforeinstallprompt event - works on all supporting browsers/platforms
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWAInstall] beforeinstallprompt event fired', {
        isIOS,
        event: e,
        eventType: e.type
      });
      
      // Prevent the browser from displaying the default install dialog
      e.preventDefault();
      
      // Stash the event so it can be triggered later when the user clicks the button
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setIsSupported(true);
      
      console.log('[PWAInstall] Deferred prompt stored, isSupported set to true', {
        hasDeferredPrompt: !!deferredPromptRef.current,
        isSupported: true
      });
    };

    console.log('[PWAInstall] Registering beforeinstallprompt event listener', {
      isIOS,
      note: isIOS ? 'iOS typically does not fire this event' : 'Event should fire on supported platforms'
    });

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Set a timeout to log if the event never fires (especially useful for iOS)
    const timeoutId = setTimeout(() => {
      if (!isSupported && !deferredPromptRef.current) {
        console.warn('[PWAInstall] beforeinstallprompt event did not fire after 3 seconds', {
          isIOS,
          isSupported,
          hasDeferredPrompt: !!deferredPromptRef.current,
          note: isIOS ? 'This is expected on iOS - the event does not fire on iOS Safari' : 'Event may not be supported on this platform'
        });
      }
    }, 3000);

    return () => {
      console.log('[PWAInstall] Cleaning up event listeners');
      clearTimeout(timeoutId);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Log state changes
  useEffect(() => {
    console.log('[PWAInstall] State changed', {
      isInstalled,
      isSupported,
      hasDeferredPrompt: !!deferredPromptRef.current
    });
  }, [isInstalled, isSupported]);

  const handleInstallClick = async () => {
    const isIOS = detectIOS();
    
    console.log('[PWAInstall] Install button clicked', {
      isIOS,
      hasDeferredPrompt: !!deferredPromptRef.current,
      isSupported,
      isInstalled
    });

    // If the deferredEvent exists, call its prompt method to display the install dialog
    if (deferredPromptRef.current) {
      console.log('[PWAInstall] Deferred prompt available, attempting to show install dialog');
      
      try {
        console.log('[PWAInstall] Calling deferredPrompt.prompt()');
        await deferredPromptRef.current.prompt();
        console.log('[PWAInstall] Prompt shown, waiting for user choice');
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPromptRef.current.userChoice;
        console.log('[PWAInstall] User choice received', { outcome });
        
        if (outcome === "accepted") {
          console.log('[PWAInstall] User accepted installation');
          deferredPromptRef.current = null;
          setIsInstalled(true);
        } else {
          console.log('[PWAInstall] User dismissed the installation prompt');
          // User dismissed the prompt
          deferredPromptRef.current = null;
        }
      } catch (error) {
        // Handle any errors (e.g., if prompt was already called)
        console.error('[PWAInstall] Error showing install prompt:', {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          isIOS,
          hasDeferredPrompt: !!deferredPromptRef.current
        });
        deferredPromptRef.current = null;
      }
    } else if (isIOS) {
      console.log('[PWAInstall] iOS detected, showing manual install dialog');
      iosDialogRef.current?.showModal();
    } else {
      console.warn('[PWAInstall] Install button clicked but no deferred prompt available', {
        isIOS,
        isSupported,
        hasDeferredPrompt: !!deferredPromptRef.current,
        note: isIOS ? 'iOS does not support beforeinstallprompt event - manual installation instructions may be needed' : 'beforeinstallprompt event may not have fired'
      });
    }
  };

  const handleCloseIOSDialog = () => {
    console.log('[PWAInstall] Closing iOS install dialog');
    iosDialogRef.current?.close();
  };

  const handleDialogCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    console.log('[PWAInstall] Dialog cancel event (ESC key pressed)');
    handleCloseIOSDialog();
  };

  // Don't show if already installed
  if (isInstalled) {
    console.log('[PWAInstall] Component not rendering: app is already installed', {
      isInstalled,
      isSupported,
      hasDeferredPrompt: !!deferredPromptRef.current
    });
    return null;
  }

  const isIOS = detectIOS();
  const shouldShowIOSCard = isIOS && (!isSupported || !deferredPromptRef.current);

  // Show iOS install card if on iOS and no deferred prompt
  if (shouldShowIOSCard) {
    console.log('[PWAInstall] Rendering iOS install card', {
      isIOS,
      isInstalled,
      isSupported,
      hasDeferredPrompt: !!deferredPromptRef.current
    });

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
    console.log('[PWAInstall] Component not rendering: no deferred prompt available', {
      isIOS,
      isInstalled,
      isSupported,
      hasDeferredPrompt: !!deferredPromptRef.current,
      reason: !isSupported ? 'isSupported is false' : 'deferredPromptRef.current is null',
      note: isIOS ? 'This is expected on iOS - beforeinstallprompt does not fire on iOS Safari' : 'beforeinstallprompt event may not have fired yet or is not supported'
    });
    return null;
  }

  console.log('[PWAInstall] Component rendering: all conditions met', {
    isInstalled,
    isSupported,
    hasDeferredPrompt: !!deferredPromptRef.current
  });

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

