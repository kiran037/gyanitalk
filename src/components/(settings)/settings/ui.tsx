import React from "react";

export const Surface = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}>
    {children}
  </div>
);

export const Section = ({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) => (
  <Surface>
    <div className="rounded-t-2xl border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/60">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      {desc ? <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{desc}</p> : null}
    </div>
    <div className="p-4">{children}</div>
  </Surface>
);

export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  icon: Icon,
  loading = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  icon?: React.ElementType;
  loading?: boolean;
  className?: string;
}) => {
  const variants: Record<string, string> = {
    primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs rounded-lg",
    md: "h-10 px-4 text-sm rounded-lg",
    lg: "h-12 px-5 text-base rounded-lg",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${sizes[size]} ${variants[variant]} inline-flex items-center gap-2 font-medium transition-colors ${disabled || loading ? "cursor-not-allowed opacity-60" : ""} ${className}`}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
};

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={[
      "w-full rounded-lg",
      "border border-gray-300 dark:border-gray-600",
      "bg-white dark:bg-gray-800",
      "px-3 py-2 text-sm text-gray-900 dark:text-gray-100",
      "placeholder:text-gray-400 dark:placeholder:text-gray-500",
      "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400/50",
      props.className || "",
    ].join(" ")}
  />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={[
      "w-full rounded-lg",
      "border border-gray-300 dark:border-gray-600",
      "bg-white dark:bg-gray-800",
      "px-3 py-2 text-sm text-gray-900 dark:text-gray-100",
      "placeholder:text-gray-400 dark:placeholder:text-gray-500",
      "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400/50",
      "min-h-24",
      props.className || "",
    ].join(" ")}
  />
);
