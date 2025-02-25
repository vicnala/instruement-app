import * as React from "react";
import { Link } from "@/i18n/routing";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const ButtonLink = ({ href, children, className = "", size = "md", colorSchema = "it" }: ButtonLinkProps & {
  size?: "sm" | "md" | "lg";
  colorSchema?: "it" | "me" | "we" | "gray"
}) => {
  const sizeClasses = {
    sm: "px-2 py-1.5 text-xs",
    md: "px-3 py-2 text-sm", 
    lg: "px-4 py-3 text-base"
  };

  const colorClasses = {
    it: "bg-it-300 hover:bg-it-500 focus:bg-it-700 text-it-1000",
    me: "bg-me-300 hover:bg-me-500 focus:bg-me-700 text-me-1000",
    we: "bg-we-300 hover:bg-we-500 focus:bg-we-700 text-we-1000",
    gray: "bg-gray-300 hover:bg-gray-500 focus:bg-gray-700 text-gray-1000"
  };

  return (
    <Link href={href}>
      <button
        type="button"
        className={`focus:outline-none disabled:opacity-25 inline-flex items-center tracking-wide transition-colors duration-200 transform rounded-md ${sizeClasses[size]} ${colorClasses[colorSchema]} ${className}`}
      >
        {children}
      </button>
    </Link>
  );
};