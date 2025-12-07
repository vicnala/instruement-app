"use client";
import { LinkProps } from "next/link";
import { Link } from "@/i18n/routing";
import React from "react";
import { useRouter } from "@/i18n/routing";

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode;
  href: string;
  locale: string;
  className?: string;
  theme?: string;
  "aria-label"?: string;
  disabled?: boolean;
}

export const TransitionLink: React.FC<TransitionLinkProps> = ({
  children,
  href,
  locale,
  className,
  theme,
  "aria-label": ariaLabel,
  disabled = false,
  ...props
}) => {
  const router = useRouter();

  const handleTransition = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    const body = document.querySelector("body");

    // Add transition class - the new page will remove it when ready
    body?.classList.add("page-transition");
    
    router.push(href);
  };

  // When disabled, render a div with disabled button classes
  if (disabled) {
    return (
      <div
        className={`${className || ''} border-us-200 text-us-200 hover:bg-transparent hover:text-us-200 cursor-not-allowed active:scale-100`}
        data-theme={theme}
        aria-label={ariaLabel}
        role="button"
        aria-disabled="true"
      >
        {children}
      </div>
    );
  }

  return (
    <Link {...props} 
    href={href} 
    locale={locale} 
    onClick={handleTransition} 
    className={className} 
    data-theme={theme}
    aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
};