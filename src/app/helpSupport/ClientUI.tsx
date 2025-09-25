// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Plus, CheckSquare, Trash2, X } from "lucide-react";
// import toast from "react-hot-toast";
// import {
//   getHelpSupport,
//   addHelpSupport,
//   editHelpSupport,
//   deleteHelpSupport,
// } from "@/app/helpSupport/fetch";

// type Support = { id: number; name: string };

// export default function ClientUI({ initialSupports }: { initialSupports: Support[] }) {
//   const [loading, setLoading] = useState(false);
//   const [supports, setSupports] = useState<Support[]>(initialSupports);

//   const [addOpen, setAddOpen] = useState(false);
//   const [editOpen, setEditOpen] = useState<Support | null>(null);
//   const [deleteOpen, setDeleteOpen] = useState<Support | null>(null);

//   const [newName, setNewName] = useState("");
//   const [editName, setEditName] = useState("");

//   async function reload() {
//     try {
//       setLoading(true);
//       const res = await getHelpSupport();
//       // ✅ Handle both shapes here too
//       const rows: Support[] = Array.isArray(res) ? res : (res?.data ?? []);
//       setSupports(rows);
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to load Help Support");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function onAdd() {
//     if (!newName.trim()) return;
//     try {
//       const res = await addHelpSupport({ name: newName });
//       if (res?.success) {
//         toast.success("Help Support added");
//         setAddOpen(false);
//         setNewName("");
//         await reload();
//       } else {
//         toast.error(res?.message ?? "Failed to add");
//       }
//     } catch (e) {
//       console.error(e);
//       toast.error("Error while adding");
//     }
//   }

//   async function onEdit() {
//     if (!editOpen) return;
//     try {
//       const res = await editHelpSupport(editOpen.id, { name: editName });
//       if (res?.success) {
//         toast.success("Updated");
//         setEditOpen(null);
//         await reload();
//       } else {
//         toast.error(res?.message ?? "Failed to update");
//       }
//     } catch (e) {
//       console.error(e);
//       toast.error("Error while updating");
//     }
//   }

//   async function onDelete() {
//     if (!deleteOpen) return;
//     try {
//       const res = await deleteHelpSupport(deleteOpen.id);
//       if (res?.success) {
//         toast.success("Deleted");
//         setDeleteOpen(null);
//         await reload();
//       } else {
//         toast.error(res?.message ?? "Failed to delete");
//       }
//     } catch (e) {
//       console.error(e);
//       toast.error("Error while deleting");
//     }
//   }

//   return (
//     <>
//       {/* Add Help Support */}
//       <div className="flex justify-start">
//         <button
//           onClick={() => setAddOpen(true)}
//           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//         >
//           <Plus size={16} /> Add Help Support
//         </button>
//       </div>

//       {/* List */}
//       <div className="overflow-hidden rounded-xl border bg-white">
//         {loading ? (
//           <div className="p-6 text-sm text-slate-500">Loading...</div>
//         ) : supports.length === 0 ? (
//           <div className="p-6 text-sm text-slate-500">No records</div>
//         ) : (
//           <table className="w-full border-separate border-spacing-y-2">
//             <tbody>
//               {supports.map((s) => (
//                 <tr key={s.id} className="bg-white shadow-sm">
//                   <td className="p-4">
//                     <div className="flex items-center justify-between gap-4">
//                       <span className="font-medium">{s.name}</span>

//                       <div className="flex items-center gap-4">
//                         <Link
//                           href={`/helpSupport/help-support-sub-category/${s.id}`}
//                           className="text-green-600 hover:text-green-700"
//                         >
//                           View
//                         </Link>

//                         <button
//                           onClick={() => {
//                             setEditName(s.name);
//                             setEditOpen(s);
//                           }}
//                           className="flex items-center text-blue-600 hover:text-blue-700"
//                         >
//                           <CheckSquare className="w-4 h-4 mr-1" />
//                           Edit
//                         </button>

