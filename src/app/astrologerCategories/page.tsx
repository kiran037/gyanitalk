
// "use client";

// import React, { useEffect, useState, useTransition } from "react";
// import Image from "next/image";
// import { useSearchParams } from "next/navigation";
// import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
// import { Switch } from "@/components/FormElements/switch";
// import { Skeleton } from "@/components/ui-elements/skeleton";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui-elements/table";
// import { cn } from "@/lib/utils";
// import { uploadImage } from "@/upload";
// import toast from "react-hot-toast";
// import { Plus, CheckSquare } from "lucide-react";
// import {
//   getAstrologerCategories,
//   createAstrologerCategory,
//   updateAstrologerCategory,
//   deleteAstrologerCategory,
//   updateCategoriesStatus,
// } from "@/app/astrologerCategories/fetch";
// import { isValidImageUrl } from "@/components/functions";

// /* =========================
//    Inline Skeleton
//    ========================= */
// function AstrologerCategoriesSkeleton() {
//   return (
//     <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
//       <h2 className="px-4 py-6 text-2xl font-bold text-dark dark:text-white md:px-6 xl:px-9">
//         Astrologer Category
//       </h2>
//       <Table>
//         <TableHeader>
//           <TableRow className="border-t text-base [&>th]:h-auto [&>th]:py-3 sm:[&>th]:py-4.5">
//             <TableHead className="min-w-[120px]">IMAGE</TableHead>
//             <TableHead>NAME</TableHead>
//             <TableHead>STATUS</TableHead>
//             <TableHead>ACTIONS</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {Array.from({ length: 5 }).map((_, i) => (
//             <TableRow key={i}>
//               <TableCell colSpan={100}>
//                 <Skeleton className="h-8" />
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }

// /* =========================
//    Inline Toggle (no className prop)
//    ========================= */
// function CategoriesStatusToggle({ id, status }: { id: number; status: boolean }) {
//   const [checked, setChecked] = useState<boolean>(!!status);
//   const [isPending, startTransition] = useTransition();

//   useEffect(() => setChecked(!!status), [status]);

//   const toggleLiveStatus = async (newValue: boolean) => {
//     setChecked(newValue);
//     const res = await updateCategoriesStatus(id, newValue);
//     if (res.success) {
//       toast.success("Status updated successfully");
//     } else {
//       toast.error("Failed to update status");
//       setChecked(!newValue);
//     }
//   };

//   return (
//     <Switch
//       checked={checked}
//       onCheckedChange={(val) =>
//         startTransition(() => {
//           toggleLiveStatus(val);
//         })
//       }
//       withIcon
//       background="light"
//     />
//   );
// }

// /* =========================
//    Main Page Component (client)
//    ========================= */
// type AstrologerCategory = {
//   id: number;
//   name: string;
//   image: string | null;
//   isActive: boolean;
//   isDelete: boolean;
// };

// export default function AstrologerCategoriesPage() {
//   const params = useSearchParams();
//   const page = parseInt(params.get("page") || "1", 10);
//   const search = params.get("search") || "";

//   const [loading, setLoading] = useState(true);
//   const [categories, setCategories] = useState<AstrologerCategory[]>([]);
//   const [totalPages, setTotalPages] = useState(1);
//   const [currentPage, setCurrentPage] = useState(page);

