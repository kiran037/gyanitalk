"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import toast from "react-hot-toast";
import {
  getAstrologerCategories,
  createAstrologerCategory,
  updateAstrologerCategory,
  deleteAstrologerCategory,
  updateCategoriesStatus,
} from "@/app/astrologerCategories/fetch";
import { uploadImage } from "@/upload";
import { isValidImageUrl } from "@/components/functions";

/* ============================================================
   Helpers
============================================================ */
const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

const glass = {
  surface:
    "relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl " +
    "shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-[0_8px_20px_rgba(59,130,246,0.25)]",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white",
  chip: "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border",
};

/* ============================================================
   Types
============================================================ */
type AstrologerCategory = {
  id: number;
  name: string;
  image: string | null;
  isActive: boolean;
};

/* ============================================================
   Status Pill
============================================================ */
function StatusPill({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cx(
        glass.chip,
        active
          ? "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40"
          : "bg-rose-100/70 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40"
      )}
    >
      <span
        className={cx(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-rose-500"
        )}
      />
      {active ? "Active" : "Inactive"}
    </button>
  );
}

/* ============================================================
   Glass Modal
============================================================ */
function GlassModal({
  title,
  children,
  onClose,
  footer,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cx(
          glass.surface,
          "relative z-10 w-full",
          wide ? "max-w-2xl" : "max-w-lg"
        )}
      >
        <div className="flex items-start justify-between border-b border-white/20 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/70 dark:bg-white/[0.06] hover:bg-white/90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-white/20 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}



/* ============================================================
   Page
============================================================ */
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AstrologerCategoriesPage />
    </Suspense>
  );
}


