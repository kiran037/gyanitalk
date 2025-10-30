///Users/xeoren/gyanitallk-admin/src/components/GlassUI/GlassSelect.tsx
"use client";

import { cx, glass } from "./GlassKit";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  wrapperClassName?: string;
};

export default function GlassSelect({
  label,
  hint,
  className,
  wrapperClassName,
  children,
  ...props
}: Props) {
  return (
    <label className={cx("flex flex-col gap-1", wrapperClassName)}>
      {label ? (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {label}
        </span>
      ) : null}
      <select {...props} className={cx(glass.input, "w-full", className)}>
        {children}
      </select>
      {hint ? (
        <span className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}
