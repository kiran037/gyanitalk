
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Edit3, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";


import { getAiAstro, getAiProfileDetails, updateAiProfile } from "@/app/(astrologers)/ai-astrologers/fetch";
import { uploadImage } from "@/upload";

/* -----------------------------------
   tiny utils
------------------------------------ */
const avatarSrc = (img?: string) =>
  img ? `${process.env.NEXT_PUBLIC_BASEURL}${img}` : "https://gyanitalk.com/build/assets/images/person.png";

const clsx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

/* -----------------------------------
   Liquid Glass primitives (parity with astrologer page)
------------------------------------ */
function GlassCard({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-3xl",
        "bg-white/55 dark:bg-white/[0.06] border border-white/50 dark:border-white/10",
        "backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.02]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function GlassButton(
  { children, className = "", variant = "primary", ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }
) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = {
    primary:
      "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-[0_8px_20px_rgba(59,130,246,0.25)]",
    secondary:
      "text-slate-900 dark:text-white bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/[0.12]",
    ghost:
      "text-slate-700 dark:text-slate-300 bg-transparent hover:bg-white/50 dark:hover:bg-white/[0.08] border border-transparent",
  } as const;
  return (
    <button {...rest} className={clsx(base, styles[variant], className)}>{children}</button>
  );
}

function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-xl px-4 py-2.5 text-sm outline-none",
        "bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
        "text-slate-900 dark:text-slate-100",
        props.className
      )}
    />
  );
}
function GlassTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full rounded-xl px-4 py-3 text-sm outline-none resize-none",
        "bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
        "text-slate-900 dark:text-slate-100",
        props.className
      )}
    />
  );
}
function GlassSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        "w-full rounded-xl px-4 py-2.5 text-sm outline-none",
        "bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "text-slate-900 dark:text-slate-100",
        props.className
      )}
    />
  );
}

/* -----------------------------------
   OS26-style switch (no visible label)
------------------------------------ */
function SwitchOS26({
  checked,
  onChange,
  disabled = false,
  ariaLabel = "Toggle"
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        "relative inline-flex h-[28px] w-[52px] rounded-full transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
        "backdrop-blur-md border",
        checked
          ? "bg-gradient-to-r from-blue-600 to-purple-600 border-white/40 shadow-[0_6px_20px_rgba(59,130,246,0.35)]"
          : "bg-white/40 dark:bg-white/[0.10] border-white/30 dark:border-white/10"
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 left-0.5 h-[24px] w-[24px] rounded-full",
          "bg-white dark:bg-slate-100 shadow-md transition-transform will-change-transform",
          checked ? "translate-x-[24px] shadow-[0_0_0_3px_rgba(255,255,255,0.35)]" : "translate-x-0"
        )}
      />
      <span className="sr-only">{ariaLabel}</span>
    </button>
  );
}

/* -----------------------------------
   Skeletons (matching your other page)
------------------------------------ */
const ListSkeleton = () => (
  <div className="grid gap-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-20 rounded-3xl bg-white/60 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 animate-pulse" />
    ))}
  </div>
);
const DetailsSkeleton = () => (
  <div className="grid gap-3">
    <div className="h-40 rounded-3xl bg-white/60 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 animate-pulse" />
    <div className="h-40 rounded-3xl bg-white/60 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 animate-pulse" />
  </div>
);

/* -----------------------------------
   Stat chip (parity with astrologer page)
------------------------------------ */
function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-sm">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-semibold text-slate-900 dark:text-white text-sm">{value}</p>
      </div>
    </div>
  );
}

