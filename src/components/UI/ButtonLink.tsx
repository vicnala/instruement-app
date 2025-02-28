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
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm", 
    lg: "px-5 py-3 text-base"
  };

  const colorClasses = {
    it: "bg-transparent border-it-400 hover:bg-it-400 hover:text-white focus:bg-it-600 text-it-400",
    me: "bg-transparent border-me-400 hover:bg-me-400 hover:text-white focus:bg-me-600 text-me-400",
    we: "bg-transparent border-we-400 hover:bg-we-400 hover:text-white focus:bg-we-600 text-we-400",
    gray: "bg-transparent border-gray-400 hover:bg-gray-400 hover:text-white focus:bg-gray-600 text-gray-500"
  };

  return (
    <Link href={href}>
      <button
        type="button"
        className={`focus:outline-none disabled:opacity-25 inline-flex items-center tracking-wide transition-colors duration-200 transform rounded-md border-2 font-bold ${sizeClasses[size]} ${colorClasses[colorSchema]} ${className}`}
      >
        {children}
      </button>
    </Link>
  );
};