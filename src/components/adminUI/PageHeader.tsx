import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant: "blue" | "green" | "orange" | "purple";
  };
  actions?: ReactNode;
  leftActions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  leftActions,
}: PageHeaderProps) {
  const badgeColors = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        {/* Back Icon */}
        {leftActions && (
          <div className="flex-shrink-0">
            {leftActions}
          </div>
        )}

        <div>
          {/* Badge */}
          {badge && (
            <span
              className={`inline-flex mb-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase ${
                badgeColors[badge.variant]
              }`}
            >
              {badge.text}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT ACTIONS */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}