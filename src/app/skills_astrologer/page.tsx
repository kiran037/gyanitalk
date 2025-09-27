"use client";

import React, { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Trash2, Plus, Pencil, X } from "lucide-react";
import {
  getSkills,
  deleteSkill,
  createSkill,
  updateSkill,
  updateSkillStatus,
} from "@/app/skills_astrologer/fetch";
import toast from "react-hot-toast";

type Skill = {
  id: number;
  name: string;
  isActive: boolean;
  isDelete: boolean;
  createdBy?: number;
  modifiedBy?: number;
};

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const glass = {
  surface:
    "relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl " +
    "shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
  lift:
    "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(0,0,0,0.10)] " +
    "dark:hover:shadow-[0_16px_44px_rgba(0,0,0,0.45)]",
  input:
    "rounded-xl border border-white/30 dark:border-white/10 bg-white/85 dark:bg-white/[0.06] " +
    "px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 " +
    "shadow-[0_8px_20px_rgba(59,130,246,0.25)]",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white",
  chip: "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border",
};

function GlassCard({
  children,
  className = "",
  hover = false,
}: React.PropsWithChildren<{ className?: string; hover?: boolean }>) {
  return <div className={cx(glass.surface, hover && glass.lift, className)}>{children}</div>;
}

function StatusPill({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cx(
        glass.chip,
        active
          ? "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40"
          : "bg-rose-100/70 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40"
      )}
      title={active ? "Set Inactive" : "Set Active"}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", active ? "bg-emerald-500" : "bg-rose-500")} />
      {active ? "Active" : "Inactive"}
    </button>
  );
}

function SkeletonRows() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/30">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cx(
            "grid grid-cols-12 items-center gap-4 px-4 py-3",
            i % 2 ? "bg-white/60 dark:bg-white/[0.04]" : "bg-transparent"
          )}
        >
          <div className="col-span-5 h-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
          <div className="col-span-3 h-6 rounded-full bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
          <div className="col-span-4 h-8 rounded-xl bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function GlassModal({
  title,
  subtitle,
  children,
  onClose,
  footer,
  wide,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {/* Dialog */}
      <div
        className={cx(
          "relative z-10 overflow-hidden rounded-3xl border border-white/20 bg-white/75 dark:bg-white/[0.08] backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.35)]",
          "w-full", wide ? "max-w-2xl" : "max-w-lg"
        )}
      >
        <div className="flex items-start justify-between border-b border-white/20 bg-gradient-to-r from-white/60 to-white/40 dark:from-white/[0.06] dark:to-white/[0.04] px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/[0.12] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">{children}</div>

        <div className="flex items-center justify-end gap-3 border-t border-white/20 bg-white/40 dark:bg-white/[0.04] px-6 py-4">
          {footer}
        </div>
      </div>
    </div>
  );
}

