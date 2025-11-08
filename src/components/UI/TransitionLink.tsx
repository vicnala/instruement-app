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
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const TransitionLink: React.FC<TransitionLinkProps> = ({
  children,
  href,
  locale,
  className,
  ...props
}) => {
  const router = useRouter();

  const handleTransition = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    // const body = document.querySelector("body");

    // body?.classList.add("page-transition");
    
    router.push(href);

    // if (href === '/') {
    //     await sleep(2500);
    // } else {
    //   await sleep(1000);
    // }

    // body?.classList.remove("page-transition");
  };

  return (
    <Link {...props} href={href} locale={locale} onClick={handleTransition} className={className}>
      {children}
    </Link>
  );
};