//   // Modals & forms
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [addFormData, setAddFormData] = useState<{ name: string; image: File | null }>({
//     name: "",
//     image: null,
//   });
//   const [addImagePreview, setAddImagePreview] = useState<string | null>(null);

//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editing, setEditing] = useState<AstrologerCategory | null>(null);
//   const [formData, setFormData] = useState<{ name: string; image?: File | string | null }>({
//     name: "",
//     image: null,
//   });
//   const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedId, setSelectedId] = useState<number | null>(null);

//   // Fetch list
//   const load = async () => {
//     try {
//       setLoading(true);
//       const res = await getAstrologerCategories({ page, limit: 15, search });
//       setCategories(res.astrologer_categories || []);
//       setTotalPages(res.totalPages || 1);
//       setCurrentPage(res.currentPage || page);
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to load categories");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, search]);

//   /* ---------- Add ---------- */
//   const onAdd = async () => {
//     try {
//       let payload: any = { name: addFormData.name };

//       if (addFormData.image instanceof File) {
//         const up = await uploadImage(addFormData.image, "images");
//         if (!up?.success || !up.path) {
//           toast.error("Image upload failed");
//           return;
//         }
//         payload.image = up.path;
//       }

//       const res = await createAstrologerCategory(payload);
//       if (res?.success) {
//         toast.success("Astrologer category created");
//         setShowAddModal(false);
//         setAddFormData({ name: "", image: null });
//         setAddImagePreview(null);
//         load();
//       } else {
//         toast.error(res?.message || "Failed to create");
//       }
//     } catch (e) {
//       console.error(e);
//       toast.error("Something went wrong");
//     }
//   };

//   /* ---------- Edit ---------- */
//   const openEdit = (item: AstrologerCategory) => {
//     setEditing(item);
//     setFormData({ name: item.name, image: item.image || null });
//     setEditImagePreview(
//       item.image && isValidImageUrl(item.image)
//         ? `${process.env.NEXT_PUBLIC_BASEURL}${item.image}`
//         : null
//     );
//     setShowEditModal(true);
//   };

//   const onEditSave = async () => {
//     if (!editing) return;
//     try {
//       let payload: any = { name: formData.name };

//       if (formData.image instanceof File) {
//         const up = await uploadImage(formData.image, "images");
//         if (!up?.success || !up.path) {
//           toast.error("Image upload failed");
//           return;
//         }
//         payload.image = up.path;
//       } else if (typeof formData.image === "string") {
//         // unchanged string path -> keep it
//         payload.image = formData.image;
//       }

//       const res = await updateAstrologerCategory(editing.id, payload);
//       if (res?.success) {
//         toast.success("Category updated");
//         setShowEditModal(false);
//         setEditing(null);
//         setEditImagePreview(null);
//         load();
//       } else {
//         toast.error("Update failed");
//       }
//     } catch (e) {
//       console.error(e);
//       toast.error("Something went wrong");
//     }
//   };

//   /* ---------- Delete ---------- */
//   const onDelete = async () => {
//     if (!selectedId) return;
//     try {
//       const res = await deleteAstrologerCategory(selectedId);
//       if (res?.success) {
//         toast.success("Category deleted");
//         setShowDeleteModal(false);
//         setSelectedId(null);
//         load();
//       } else {
//         toast.error("Delete failed");
//       }
//     } catch (e) {
//       console.error(e);
//       toast.error("Something went wrong");
//     }
//   };

//   return (
//     <div className="space-y-10">
//       <Breadcrumb pageName="Astrologer Category" />

//       {/* Search Form */}
//       <form method="get" className="flex gap-2">
//         <input
//           name="search"
//           defaultValue={search}
//           placeholder="Search by name"
//           className="min-w-[250px] rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
//         />
//         <button type="submit" className="bg-primary px-4 py-2 text-white rounded">
//           Search
//         </button>
//       </form>

//       {/* Add button */}
//       <div className="flex justify-end">
//         <button
//           onClick={() => {
//             setAddFormData({ name: "", image: null });
//             setAddImagePreview(null);
//             setShowAddModal(true);
//           }}
//           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//         >
//           <Plus size={16} /> Add Astrologer Category
//         </button>
//       </div>

//       {/* Content */}
//       {loading ? (
//         <AstrologerCategoriesSkeleton />
//       ) : (
//         <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="text-center">IMAGE</TableHead>
//                 <TableHead className="text-center">NAME</TableHead>
//                 <TableHead className="text-center">STATUS</TableHead>
//                 <TableHead className="text-center">ACTIONS</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {categories.map((item) => (
//                 <TableRow key={item.id}>
//                   {/* Image */}
//                   <TableCell>
//                     <div className="flex items-center justify-center gap-3">
//                       <Image
//                         src={
//                           item?.image && isValidImageUrl(item.image)
//                             ? `${process.env.NEXT_PUBLIC_BASEURL}${item.image}`
//                             : "https://gyanitalk.com/build/assets/images/person.png"
//                         }
//                         className="rounded-full object-cover"
//                         width={40}
//                         height={40}
//                         alt="Category Image"
//                       />
//                     </div>
//                   </TableCell>

//                   {/* Name */}
//                   <TableCell className="text-center font-medium">{item.name || "-"}</TableCell>

//                   {/* Toggle */}
//                   <TableCell className="text-center">
//                     <div className="flex justify-center items-center w-full">
//                       <CategoriesStatusToggle id={item.id} status={!!item.isActive} />
//                     </div>
//                   </TableCell>

//                   {/* Actions */}
//                   <TableCell className="text-center">
//                     <div className="flex justify-center items-center">
//                       <button
//                         onClick={() => openEdit(item)}
//                         className="flex items-center mr-3 text-blue-600 hover:text-blue-700"
//                       >
//                         <CheckSquare className="w-4 h-4 mr-1" />
//                         Edit
//                       </button>
//                       {/* If you need delete: */}
//                       {/* <button
//                         onClick={() => {
//                           setSelectedId(item.id);
//                           setShowDeleteModal(true);
//                         }}
//                         className="flex items-center text-red-600 hover:text-red-700"
//                       >
//                         <Trash2 className="w-4 h-4 mr-1" />
//                         Delete
//                       </button> */}
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}

//               {categories.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={8}>
//                     <div className="text-center py-6 text-gray-500">🚫 No Astrologer Category found</div>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>

//           {/* Pagination */}
//           <div className="mt-6 flex justify-end gap-2 flex-wrap text-sm">
//             {Array.from({ length: totalPages }, (_, i) => {
//               const pageNum = i + 1;
//               const isLast = pageNum === totalPages;
//               const isCurrent = pageNum === currentPage;
//               const shouldShow =
//                 pageNum <= 3 ||
//                 pageNum === totalPages ||
//                 pageNum === currentPage ||
//                 pageNum === currentPage - 1 ||
//                 pageNum === currentPage + 1;

//               if (!shouldShow) {
//                 if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
//                   return <span key={i}>...</span>;
//                 }
//                 return null;
//               }

//               return (
//                 <a
//                   key={i}
//                   href={`?page=${pageNum}${search ? `&search=${search}` : ""}`}
//                   className={cn(
//                     "px-3 py-1 border rounded",
//                     isCurrent ? "bg-primary text-white" : "bg-white text-black dark:bg-dark dark:text-white"
//                   )}
//                 >
//                   {isLast ? "Last" : pageNum}
//                 </a>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Add Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
//             <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3">
//               ➕ Add Astrologer Category
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
//                 <input
//                   type="text"
//                   value={addFormData.name}
//                   onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
//                 />
//               </div>

//               {/* Image */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Category Image
//                 </label>
//                 {addImagePreview && (
//                   <img src={addImagePreview} alt="Preview" className="w-24 h-24 rounded object-cover mb-2 border" />
//                 )}
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0] || null;
//                     setAddFormData({ ...addFormData, image: file });
//                     setAddImagePreview(file ? URL.createObjectURL(file) : null);
//                   }}
//                   className="w-full text-sm text-gray-700 dark:text-gray-300"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 mt-6">
//               <button
//                 onClick={() => {
//                   setShowAddModal(false);
//                   setAddImagePreview(null);
//                 }}
//                 className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
//               >
//                 Cancel
//               </button>
//               <button onClick={onAdd} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//                 Add Astrologer Category
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Modal */}
//       {showEditModal && editing && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
//             <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3">
//               ✏️ Edit Astrologer Category
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
//                 />
//               </div>

//               {/* Image */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Category Image
//                 </label>
//                 {editImagePreview && (
//                   <img src={editImagePreview} alt="Preview" className="w-24 h-24 rounded object-cover mb-2 border" />
//                 )}
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0] || null;
//                     setFormData({ ...formData, image: file ?? formData.image ?? null });
//                     setEditImagePreview(file ? URL.createObjectURL(file) : editImagePreview);
//                   }}
//                   className="w-full text-sm text-gray-700 dark:text-gray-300"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 mt-6">
//               <button
//                 onClick={() => {
//                   setShowEditModal(false);
//                   setEditing(null);
//                   setEditImagePreview(null);
//                 }}
//                 className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
//               >
//                 Cancel
//               </button>
//               <button onClick={onEditSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Modal (optional; currently not shown via UI button) */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
//             <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Delete Category</h2>
//             <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
//               Are you sure you want to delete this record? This action cannot be undone.
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setShowDeleteModal(false)}
//                 className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
//               >
//                 Cancel
//               </button>
//               <button onClick={onDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import React, { useEffect, useState } from "react";
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
export default function AstrologerCategoriesPage() {
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
