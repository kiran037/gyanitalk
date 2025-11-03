// // components/details/details-accordion.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import { ChevronDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast/ToastProvider";
import { GlassCard } from "@/components/GlassUI/GlassKit";

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

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {sections.map((s) => (
          <GlassCard key={s.id} className="overflow-hidden">
            <Section id={s.id} title={s.title} data={s.data} open={isOpen(s.id)} onToggle={() => toggle(s.id)} />
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

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
  const filled = useMemo(() => (data || []).filter((r) => truthy(r.value)).length, [data]);
  const many = (data?.length || 0) > 12;

  return (
    <div className="relative">
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
          <h3 className="truncate text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <span
            className={cn(
              "shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
              "border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300"
            )}
          >
            {filled}/{data?.length ?? 0}
          </span>
        </div>
        <ChevronDown className={cn("h-5 w-5 text-slate-600 dark:text-slate-300 transition-transform", open && "rotate-180")} />
      </button>

      <div id={`${id}-panel`} className={cn("border-t border-white/30 dark:border-white/10 px-5 md:px-6", open ? "py-4 md:py-5" : "py-0")}>
        <div className={cn("transition-opacity duration-200", open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none hidden")}>
          {data?.length ? (
            <div
              className={cn(
                "grid gap-3 md:gap-4",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                many && "max-h-[42vh] overflow-auto pr-1"
              )}
            >
              {data.map((r, i) => (
                <RowCard key={`${r.label}-${i}`} label={r.label} value={r.value} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border px-4 py-6 text-center text-sm border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400">
              No data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="group flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06]">
      <div className="min-w-0">
        <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-sm font-medium",
              isAffirmative(display) ? "text-emerald-700 dark:text-emerald-300" : "text-slate-800 dark:text-slate-200"
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

/* utils */
function truthy(v?: string) {
  if (!v) return false;
  const s = v.toString().trim().toLowerCase();
  return s !== "" && s !== "n/a" && s !== "na" && s !== "none" && s !== "-";
}
function canCopy(v: string) { return truthy(v) && v.length <= 120; }
function isAffirmative(v: string) { return ["yes", "true", "available", "active", "approved"].includes(v.trim().toLowerCase()); }
function formatValue(v: string) { if (!truthy(v)) return "—"; const s = v.trim(); if (s.toLowerCase()==="true") return "Yes"; if (s.toLowerCase()==="false") return "No"; if (isAffirmative(s)) return `✓ ${capitalize(s)}`; return s; }
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
