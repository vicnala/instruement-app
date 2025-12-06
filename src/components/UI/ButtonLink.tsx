import { Link } from "@/i18n/routing";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
  "aria-label"?: string;
}

export const ButtonLink = ({ href, children, className = "", size = "md", theme = "us", external = false, "aria-label": ariaLabel }: ButtonLinkProps & {
  size?: "sm" | "md" | "lg";
  theme?: "it" | "me" | "we" | "us"
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1",
    md: "px-4 py-2 text-sm gap-2", 
    lg: "px-5 py-3 text-base gap-3"
  };

  return (
    <Link href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
      <button
        type="button"
        data-theme={theme}
        aria-label={ariaLabel}
        className={
          `focus:outline-none disabled:opacity-25 inline-flex items-center tracking-wide transition-colors duration-200 transform 
           bg-transparent hover:bg-scope-500
           border-[0.1rem] border-scope-400 hover:border-scope-500 focus:border-scope-800 
           text-scope-500 hover:text-scope-1000 focus:text-scope-1000
            font-bold 
          ${sizeClasses[size]} 
          ${className}`}
      >
        {children}
      </button>
    </Link>
  );
};