function SkillsTable({
  initialPage,
  initialSearch,
}: {
  initialPage: number;
  initialSearch: string;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [rows, setRows] = useState<Skill[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [search, setSearch] = useState<string>(initialSearch);

  // modals
  const [showDelete, setShowDelete] = useState<{ open: boolean; id?: number }>({ open: false });
  const [showEdit, setShowEdit] = useState<{ open: boolean; skill?: Skill }>({ open: false });
  const [showAdd, setShowAdd] = useState<boolean>(false);

  // form states
  const [editName, setEditName] = useState("");
  const [addName, setAddName] = useState("");

  const [isPending, startTransition] = useTransition();

  const fetchData = async (page: number, q: string) => {
    try {
      setLoading(true);
      const res = await getSkills({ page, limit: 15, search: q });
      setRows(res?.skills ?? []);
      setTotalPages(res?.totalPages ?? 1);
      setCurrentPage(res?.currentPage ?? page);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(initialPage, initialSearch);
  }, [initialPage, initialSearch]);

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const q = String(fd.get("search") ?? "");
    setSearch(q);
  };

  useEffect(() => {
    fetchData(1, search);
  }, [search]);

  const toggleStatus = async (id: number, current: boolean) => {
    try {
      await updateSkillStatus(id, !current);
      toast.success(`Skill ${!current ? "activated" : "deactivated"}`);
      fetchData(currentPage, search);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const openEdit = (skill: Skill) => {
    setShowEdit({ open: true, skill });
    setEditName(skill.name);
  };

  const doEdit = async () => {
    const id = showEdit.skill?.id;
    if (!id) return;
    try {
      await updateSkill(id, { name: editName });
      toast.success("Skill updated");
      setShowEdit({ open: false });
      fetchData(currentPage, search);
    } catch {
      toast.error("Update failed");
    }
  };

  const doDelete = async () => {
    const id = showDelete.id;
    if (!id) return;
    try {
      await deleteSkill(id);
      toast.success("Skill deleted");
      setShowDelete({ open: false });
      fetchData(currentPage, search);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const doAdd = async () => {
    if (!addName.trim()) return toast.error("Name is required");
    try {
      await createSkill({ name: addName.trim() });
      toast.success("Skill created");
      setShowAdd(false);
      setAddName("");
      fetchData(1, search);
    } catch {
      toast.error("Failed to create skill");
    }
  };

  return (
    <>
      {/* Controls Header */}
      <GlassCard className="p-6">
        <form
          method="get"
          onSubmit={onSearchSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="inline-block h-2 w-2 rounded-full bg-blue-400 animate-pulse delay-150" />
              <span className="inline-block h-2 w-2 rounded-full bg-purple-400 animate-pulse delay-300" />
            </div>
            <h1 className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-2xl font-bold text-transparent">
              Skills
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage astrologer skills and availability
            </p>
          </div>

          <div className="flex gap-2">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by skill name…"
              className={cx(glass.input, "min-w-[240px]")}
            />
            <button type="submit" className={cx(glass.btn, glass.btnPrimary)}>Search</button>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={cx(glass.btn, glass.btnNeutral)}
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className={cx(glass.btn, glass.btnPrimary)}
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Table Card */}
      <GlassCard className="p-0 overflow-hidden">
        {/* Head strip */}
        <div className="px-6 pt-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Skills</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, edit, activate/deactivate, and remove skills.
          </p>
        </div>

        {/* Glass table header */}
        <div className="mt-4 grid grid-cols-12 gap-4 px-6 py-3 border-y border-white/30 bg-white/60 dark:bg-white/[0.06]">
          <div className="col-span-5 text-[12px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Name
          </div>
          <div className="col-span-3 text-[12px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Status
          </div>
          <div className="col-span-4 text-[12px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 text-right">
            Actions
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/30">
          {loading ? (
            <SkeletonRows />
          ) : rows.length ? (
            rows.map((s, idx) => (
              <div
                key={s.id}
                className={cx(
                  "grid grid-cols-12 items-center gap-4 px-6 py-3",
                  idx % 2 ? "bg-white/50 dark:bg-white/[0.03]" : "bg-transparent"
                )}
              >
                {/* Name */}
                <div className="col-span-5 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {s.name}
                </div>

                {/* Status */}
                <div className="col-span-3">
                  <StatusPill active={!!s.isActive} onToggle={() => toggleStatus(s.id, !!s.isActive)} />
                </div>

                {/* Actions (icon-only like your request on reviews page) */}
                <div className="col-span-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEdit(s)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 dark:bg-white/[0.06] border border-white/40 dark:border-white/10 text-blue-600 dark:text-blue-300 hover:bg-white/90 dark:hover:bg-white/[0.12] transition"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowDelete({ open: true, id: s.id })}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 dark:bg-white/[0.06] border border-white/40 dark:border-white/10 text-rose-600 dark:text-rose-300 hover:bg-white/90 dark:hover:bg-white/[0.12] transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-sm text-slate-600 dark:text-slate-400">
              🚫 No Skills found
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 pt-4 pb-6 flex justify-end gap-2 flex-wrap text-sm">
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              const isLast = pageNum === totalPages;
              const isCurrent = pageNum === currentPage;
              const shouldShow =
                pageNum <= 3 ||
                pageNum === totalPages ||
                pageNum === currentPage ||
                pageNum === currentPage - 1 ||
                pageNum === currentPage + 1;

              if (!shouldShow) {
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return (
                    <span key={i} className="px-2 text-slate-500">
                      …
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={i}
                  onClick={() => fetchData(pageNum, search)}
                  className={cx(
                    glass.btn,
                    isCurrent ? glass.btnPrimary : glass.btnNeutral
                  )}
                >
                  {isLast ? "Last" : pageNum}
                </button>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Delete Modal */}
      {showDelete.open && (
        <GlassModal
          title="Delete skill?"
          subtitle="This action cannot be undone."
          onClose={() => setShowDelete({ open: false })}
          footer={
            <>
              <button
                className={cx(glass.btn, glass.btnNeutral)}
                onClick={() => setShowDelete({ open: false })}
              >
                Cancel
              </button>
              <button
                className={cx(glass.btn, "bg-gradient-to-r from-rose-600 to-orange-600 text-white hover:from-rose-700 hover:to-orange-700")}
                onClick={doDelete}
              >
                Delete
              </button>
            </>
          }
        >
          <div className="text-sm text-slate-700 dark:text-slate-200">
            Are you sure you want to remove this skill? Users will no longer see it in forms or listings.
          </div>
        </GlassModal>
      )}

      {/* Edit Modal */}
      {showEdit.open && showEdit.skill && (
        <GlassModal
          title="✏️ Edit Skill"
          onClose={() => setShowEdit({ open: false })}
          wide
          footer={
            <>
              <button
                className={cx(glass.btn, glass.btnNeutral)}
                onClick={() => setShowEdit({ open: false })}
              >
                Cancel
              </button>
              <button
                className={cx(glass.btn, glass.btnPrimary)}
                onClick={doEdit}
              >
                Save Changes
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Name <span className="text-rose-500">*</span>
              </span>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Vedic Astrology"
                className={cx(glass.input, "w-full")}
              />
            </label>
          </div>
        </GlassModal>
      )}

      {/* Add Modal */}
      {showAdd && (
        <GlassModal
          title="➕ Add Skill"
          onClose={() => setShowAdd(false)}
          wide
          footer={
            <>
              <button
                className={cx(glass.btn, glass.btnNeutral)}
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
              <button
                className={cx(glass.btn, glass.btnPrimary)}
                onClick={doAdd}
              >
                Create Skill
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Name <span className="text-rose-500">*</span>
              </span>
              <input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Tarot Reading"
                className={cx(glass.input, "w-full")}
              />
            </label>
          </div>
        </GlassModal>
      )}
    </>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SkillsPage />
    </Suspense>
  );
}

function SkillsPage() {
  const sp = useSearchParams();
  const page = useMemo(() => parseInt(sp.get("page") || "1", 10), [sp]);
  const search = useMemo(() => sp.get("search") || "", [sp]);
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>
      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-8">
        <SkillsTable initialPage={page} initialSearch={search} />
      </div>
    </div>
  );
}