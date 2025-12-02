import { ReactNode } from "react";

interface ButtonProps {
  children?: ReactNode; // <-- made optional
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  ariaLabel?: string; // <-- optional aria-label for icon-only buttons
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  ariaLabel,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white hover:shadow-lg focus:ring-[#FF6B35]/50",
    outline:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-300",
    ghost:
      "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-300",
    danger:
      "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // If the button has no visible children, use aria-label for accessibility
  const ariaProps = ariaLabel ? { "aria-label": ariaLabel } : {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...ariaProps}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        // show icon if provided
        icon ? <span aria-hidden>{icon}</span> : null
      )}

      {/* Only render children if provided */}
      {children ? <span>{children}</span> : null}
    </button>
  );
}
