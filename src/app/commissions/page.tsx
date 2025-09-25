
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { Plus, Pencil } from "lucide-react";

import { useToast } from "@/components/Toast/ToastProvider";
import {
  getCommissions,
  createCommission,
  updateCommission,
} from "@/app/commissions/fetch";

/* ---------------- Helpers ---------------- */
const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

const glass = {
  surface:
    "relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl " +
    "shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
  header:
    "flex items-center justify-between px-6 py-4 border-b border-white/20 " +
    "bg-gradient-to-r from-white/60 to-white/40 dark:from-white/[0.06] dark:to-white/[0.04]",
  thRow:
    "grid grid-cols-12 gap-4 px-6 py-3 bg-white/60 dark:bg-white/[0.06] " +
    "text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300",
  tdRow: "grid grid-cols-12 items-center gap-4 px-6 py-4",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-[0_8px_20px_rgba(59,130,246,0.25)]",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white/90",
};

/* ---------------- Types ---------------- */
interface Commission {
  id: number;
  astrologerId: number;
  commissionTypeId: number;
  commission: number;
  astrologerName: string;
  commissionType: string;
}
interface CommissionType {
  id: number;
  name: string;
}
interface Astrologer {
  id: number;
  name: string;
  contactNo: string;
}

/* ---------------- Glass Modal (Portal + scroll lock) ---------------- */
function GlassModal({
  title,
  children,
  onClose,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // lock body scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cx(glass.surface, "relative z-10 w-full max-w-2xl")}>
        <div className="flex items-start justify-between border-b border-white/20 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/70 dark:bg-white/[0.06] hover:bg-white/90"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-white/20 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ---------------- Table ---------------- */
function CommissionsTable({ page }: { page: number }) {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [commissionList, setCommissionList] = useState<Commission[]>([]);
  const [commissionTypes, setCommissionTypes] = useState<CommissionType[]>([]);
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);

  // modal
  const [showModal, setShowModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Commission | null>(null);

  // form state
  const [commissionTypeId, setCommissionTypeId] = useState<number>(0);
  const [astrologerId, setAstrologerId] = useState<number>(0);
  const [commissionValue, setCommissionValue] = useState<number | string>("");

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const res = await getCommissions({ page: p, limit: 15 });
      setCommissionList(res.commissions || []);
      setCommissionTypes(res.commissionTypes || []);
      setAstrologers(res.astrologers || []);
      setTotalPages(res.totalPages || 1);
      setCurrentPage(res.currentPage || p);
    } catch {
      toast("error", "Error", "Failed to load commissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const resetForm = () => {
    setEditing(null);
    setCommissionTypeId(0);
    setAstrologerId(0);
    setCommissionValue("");
  };

  const onSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!commissionTypeId || !astrologerId || commissionValue === "") {
      toast("warning", "Missing fields", "Please fill all fields.");
      return;
    }

    try {
      if (editing) {
        await updateCommission(editing.id, {
          commissionTypeId,
          astrologerId,
          commission: Number(commissionValue),
        });
        toast("success", "Updated", "Commission updated successfully.");
      } else {
        await createCommission({
          commissionTypeId,
          astrologerId,
          commission: Number(commissionValue),
        });
        toast("success", "Created", "Commission added successfully.");
      }
      setShowModal(null);
      resetForm();
      fetchData(currentPage);
    } catch {
      toast("error", "Error", "Failed to save commission.");
    }
  };

  return (
    <div className={cx(glass.surface, "overflow-hidden")}>
      {/* Header */}
      <div className={glass.header}>
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            Commissions
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Manage astrologer commission mappings.
          </p>
        </div>
        <button
          onClick={() => setShowModal("add")}
          className={cx(glass.btn, glass.btnPrimary)}
        >
          <Plus className="h-4 w-4" /> Add Commission
        </button>
      </div>

      {/* Head row */}
      <div className={glass.thRow}>
        <div className="col-span-3">Commission Type</div>
        <div className="col-span-5">Astrologer</div>
        <div className="col-span-2">Commission</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Body */}
      <div className="divide-y divide-white/20">
        {loading ? (
          <div className="p-6 text-slate-500">Loading…</div>
        ) : commissionList.length ? (
          commissionList.map((c, i) => (
            <div
              key={c.id}
              className={cx(
                glass.tdRow,
                i % 2 === 1 ? "bg-white/55 dark:bg-white/[0.04]" : undefined
              )}
            >
              <div className="col-span-3 text-slate-800 dark:text-slate-200">
                {c.commissionType}
              </div>
              <div className="col-span-5">
                <div className="font-medium text-slate-900 dark:text-white">
                  {c.astrologerName}
                </div>
              </div>
              <div className="col-span-2 text-slate-800 dark:text-slate-200">
                {c.commission}%
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={() => {
                    setEditing(c);
                    setCommissionTypeId(c.commissionTypeId);
                    setAstrologerId(c.astrologerId);
                    setCommissionValue(c.commission);
                    setShowModal("edit");
                  }}
                  className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white/90 transition"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-600 dark:text-slate-400">
            No commissions found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 p-4">
          {Array.from({ length: totalPages }, (_, i) => {
            const num = i + 1;
            const isCurrent = num === currentPage;
            return (
              <a
                key={num}
                href={`?page=${num}`}
                className={cx(
                  glass.btn,
                  isCurrent ? glass.btnPrimary : glass.btnNeutral
                )}
              >
                {num}
              </a>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <GlassModal
          title={showModal === "edit" ? "✏️ Edit Commission" : "Add Commission"}
          onClose={() => {
            setShowModal(null);
            resetForm();
          }}
          footer={
            <>
              <button
                onClick={() => {
                  setShowModal(null);
                  resetForm();
                }}
                className={cx(glass.btn, glass.btnNeutral)}
              >
                Cancel
              </button>
              <button
                onClick={() => onSubmit()}
                className={cx(glass.btn, glass.btnPrimary)}
              >
                {showModal === "edit" ? "Save Changes" : "Add"}
              </button>
            </>
          }
        >
          <form onSubmit={onSubmit} className="grid gap-4">

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Commission Type
              </span>
              <select
                value={commissionTypeId}
                onChange={(e) => setCommissionTypeId(Number(e.target.value))}
                className="w-full rounded-xl border border-white/30 bg-white/85 dark:bg-white/[0.06] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="">-- Select --</option>
                {commissionTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Astrologer */}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Astrologer
              </span>
              <select
                value={astrologerId}
                onChange={(e) => setAstrologerId(Number(e.target.value))}
                className="w-full rounded-xl border border-white/30 bg-white/85 dark:bg-white/[0.06] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="">-- Select --</option>
                {astrologers.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} - {a.contactNo}
                  </option>
                ))}
              </select>
            </label>

            {/* Commission (%) */}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Commission (%)
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={commissionValue}
                onChange={(e) => setCommissionValue(Number(e.target.value))}
                placeholder="e.g. 15"
                className="w-full rounded-xl border border-white/30 bg-white/85 dark:bg-white/[0.06] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </label>
          </form>
        </GlassModal>
      )}
    </div>
  );
}

/* ---------------- Page Wrapper ---------------- */
export default function Page() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-8">
        {/* Title bar */}
        <div className={cx(glass.surface, "px-6 py-5")}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Commissions
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Configure commission rates for astrologers.
          </p>
        </div>

        <CommissionsTable page={page} />
      </div>
    </div>
  );
}
