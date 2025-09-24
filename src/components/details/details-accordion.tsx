

// "use client";

// import { ChevronDownIcon } from "lucide-react";
// import { useState } from "react";

// type Row = { label: string; value: string };

// export default function ProfileDetailsAccordion({
//   skillDetails,
//   otherDetails,
//   dayAvailability,
// }: {
//   skillDetails: Row[];
//   otherDetails: Row[];
//   dayAvailability: Row[];
// }) {
//   const [open, setOpen] = useState<string | null>("skills");

//   const Section = ({
//     id,
//     title,
//     data,
//   }: {
//     id: string;
//     title: string;
//     data: Row[];
//   }) => {
//     const active = open === id;
//     return (
//       <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//         <button
//           onClick={() => setOpen(active ? null : id)}
//           className="flex w-full items-center justify-between px-5 py-4"
//         >
//           <h3 className="text-base font-semibold text-gray-900">{title}</h3>
//           <ChevronDownIcon
//             className={`h-5 w-5 text-indigo-600 transition-transform ${active ? "rotate-180" : ""}`}
//           />
//         </button>

//         <div
//           className={`grid grid-cols-1 gap-3 border-t border-gray-100 px-5 transition-[max-height,opacity] duration-300 ${
//             active ? "max-h-[800px] py-4 opacity-100" : "max-h-0 overflow-hidden opacity-0"
//           }`}
//         >
//           {data?.length ? (
//             data.map((r, i) => (
//               <div
//                 key={i}
//                 className="grid grid-cols-2 items-start gap-3 rounded-lg bg-gray-50 px-4 py-3 text-sm"
//               >
//                 <div className="text-gray-600">{r.label}</div>
//                 <div className="text-right font-medium text-gray-900">{r.value}</div>
//               </div>
//             ))
//           ) : (
//             <div className="py-4 text-sm text-gray-500">No data</div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6 p-6">
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//         <Section id="skills" title="Skill Details" data={skillDetails} />
//         <Section id="other" title="Other Details" data={otherDetails} />
//       </div>
//       <Section id="availability" title="Day Availability" data={dayAvailability} />
//     </div>
//   );
// }
"use client";

import { useMemo, useState, useCallback } from "react";
import { ChevronDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast/ToastProvider";

type Row = { label: string; value: string };

export default function ProfileDetailsAccordion({
  skillDetails,
  otherDetails,
  dayAvailability,
}: {
  skillDetails: Row[];
  otherDetails: Row[];
  dayAvailability: Row[];
}) {
  const sections = useMemo(
    () => [
      { id: "skills", title: "Skill Details", data: skillDetails },
      { id: "other", title: "Other Details", data: otherDetails },
      { id: "availability", title: "Day Availability", data: dayAvailability },
    ],
    [skillDetails, otherDetails, dayAvailability]
  );

  // Multi-open: store open ids in a Set
  const [open, setOpen] = useState<Set<string>>(new Set(["skills", "other"]));

  const isOpen = useCallback((id: string) => open.has(id), [open]);
  const toggle = useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);
  const expandAll = () => setOpen(new Set(sections.map((s) => s.id)));
  const collapseAll = () => setOpen(new Set());

  return (
    <div className="space-y-4 md:space-y-6 p-5 md:p-6">
      {/* Top controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
          Profile Details
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="rounded-lg border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/[0.12] transition"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="rounded-lg border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/[0.12] transition"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {sections.map((s) => (
          <Section
            key={s.id}
            id={s.id}
            title={s.title}
            data={s.data}
            open={isOpen(s.id)}
            onToggle={() => toggle(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* =================== Section =================== */
function Section({
  id,
  title,
  data,
  open,
  onToggle,
}: {
  id: string;
  title: string;
  data: Row[];
  open: boolean;
  onToggle: () => void;
}) {
  const filled = useMemo(
    () => (data || []).filter((r) => truthy(r.value)).length,
    [data]
  );
  const many = (data?.length || 0) > 12;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border backdrop-blur-2xl",
        "border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06]",
        "shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent" />

      {/* Header */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className={cn(
          "relative z-10 flex w-full items-center justify-between gap-3 px-5 py-4 md:px-6",
          "hover:bg-white/40 dark:hover:bg-white/[0.05] transition-colors"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="truncate text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <span
            className={cn(
              "shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
              "border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300"
            )}
          >
            {filled}/{data?.length ?? 0}
          </span>
        </div>

        <ChevronDown
          className={cn(
            "h-5 w-5 text-slate-600 dark:text-slate-300 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Content */}
      <div
        id={`${id}-panel`}
        className={cn(
          "border-t border-white/30 dark:border-white/10 px-5 md:px-6",
          open ? "py-4 md:py-5" : "py-0"
        )}
      >
        <div
          className={cn(
            "transition-opacity duration-200",
            open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none hidden"
          )}
        >
          {data?.length ? (
            <div
              className={cn(
                "grid gap-3 md:gap-4",
                // Balanced dense layout: 1 col on mobile, 2 on sm, 3 on lg
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                // If there are many items, constrain height so page doesn't jump
                many && "max-h-[42vh] overflow-auto pr-1"
              )}
            >
              {data.map((r, i) => (
                <RowCard key={`${r.label}-${i}`} label={r.label} value={r.value} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

/* =================== RowCard =================== */
function RowCard({ label, value }: Row) {
  const toast = useToast();
  const can = canCopy(value);
  const display = formatValue(value);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast("warning", "Copied", "Value copied to clipboard.");
    } catch {
      toast("error", "Error", "Could not copy to clipboard.");
    }
  };

  return (
    <div
      className={cn(
        "group flex items-start justify-between gap-3 rounded-2xl border px-4 py-3",
        "border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06]"
      )}
    >
      <div className="min-w-0">
        <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-sm font-medium",
              isAffirmative(display)
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-slate-800 dark:text-slate-200"
            )}
            title={display}
          >
            {display}
          </span>

          {can && (
            <button
              type="button"
              onClick={copy}
              className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label="Copy value"
              title="Copy"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =================== EmptyState =================== */
function EmptyState() {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-6 text-center text-sm",
        "border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400"
      )}
    >
      No data
    </div>
  );
}

/* =================== utils =================== */
function truthy(v?: string) {
  if (!v) return false;
  const s = v.toString().trim().toLowerCase();
  return s !== "" && s !== "n/a" && s !== "na" && s !== "none" && s !== "-";
}

function canCopy(v: string) {
  return truthy(v) && v.length <= 120;
}

function isAffirmative(v: string) {
  return ["yes", "true", "available", "active", "approved"].includes(v.trim().toLowerCase());
}

function formatValue(v: string) {
  if (!truthy(v)) return "—";
  const s = v.trim();
  if (s.toLowerCase() === "true") return "Yes";
  if (s.toLowerCase() === "false") return "No";
  if (isAffirmative(s)) return `✓ ${capitalize(s)}`;
  return s;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
