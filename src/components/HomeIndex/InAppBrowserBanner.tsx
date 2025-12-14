"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import InAppSpy from "inapp-spy";
import Bowser from "bowser";
import { ExternalLink } from "lucide-react";
import Section from "@/components/Section";

type OSType = "ios" | "android" | "other";

type InAppBrowserBannerProps = Readonly<{
    className?: string;
}>;

const InAppBrowserBanner = ({ className = "" }: InAppBrowserBannerProps) => {
    const t = useTranslations("components.HomeIndex.InAppBrowserBanner");
    const [shouldShow, setShouldShow] = useState(false);
    const [os, setOs] = useState<OSType>("other");
    const [escapeLink, setEscapeLink] = useState<string>("");

    useEffect(() => {
        if (typeof window === "undefined") return;

        const { isInApp: inAppDetected } = InAppSpy();
        const osName = Bowser.getParser(window.navigator.userAgent).getOSName(true) as OSType;
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        const hasTicketParam = urlParams.has("ticket");

        setOs(osName);

        // Show banner if inapp-spy detects in-app browser on iOS/Android
        // OR as fallback: if URL has "ticket" param and OS is Android
        const shouldDisplay = 
            (inAppDetected && (osName === "ios" || osName === "android")) ||
            (hasTicketParam && osName === "android");

        if (shouldDisplay) {
            setShouldShow(true);

            if (osName === "ios") {
                const encodedUrl = encodeURIComponent(currentUrl);
                const randomId = crypto.randomUUID();
                setEscapeLink(`shortcuts://x-callback-url/run-shortcut?name=${randomId}&x-error=${encodedUrl}`);
            } else if (osName === "android") {
                setEscapeLink(`intent:${currentUrl}#Intent;end`);
            }
        }
    }, []);

    if (!shouldShow) {
        return null;
    }

    const handleClick = () => {
        if (escapeLink) {
            window.location.href = escapeLink;
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
        }
    };

    return (
        <Section>
            <div className={`bg-red-200 border border-red-300  ${className}`}>
                <div className="px-4 py-6 mx-auto">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-medium text-us-1000">
                                {t("title")}
                            </h3>
                            <p className="text-md font-medium text-us-700">
                                {t("warning")}
                            </p>
                        </div>
                        <div className="flex items-center justify-center">
                            <button
                                type="button"
                                onClick={handleClick}
                                onKeyDown={handleKeyDown}
                                tabIndex={0}
                                aria-label={t("button_aria_label")}
                                className="inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap
                                rounded-button bg-us-1000 px-4 py-2 text-lg font-semibold text-amber-50  hover:bg-green-500 focus-visible:outline-none "
                            >
                                {os === "ios" ? t("button_ios") : t("button_android")}
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default InAppBrowserBanner;

