///Users/xeoren/gyanitallk-admin/src/components/GlassUI/GlassSwitch.tsx
"use client";

import { cx } from "./GlassKit";

export default function GlassSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const toggle = () => onChange(!checked);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Toggle"
      data-checked={checked ? "" : undefined}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle();
        }
      }}
      className={cx(
        // track
        "relative inline-flex select-none outline-none",
        "h-[30px] w-[54px] rounded-full border backdrop-blur-xl p-[3px]", // inner padding to avoid clipping
        "border-white/30 dark:border-white/10",
        "transition-colors duration-300 ease-out will-change-transform",
        "focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-white/50 dark:focus-visible:ring-offset-transparent",
        // bg by state
        checked
          ? "bg-gradient-to-r from-blue-500 to-blue-600"
          : "bg-white/70 dark:bg-white/[0.06]"
      )}
    >
      {/* thumb */}
      <span
        className={cx(
          "pointer-events-none absolute top-1/2 -translate-y-1/2",
          "h-[24px] w-[24px] rounded-full bg-white shadow-md",
          "transition-transform duration-300 ease-out will-change-transform",
          checked ? "translate-x-[24px]" : "translate-x-0"
        )}
      />
      <span className="sr-only">Toggle</span>
    </button>
  );
}