//                         <button
//                           onClick={() => setDeleteOpen(s)}
//                           className="flex items-center text-red-600 hover:text-red-700"
//                         >
//                           <Trash2 className="w-4 h-4 mr-1" />
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Add modal */}
//       {addOpen && (
//         <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
//           <div className="w-full max-w-md rounded-lg bg-white p-6">
//             <div className="mb-4 flex items-center justify-between">
//               <h2 className="text-lg font-semibold">Add Help Support</h2>
//               <button onClick={() => setAddOpen(false)}>
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//             <div className="space-y-3">
//               <label className="block text-sm">Title</label>
//               <input
//                 className="w-full rounded border p-2"
//                 value={newName}
//                 onChange={(e) => setNewName(e.target.value)}
//                 placeholder="Title"
//               />
//               <div className="mt-4 flex justify-end gap-2">
//                 <button
//                   onClick={() => setAddOpen(false)}
//                   className="rounded bg-gray-200 px-4 py-2"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={onAdd}
//                   className="rounded bg-blue-600 px-4 py-2 text-white"
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit modal */}
//       {editOpen && (
//         <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
//           <div className="w-full max-w-md rounded-lg bg-white p-6">
//             <div className="mb-4 flex items-center justify-between">
//               <h2 className="text-lg font-semibold">Edit Help Support</h2>
//               <button onClick={() => setEditOpen(null)}>
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <label className="block text-sm">Title</label>
//             <input
//               className="mt-1 w-full rounded border p-2"
//               value={editName}
//               onChange={(e) => setEditName(e.target.value)}
//             />

//             <div className="mt-4 flex justify-end gap-2">
//               <button
//                 onClick={() => setEditOpen(null)}
//                 className="rounded bg-gray-200 px-4 py-2"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={onEdit}
//                 className="rounded bg-blue-600 px-4 py-2 text-white"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete modal */}
//       {deleteOpen && (
//         <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
//           <div className="w-full max-w-md rounded-lg bg-white p-6">
//             <div className="mb-4 flex items-center justify-between">
//               <h2 className="text-lg font-semibold">Delete Help Support</h2>
//               <button onClick={() => setDeleteOpen(null)}>
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//             <p className="text-sm text-slate-600">
//               Are you sure you want to delete “{deleteOpen?.name}”? This will
//               also delete its subcategories.
//             </p>
//             <div className="mt-4 flex justify-end gap-2">
//               <button
//                 onClick={() => setDeleteOpen(null)}
//                 className="rounded bg-gray-200 px-4 py-2"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={onDelete}
//                 className="rounded bg-red-600 px-4 py-2 text-white"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Plus, Pencil, Trash2, X, Layers } from "lucide-react";
import toast from "react-hot-toast";

import {
  getHelpSupport,
  addHelpSupport,
  editHelpSupport,
  deleteHelpSupport,
} from "@/app/helpSupport/fetch";

type Support = { id: number; name: string };

/* ────────────────────────────────────────────────────────────────────────────
  Glass helpers
──────────────────────────────────────────────────────────────────────────── */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const glass = {
  surface:
    "relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 bg-white/70 " +
    "dark:bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] " +
    "dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition active:scale-[0.98]",
  primary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 " +
    "shadow-[0_8px_20px_rgba(59,130,246,0.25)]",
  neutral:
    "text-slate-700 dark:text-slate-300 bg-white/85 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white",
  input:
    "w-full rounded-xl border border-white/30 dark:border-white/10 bg-white/85 dark:bg-white/[0.06] " +
    "px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40",
};

/* ────────────────────────────────────────────────────────────────────────────
  Modal with body-scroll lock (portal)
──────────────────────────────────────────────────────────────────────────── */
function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useBodyLock(true);
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cx(glass.surface, "relative z-10 w-full max-w-md overflow-hidden")}>
        <div className="flex items-center justify-between border-b border-white/20 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-xl bg-white/70 dark:bg-white/[0.06] hover:bg-white/90"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-white/20 bg-white/50 dark:bg-white/[0.05] px-6 py-4">
          {footer}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ────────────────────────────────────────────────────────────────────────────
  Skeleton card
──────────────────────────────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className={cx(glass.surface, "p-5")}>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-2xl bg-slate-200/70 dark:bg-white/10 animate-pulse" />
        <div className="h-5 w-40 rounded bg-slate-200/70 dark:bg-white/10 animate-pulse" />
      </div>
      <div className="h-4 w-1/2 rounded bg-slate-200/60 dark:bg-white/5 animate-pulse" />
      <div className="mt-4 flex gap-2">
        <div className="h-9 w-20 rounded-xl bg-slate-200/70 dark:bg-white/10 animate-pulse" />
        <div className="h-9 w-9 rounded-xl bg-slate-200/70 dark:bg-white/10 animate-pulse" />
        <div className="h-9 w-9 rounded-xl bg-slate-200/70 dark:bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
  Main UI