function AstrologerCategoriesPage() {
  const params = useSearchParams();
  const page = parseInt(params.get("page") || "1", 10);
  const search = params.get("search") || "";

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<AstrologerCategory[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<{ open: boolean; cat?: AstrologerCategory }>({ open: false });
  const [showDelete, setShowDelete] = useState<{ open: boolean; id?: number }>({ open: false });

  const [addName, setAddName] = useState("");
  const [addFile, setAddFile] = useState<File | null>(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);

  /* ---------- Fetch ---------- */
  const load = async () => {
    try {
      setLoading(true);
      const res = await getAstrologerCategories({ page, limit: 15, search });
      setCategories(res.astrologer_categories || []);
      setTotalPages(res.totalPages || 1);
      setCurrentPage(res.currentPage || page);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search]);

  /* ---------- Add ---------- */
  const onAdd = async () => {
    try {
      let payload: any = { name: addName };
      if (addFile) {
        const up = await uploadImage(addFile, "images");
        if (!up?.success) return toast.error("Image upload failed");
        payload.image = up.path;
      }
      await createAstrologerCategory(payload);
      toast.success("Category created");
      setShowAdd(false);
      setAddName("");
      setAddFile(null);
      load();
    } catch {
      toast.error("Failed to create");
    }
  };

  /* ---------- Edit ---------- */
  const openEdit = (cat: AstrologerCategory) => {
    setShowEdit({ open: true, cat });
    setEditName(cat.name);
  };
  const onEditSave = async () => {
    if (!showEdit.cat) return;
    try {
      let payload: any = { name: editName };
      if (editFile) {
        const up = await uploadImage(editFile, "images");
        if (!up?.success) return toast.error("Image upload failed");
        payload.image = up.path;
      }
      await updateAstrologerCategory(showEdit.cat.id, payload);
      toast.success("Category updated");
      setShowEdit({ open: false });
      load();
    } catch {
      toast.error("Failed to update");
    }
  };

  /* ---------- Delete ---------- */
  const onDelete = async () => {
    if (!showDelete.id) return;
    try {
      await deleteAstrologerCategory(showDelete.id);
      toast.success("Category deleted");
      setShowDelete({ open: false });
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  /* ---------- Toggle ---------- */
  const toggleStatus = async (id: number, current: boolean) => {
    try {
      await updateCategoriesStatus(id, !current);
      toast.success("Status updated");
      load();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto p-6 space-y-8">
        <Breadcrumb pageName="Astrologer Category" />

        {/* Header */}
        <div className={cx(glass.surface, "p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4")}>
          <form method="get" className="flex gap-2">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search category…"
              className="rounded-xl border border-white/30 bg-white/85 dark:bg-white/[0.06] px-4 py-2 text-sm"
            />
            <button type="submit" className={cx(glass.btn, glass.btnPrimary)}>Search</button>
          </form>
          <button
            onClick={() => setShowAdd(true)}
            className={cx(glass.btn, glass.btnPrimary)}
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>

        {/* Table */}
        <div className={cx(glass.surface, "overflow-hidden")}>
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/20 bg-white/50 dark:bg-white/[0.06]">
            <div className="col-span-3 text-xs font-semibold uppercase">Image</div>
            <div className="col-span-4 text-xs font-semibold uppercase">Name</div>
            <div className="col-span-3 text-xs font-semibold uppercase">Status</div>
            <div className="col-span-2 text-xs font-semibold uppercase text-right">Actions</div>
          </div>

          {loading ? (
            <div className="p-6 text-slate-500">Loading…</div>
          ) : categories.length ? (
            categories.map((cat, i) => (
              <div
                key={cat.id}
                className={cx(
                  "grid grid-cols-12 items-center gap-4 px-6 py-4",
                  i % 2 ? "bg-white/50 dark:bg-white/[0.04]" : ""
                )}
              >
                {/* Image */}
                <div className="col-span-3">
                  <Image
                    src={
                      cat.image && isValidImageUrl(cat.image)
                        ? `${process.env.NEXT_PUBLIC_BASEURL}${cat.image}`
                        : "https://gyanitalk.com/build/assets/images/person.png"
                    }
                    alt="Category"
                    width={40}
                    height={40}
                    className="rounded-full object-cover ring-2 ring-white/50"
                  />
                </div>
                {/* Name */}
                <div className="col-span-4 font-medium">{cat.name}</div>
                {/* Status */}
                <div className="col-span-3">
                  <StatusPill
                    active={!!cat.isActive}
                    onToggle={() => toggleStatus(cat.id, !!cat.isActive)}
                  />
                </div>
                {/* Actions */}
                <div className="col-span-2 flex justify-end gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/70 dark:bg-white/[0.06] hover:bg-white/90"
                  >
                    <Pencil className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => setShowDelete({ open: true, id: cat.id })}
                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/70 dark:bg-white/[0.06] hover:bg-white/90"
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500">🚫 No categories found</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end gap-2">
            {Array.from({ length: totalPages }, (_, i) => {
              const num = i + 1;
              const isCurrent = num === currentPage;
              return (
                <a
                  key={num}
                  href={`?page=${num}${search ? `&search=${search}` : ""}`}
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

        {/* Add Modal */}
        {showAdd && (
          <GlassModal
            title="➕ Add Astrologer Category"
            onClose={() => setShowAdd(false)}
            footer={
              <>
                <button
                  className={cx(glass.btn, glass.btnNeutral)}
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>
                <button className={cx(glass.btn, glass.btnPrimary)} onClick={onAdd}>
                  Create
                </button>
              </>
            }
          >
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white/85 dark:bg-white/[0.06] px-4 py-2 text-sm mb-4"
            />
            <label className="block text-sm font-medium mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAddFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
          </GlassModal>
        )}

        {/* Edit Modal */}
        {showEdit.open && showEdit.cat && (
          <GlassModal
            title="✏️ Edit Astrologer Category"
            onClose={() => setShowEdit({ open: false })}
            footer={
              <>
                <button
                  className={cx(glass.btn, glass.btnNeutral)}
                  onClick={() => setShowEdit({ open: false })}
                >
                  Cancel
                </button>
                <button className={cx(glass.btn, glass.btnPrimary)} onClick={onEditSave}>
                  Save
                </button>
              </>
            }
          >
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white/85 dark:bg-white/[0.06] px-4 py-2 text-sm mb-4"
            />
            <label className="block text-sm font-medium mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
          </GlassModal>
        )}

        {/* Delete Modal */}
        {showDelete.open && (
          <GlassModal
            title="Delete Category"
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
                  className={cx(glass.btn, "bg-gradient-to-r from-rose-600 to-orange-600 text-white")}
                  onClick={onDelete}
                >
                  Delete
                </button>
              </>
            }
          >
            <p className="text-sm text-slate-700 dark:text-slate-200">
              Are you sure you want to delete this astrologer category? This action cannot be undone.
            </p>
          </GlassModal>
        )}
      </div>
    </div>
  );
}