/* -----------------------------------
   List (cards) — same vibe as astrologer page
------------------------------------ */
function AiAstrologerCards({
  page = 1,
  limit = 15,
  search = "",
  onOpen,
}: {
  page?: number;
  limit?: number;
  search?: string;
  onOpen: (id: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { astrologers, totalPages, currentPage } = await getAiAstro({ page, limit, search });
        if (!mounted) return;
        setRows(astrologers || []);
        setTotalPages(totalPages || 1);
        setCurrentPage(currentPage || page || 1);
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, limit, search]);

  const goto = (p: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(p));
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFeatured = async (id: number, wasOn: boolean) => {
    const next = !wasOn;
    // optimistic update
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, featured: next ? 1 : 0 } : r)));
    setBusyIds((s) => new Set(s).add(id));
    try {
      await updateAiProfile?.(id as any, { featured: next ? 1 : 0 });
    } catch (e) {
      console.error(e);
      // rollback on failure
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, featured: wasOn ? 1 : 0 } : r)));
    } finally {
      setBusyIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  };

  if (loading) return <ListSkeleton />;

  return (
    <div className="grid gap-3">
      {rows.map((item) => {
        const isBusy = busyIds.has(item.id);
        const isOn = item.featured === 1;

        return (
          <GlassCard key={item.id} className="p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* identity */}
              <div className="flex items-center gap-4 md:w-[34%]">
                <div className="relative h-14 w-14 rounded-full overflow-hidden ring-4 ring-white/70 dark:ring-white/10 shadow">
                  <Image src={avatarSrc(item.image)} alt={item.name || "User"} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.name || "-"}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">AI: {item.aiType || "—"}</p>
                </div>
              </div>

              {/* stats */}
              <div className="grid grid-cols-3 gap-3 md:flex-1 w-full">
                <StatChip label="Requests" value={String(item.totalChatRequest || 0)} />
                <StatChip label="Charge" value={`₹${item.chat_charge || 0}`} />
                <StatChip label="Experience" value={`${item.experience || 0} yrs`} />
              </div>

              {/* actions: ONLY switch + edit */}
              <div className="flex items-center gap-3 md:w-[28%] md:justify-end">
                <SwitchOS26
                  checked={isOn}
                  disabled={isBusy}
                  onChange={() => toggleFeatured(item.id, isOn)}
                  ariaLabel="Toggle featured"
                />
                <GlassButton variant="secondary" onClick={() => onOpen(String(item.id))}>
                  <Edit3 className="h-4 w-4" />
                  Edit
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        );
      })}

      {/* pagination */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <GlassButton variant="secondary" onClick={() => goto(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </GlassButton>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((p, idx, arr) => {
            const withEllipsis = idx > 0 && p - (arr[idx - 1] ?? 0) > 1;
            return (
              <React.Fragment key={p}>
                {withEllipsis ? <span className="px-1 text-slate-500">…</span> : null}
                <GlassButton variant={p === currentPage ? "primary" : "secondary"} onClick={() => goto(p)}>
                  {p}
                </GlassButton>
              </React.Fragment>
            );
          })}

        <GlassButton
          variant="secondary"
          onClick={() => goto(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </GlassButton>
      </div>
    </div>
  );
}

/* -----------------------------------
   Modal (same family as your other page)
------------------------------------ */
function GlassModal({
  open,
  onClose,
  children,
  title,
  maxWidth = "max-w-5xl",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
}) {
  const [mounted, setMounted] = React.useState(false);

  // mount gate for client-only portal
  useEffect(() => setMounted(true), []);

  // ESC to close + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center p-4 md:p-6"
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      {/* full-viewport overlay, with blur on supported browsers and WebKit fallback */}
      <div
        className="absolute inset-0 bg-black/60 supports-[backdrop-filter]:backdrop-blur-md"
        style={{ WebkitBackdropFilter: "blur(12px)" }}
      />

      <div className={`relative w-full ${maxWidth}`}>
        <div
          className={[
            "relative overflow-hidden rounded-[24px]",
            "bg-white/55 dark:bg-white/[0.06] border border-white/50 dark:border-white/10",
            "backdrop-blur-2xl shadow-[0_8px_30px_rgba(2,6,23,0.10)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.06] dark:via-white/[0.03]" />

          <div className="relative flex items-center justify-between p-5 border-b border-white/60 dark:border-white/10">
            <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
              {title || "Edit"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl
                         bg-white/75 dark:bg-white/[0.08] border border-white/60 dark:border-white/10
                         hover:bg-white/95 dark:hover:bg-white/[0.12] transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative max-h-[75vh] overflow-y-auto p-5">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}


/* -----------------------------------
   Editor (inside modal)
------------------------------------ */
function AiAstrologerEditor({ id, onSaved }: { id: string; onSaved?: () => void }) {
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>({
    name: "",
    about: "",
    astrologerCategoryId: [] as number[],
    primary_skill: [] as number[],
    all_skills: [] as number[],
    aiType: "gemini",
    featured: 0,
    chat_charge: 0,
    experience: 0,
    imageFile: null as File | null,
    image: undefined as string | undefined,
  });
  const [open, setOpen] = useState({ categories: false, primary: false, all: false });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await getAiProfileDetails({ id });
        if (!mounted) return;
        setData(result);
        setForm((prev: any) => ({
          ...prev,
          ...result.astroDetail,
          astrologerCategoryId: result.astroDetail?.astrologerCategoryId
            ? result.astroDetail.astrologerCategoryId.split(",").map((x: string) => Number(x))
            : [],
          primary_skill: result.astroDetail?.primary_skill
            ? result.astroDetail.primary_skill.split(",").map((x: string) => Number(x))
            : [],
          all_skills: result.astroDetail?.all_skills
            ? result.astroDetail.all_skills.split(",").map((x: string) => Number(x))
            : [],
        }));
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const getItemName = (items: any[], _id: number) =>
    items?.find((it: any) => Number(it.id) === Number(_id))?.name || "";

  const togglePick = (key: "astrologerCategoryId" | "primary_skill" | "all_skills", v: number) => {
    setForm((s: any) => {
      const arr: number[] = s[key] ?? [];
      return { ...s, [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] };
    });
  };
  const removeChip = (key: "astrologerCategoryId" | "primary_skill" | "all_skills", v: number) => {
    setForm((s: any) => {
      const arr: number[] = s[key] ?? [];
      return { ...s, [key]: arr.filter((x) => x !== v) };
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imagePath: string | null = null;
    try {
      if (form.imageFile) {
        const up = await uploadImage(form.imageFile, "images/aiastrologer-profile", "public/assets");
        if (up?.success) imagePath = up.path;
      }
      const payload = {
        ...form,
        astrologerCategoryId: (form.astrologerCategoryId as number[]).join(","),
        primary_skill: (form.primary_skill as number[]).join(","),
        all_skills: (form.all_skills as number[]).join(","),
        ...(imagePath ? { image: imagePath } : {}),
      };
      await updateAiProfile?.(id as any, payload);
      onSaved?.();
    } catch (e) {
      console.error(e);
      alert("Failed to save. Check console for details.");
    }
  };

  if (!data) return <DetailsSkeleton />;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* identity */}
      <GlassCard className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative h-24 w-24 rounded-full overflow-hidden ring-4 ring-white/70 dark:ring-white/10 shadow shrink-0">
            <Image
              src={
                form.imageFile
                  ? URL.createObjectURL(form.imageFile)
                  : data.astroDetail?.image
                  ? `${process.env.NEXT_PUBLIC_BASEURL}${data.astroDetail.image}`
                  : "https://gyanitalk.com/build/assets/images/person.png"
              }
              alt="profile"
              fill
              className="object-cover"
            />
            <label className="absolute -bottom-2 -right-2 inline-flex items-center justify-center h-9 w-9 rounded-xl cursor-pointer text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow">
              <Edit3 className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && setForm((s: any) => ({ ...s, imageFile: e.target.files![0] }))}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <GlassInput
              value={form.name || ""}
              onChange={(e) => setForm((s: any) => ({ ...s, name: e.target.value }))}
              placeholder="Astrologer name"
            />
            <div className="mt-2">
              <span className="inline-flex items-center rounded-xl px-2.5 py-1 text-[11px] text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow">
                AI Astrologer
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* form sections */}
      <GlassCard className="p-6 space-y-6">
        <section>
          <label className="block mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">About</label>
          <GlassTextarea
            rows={4}
            value={form.about || ""}
            onChange={(e) => setForm((s: any) => ({ ...s, about: e.target.value }))}
            placeholder="Write a short, compelling bio…"
          />
        </section>

        <PickerSection
          title="Categories"
          chips={(form.astrologerCategoryId as number[]).map((id: number) => ({ id, label: getItemName(data.categories, id) }))}
          onRemove={(id: number) => removeChip("astrologerCategoryId", id)}
          open={open.categories}
          setOpen={(v) => setOpen((o) => ({ ...o, categories: v }))}
          items={data.categories}
          isPicked={(id: number) => (form.astrologerCategoryId as number[]).includes(id)}
          onPick={(id: number) => togglePick("astrologerCategoryId", id)}
          accent="blue"
        />

        <PickerSection
          title="Primary Skills"
          chips={(form.primary_skill as number[]).map((id: number) => ({ id, label: getItemName(data.skills, id) }))}
          onRemove={(id: number) => removeChip("primary_skill", id)}
          open={open.primary}
          setOpen={(v) => setOpen((o) => ({ ...o, primary: v }))}
          items={data.skills}
          isPicked={(id: number) => (form.primary_skill as number[]).includes(id)}
          onPick={(id: number) => togglePick("primary_skill", id)}
          accent="green"
        />

        <PickerSection
          title="All Skills"
          chips={(form.all_skills as number[]).map((id: number) => ({ id, label: getItemName(data.skills, id) }))}
          onRemove={(id: number) => removeChip("all_skills", id)}
          open={open.all}
          setOpen={(v) => setOpen((o) => ({ ...o, all: v }))}
          items={data.skills}
          isPicked={(id: number) => (form.all_skills as number[]).includes(id)}
          onPick={(id: number) => togglePick("all_skills", id)}
          accent="purple"
        />

        <section className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">AI Type</label>
            <GlassSelect
              value={form.aiType}
              onChange={(e) => setForm((s: any) => ({ ...s, aiType: e.target.value }))}
            >
              <option value="gemini">Gemini</option>
              <option value="openai">OpenAI</option>
            </GlassSelect>
          </div>

          {/* no visible "Featured" text—use switch only */}
          <div className="flex items-center gap-3">
            <span className="sr-only">Featured</span>
            <SwitchOS26
              checked={form.featured === 1}
              onChange={(next) => setForm((s: any) => ({ ...s, featured: next ? 1 : 0 }))}
              ariaLabel="Featured"
            />
          </div>
        </section>

        <section className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Chat Charge</label>
            <GlassInput
              type="number"
              value={form.chat_charge}
              onChange={(e) => setForm((s: any) => ({ ...s, chat_charge: Number(e.target.value) }))}
              placeholder="₹0"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Experience (years)</label>
            <GlassInput
              type="number"
              value={form.experience}
              onChange={(e) => setForm((s: any) => ({ ...s, experience: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>
        </section>

        <div className="flex justify-end">
          <GlassButton type="submit">Save Changes</GlassButton>
        </div>
      </GlassCard>
    </form>
  );
}

function PickerSection({
  title,
  chips,
  onRemove,
  open,
  setOpen,
  items,
  isPicked,
  onPick,
  accent,
}: {
  title: string;
  chips: Array<{ id: number; label: string }>;
  onRemove: (id: number) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  items: any[];
  isPicked: (id: number) => boolean;
  onPick: (id: number) => void;
  accent: "blue" | "green" | "purple";
}) {
  const accentBg =
    accent === "blue" ? "bg-blue-100/70 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200" :
    accent === "green" ? "bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200" :
    "bg-purple-100/70 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200";

  return (
    <section className="relative">
      <label className="block mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</label>

      <div className="mb-3 min-h-[40px]">
        {chips.length ? (
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c.id} className={clsx("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium", accentBg)}>
                {c.label}
                <button type="button" onClick={() => onRemove(c.id)} className="rounded-lg p-1 hover:bg-white/40 dark:hover:bg-white/10">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-slate-500 dark:text-slate-400">None selected</p>
        )}
      </div>

      <div className="relative">
        <GlassButton type="button" variant="secondary" className="w-full justify-between" onClick={() => setOpen(!open)}>
          <span>Add…</span>
          <ChevronDown className={clsx("h-4 w-4 transition-transform", open && "rotate-180")} />
        </GlassButton>

        {open && (
          <div className="absolute z-10 mt-2 w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/[0.10] backdrop-blur shadow-xl max-h-60 overflow-y-auto">
            {items.map((it: any) => {
              const picked = isPicked(Number(it.id));
              return (
                <button
                  type="button"
                  key={it.id}
                  onClick={() => onPick(Number(it.id))}
                  className={clsx(
                    "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between",
                    "hover:bg-white/70 dark:hover:bg-white/[0.12] transition-colors"
                  )}
                >
                  <span className="text-slate-900 dark:text-slate-100">{it.name}</span>
                  {picked ? <span className="h-2 w-2 rounded-full bg-blue-500" /> : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* -----------------------------------
   PAGE — same container + ambient blobs
------------------------------------ */
export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = useMemo(() => parseInt(searchParams.get("page") || "1", 10), [searchParams]);
  const search = useMemo(() => searchParams.get("search") || "", [searchParams]);
  const selectedId = searchParams.get("id") || "";

  const [query, setQuery] = useState(search);
  useEffect(() => setQuery(search), [search]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    query ? params.set("search", query) : params.delete("search");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };
  const openEditor = (id: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("id", id);
    router.push(`?${params.toString()}`, { scroll: false });
  };
  const closeEditor = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("id");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full min-w-0 mx-auto px-4 md:px-6 space-y-6 overflow-x-hidden">
      {/* ambient blobs kept inside container bounds */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-40 w-[26rem] h-[26rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
      </div>

      {/* header */}
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">AI Astrologers</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage, edit, and feature AI profiles.</p>
      </div>

      {/* search */}
      <GlassCard className="p-4 md:p-5">
        <form onSubmit={submitSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <GlassInput
              className="pl-10"
              placeholder="Search by name or contact"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              name="search"
            />
          </div>
          <div className="flex gap-2">
            <GlassButton type="submit">Search</GlassButton>
            {search ? (
              <GlassButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  const params = new URLSearchParams(window.location.search);
                  params.delete("search");
                  params.set("page", "1");
                  router.push(`?${params.toString()}`);
                }}
              >
                Clear
              </GlassButton>
            ) : null}
          </div>
        </form>
      </GlassCard>

      {/* list */}
      <AiAstrologerCards page={page} search={search} onOpen={openEditor} />

      {/* editor modal */}
      <GlassModal open={!!selectedId} onClose={closeEditor} title="Edit AI Astrologer">
        {selectedId ? <AiAstrologerEditor id={selectedId} onSaved={closeEditor} /> : null}
      </GlassModal>
    </div>
  );
}