──────────────────────────────────────────────────────────────────────────── */
export default function ClientUI({ initialSupports }: { initialSupports: Support[] }) {
  const [loading, setLoading] = useState(false);
  const [supports, setSupports] = useState<Support[]>(initialSupports);

  // modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<Support | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<Support | null>(null);

  // form state
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");

  async function reload() {
    try {
      setLoading(true);
      const res = await getHelpSupport();
      const rows: Support[] = Array.isArray(res) ? res : (res?.data ?? []);
      setSupports(rows);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load Help Support");
    } finally {
      setLoading(false);
    }
  }

  async function onAdd() {
    if (!newName.trim()) return;
    try {
      const res = await addHelpSupport({ name: newName });
      if (res?.success) {
        toast.success("Help Support added");
        setAddOpen(false);
        setNewName("");
        await reload();
      } else {
        toast.error(res?.message ?? "Failed to add");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error while adding");
    }
  }

  async function onEdit() {
    if (!editOpen) return;
    if (!editName.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      const res = await editHelpSupport(editOpen.id, { name: editName });
      if (res?.success) {
        toast.success("Updated");
        setEditOpen(null);
        await reload();
      } else {
        toast.error(res?.message ?? "Failed to update");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error while updating");
    }
  }

  async function onDelete() {
    if (!deleteOpen) return;
    try {
      const res = await deleteHelpSupport(deleteOpen.id);
      if (res?.success) {
        toast.success("Deleted");
        setDeleteOpen(null);
        await reload();
      } else {
        toast.error(res?.message ?? "Failed to delete");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error while deleting");
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className={cx(glass.surface, "px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between")}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 grid place-items-center rounded-2xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06]">
            <Layers className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Total topics: <span className="font-semibold text-slate-800 dark:text-slate-200">{supports.length}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Create, edit, and manage help sections</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setAddOpen(true)} className={cx(glass.btn, glass.primary)}>
            <Plus className="h-4 w-4" />
            Add Help Support
          </button>
        </div>
      </div>

      {/* List of supports (cards) */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : supports.length === 0 ? (
        <div className={cx(glass.surface, "p-10 text-center")}>
          <p className="text-slate-600 dark:text-slate-400">No records.</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Click “Add Help Support” to create your first topic.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {supports.map((s, i) => (
            <div key={s.id} className={cx(glass.surface, "p-5 transition hover:scale-[1.01]")}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">{s.name}</h3>
                  <div className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">ID: {s.id}</div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    href={`/helpSupport/help-support-sub-category/${s.id}`}
                    title="View Subcategories"
                    className={cx(glass.btn, glass.neutral)}
                  >
                    View
                  </Link>

                  <button
                    onClick={() => {
                      setEditName(s.name);
                      setEditOpen(s);
                    }}
                    title="Edit"
                    className="h-9 w-9 grid place-items-center rounded-xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white/90"
                  >
                    <Pencil className="h-4 w-4 text-blue-600" />
                  </button>

                  <button
                    onClick={() => setDeleteOpen(s)}
                    title="Delete"
                    className="h-9 w-9 grid place-items-center rounded-xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white/90"
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {addOpen && (
        <Modal
          title="➕ Add Help Support"
          onClose={() => setAddOpen(false)}
          footer={
            <>
              <button onClick={() => setAddOpen(false)} className={cx(glass.btn, glass.neutral)}>
                Cancel
              </button>
              <button onClick={onAdd} className={cx(glass.btn, glass.primary)}>
                Save
              </button>
            </>
          }
        >
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Title</span>
            <input
              className={glass.input}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Account & Billing"
            />
          </label>
        </Modal>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <Modal
          title="✏️ Edit Help Support"
          onClose={() => setEditOpen(null)}
          footer={
            <>
              <button onClick={() => setEditOpen(null)} className={cx(glass.btn, glass.neutral)}>
                Cancel
              </button>
              <button onClick={onEdit} className={cx(glass.btn, glass.primary)}>
                Save Changes
              </button>
            </>
          }
        >
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Title</span>
            <input
              className={glass.input}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Title"
            />
          </label>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteOpen && (
        <Modal
          title="Delete Help Support?"
          onClose={() => setDeleteOpen(null)}
          footer={
            <>
              <button onClick={() => setDeleteOpen(null)} className={cx(glass.btn, glass.neutral)}>
                Cancel
              </button>
              <button
                onClick={onDelete}
                className={cx(glass.btn, glass.primary, "from-rose-600 to-orange-600")}
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Are you sure you want to delete <span className="font-semibold">“{deleteOpen?.name}”</span>? This will also
            delete its subcategories.
          </p>
        </Modal>
      )}
    </div>
  );
}
