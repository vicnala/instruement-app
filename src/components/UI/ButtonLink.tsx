import { Link } from "@/i18n/routing";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export const ButtonLink = ({ href, children, className = "", size = "md", colorSchema = "it", external = false }: ButtonLinkProps & {
  size?: "sm" | "md" | "lg";
  colorSchema?: "it" | "me" | "we" | "gray"
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1",
    md: "px-4 py-2 text-sm gap-2", 
    lg: "px-5 py-3 text-base gap-3"
  };

  const colorClasses = {
    it: "bg-transparent border-it-400 hover:bg-it-400 hover:text-it-1000 focus:bg-it-600 text-it-500",
    me: "bg-transparent border-me-400 hover:bg-me-400 hover:text-me-1000 focus:bg-me-600 text-me-500",
    we: "bg-transparent border-we-400 hover:bg-we-400 hover:text-we-1000 focus:bg-we-600 text-we-500",
    gray: "bg-transparent border-gray-400 hover:bg-gray-400 hover:text-white focus:bg-gray-600 text-gray-500"
  };

  return (
    <Link href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
      <button
        type="button"
        className={`focus:outline-none disabled:opacity-25 inline-flex items-center tracking-wide transition-colors duration-200 transform rounded-md border-[0.1rem] font-bold ${sizeClasses[size]} ${colorClasses[colorSchema]} ${className}`}
      >
        {children}
      </button>
    </Link>
  );
};