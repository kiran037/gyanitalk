

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { createPortal } from "react-dom";
// import Select from "react-select";
// import {
//   getGroupAstrologer,
//   getAstrologersByGroup,
//   removeAstrologerFromGroup,
//   addAstrologerGroup,
//   editAstrologerGroup,
//   getAstrologerlist,
//   assignAstroToGroup,
// } from "./fetch";
// import {
//   FiUsers,
//   FiPlus,
//   FiEdit,
//   FiTrash,
//   FiX,
//   FiCheck,
// } from "react-icons/fi";
// import { cn } from "@/lib/utils";

// /* =================================================================================
//    Theme helpers (keep the same vibe)
// ================================================================================= */
// const cx = (...c: Array<string | false | null | undefined>) =>
//   c.filter(Boolean).join(" ");

// const glass = {
//   surface:
//     "relative overflow-visible rounded-2xl border border-white/30 dark:border-white/10 " +
//     "bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_28px_rgba(0,0,0,0.08)] " +
//     "dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
//   input:
//     "rounded-xl border border-white/30 dark:border-white/10 bg-white/85 dark:bg-white/[0.06] " +
//     "px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40",
//   btn:
//     "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition active:scale-[0.98]",
//   btnPrimary:
//     "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
//   btnNeutral:
//     "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white dark:hover:bg-white/10",
// };

// /* =================================================================================
//    Types
// ================================================================================= */
// type GroupItem = {
//   id: number;
//   name: string | null;
//   created_at?: string | Date | null;
//   updated_at?: string | Date | null;
//   astrologerassign_count?: number;
// };

// type AstroRow = {
//   id: number;
//   group_id: number;
//   astrologer_id: number;
//   astrologer_name: string;
//   index: number;
// };

// /* =================================================================================
//    Modal via Portal (always on top)
// ================================================================================= */
// function useMounted() {
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);
//   return mounted;
// }
// function Modal({
//   children,
//   title,
//   onClose,
// }: {
//   children: React.ReactNode;
//   title: string;
//   onClose: () => void;
// }) {
//   const mounted = useMounted();
//   if (!mounted) return null;
//   return createPortal(
//     <div
//       className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
//       role="dialog"
//       aria-modal="true"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/70 dark:border-white/10">
//         <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70 dark:border-white/10">
//           <h2 className="text-base font-semibold text-slate-900 dark:text-white">
//             {title}
//           </h2>
//           <button
//             onClick={onClose}
//             className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
//             aria-label="Close modal"
//           >
//             ✕
//           </button>
//         </div>
//         <div className="p-5">{children}</div>
//       </div>
//     </div>,
//     document.body
//   );
// }

// /* =================================================================================
//    Left Pane: Groups list (search + add + pagination)
// ================================================================================= */
// function GroupsPane({
//   selectedId,
//   onSelect,
//   onOpenAdd,
//   page,
//   setPage,
//   search,
//   setSearch,
//   refreshToken,
// }: {
//   selectedId: number | null;
//   onSelect: (id: number) => void;
//   onOpenAdd: () => void;
//   page: number;
//   setPage: (n: number) => void;
//   search: string;
//   setSearch: (s: string) => void;
//   refreshToken: number; // bump to refetch after create/edit/remove/assign
// }) {
//   const [rows, setRows] = useState<GroupItem[]>([]);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);

//   // fetch page of groups
//   useEffect(() => {
//     let ok = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await getGroupAstrologer({ page, limit: 15, search });
//         if (!ok) return;
//         setRows(res.groups || []);
//         setTotalPages(res.totalPages || 1);
//       } finally {
//         if (ok) setLoading(false);
//       }
//     })();
//     return () => {
//       ok = false;
//     };
//   }, [page, search, refreshToken]);

//   return (
//     <div className={glass.surface + " overflow-hidden"}>
//       {/* Header */}
//       <div className="p-5 border-b border-white/30 dark:border-white/10 bg-gradient-to-r from-white/60 to-white/30 dark:from-white/[0.06] dark:to-white/[0.04]">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow">
//               <FiUsers className="h-6 w-6 text-white" />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
//                 Groups ({rows.length})
//               </h2>
//               <p className="text-xs text-slate-600 dark:text-slate-400">
//                 Select a group to manage astrologers
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onOpenAdd}
//             className={cx(glass.btn, glass.btnPrimary, "px-4")}
//           >
//             <FiPlus className="h-4 w-4" />
//             Add Group
//           </button>
//         </div>

//         {/* Search */}
//         <form
//           className="mt-4 flex items-center gap-2"
//           onSubmit={(e) => {
//             e.preventDefault();
//             setPage(1);
//           }}
//         >
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search groups"
//             className={cx(glass.input, "w-full")}
//           />
//           <button className={cx(glass.btn, glass.btnPrimary)}>Search</button>
//           {search && (
//             <button
//               type="button"
//               onClick={() => {
//                 setSearch("");
//                 setPage(1);
//               }}
//               className={cx(glass.btn, glass.btnNeutral)}
//             >
//               Clear
//             </button>
//           )}
//         </form>
//       </div>

//       {/* List */}
//       <div className="max-h-[560px] overflow-auto divide-y divide-white/30 dark:divide-white/10">
//         {loading ? (
//           <div className="p-6 text-center text-slate-600 dark:text-slate-300">
//             Loading…
//           </div>
//         ) : rows.length === 0 ? (
//           <div className="p-6 text-center text-slate-600 dark:text-slate-300">
//             No groups found
//           </div>
//         ) : (
//           rows.map((g) => {
//             const active = selectedId === g.id;
//             return (
//               <button
//                 key={g.id}
//                 onClick={() => onSelect(g.id)}
//                 className={cn(
//                   "w-full text-left p-4 transition-colors",
//                   active
//                     ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-l-4 border-indigo-500"
//                     : "hover:bg-white/60 dark:hover:bg-white/[0.06]"
//                 )}
//               >
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <div className="flex items-center gap-2">
//                       <span className="font-semibold text-slate-900 dark:text-white">
//                         {g.name || "-"}
//                       </span>
//                     </div>
//                     <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
//                       {g.astrologerassign_count ?? 0} astrologer
//                       {(g.astrologerassign_count ?? 0) === 1 ? "" : "s"}
//                     </div>
//                   </div>
//                   <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-200">
//                     {g.astrologerassign_count ?? 0}
//                   </span>
//                 </div>
//               </button>
//             );
//           })
//         )}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="p-4 flex items-center justify-between">
//           <button
//             disabled={page <= 1}
//             onClick={() => setPage(Math.max(1, page - 1))}
//             className={cx(glass.btn, glass.btnNeutral, page <= 1 && "opacity-50")}
//           >
//             Prev
//           </button>
//           <div className="text-xs text-slate-600 dark:text-slate-400">
//             Page {page} of {totalPages}
//           </div>
//           <button
//             disabled={page >= totalPages}
//             onClick={() => setPage(Math.min(totalPages, page + 1))}
//             className={cx(
//               glass.btn,
//               glass.btnNeutral,
//               page >= totalPages && "opacity-50"
//             )}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* =================================================================================
//    Right Pane: Group details (edit + assign + list)
// ================================================================================= */
// function GroupDetailPane({
//   groupId,
//   onEdited,
//   onAssigned,
//   onRemoved,
// }: {
//   groupId: number | null;
//   onEdited: () => void;
//   onAssigned: () => void;
//   onRemoved: () => void;
// }) {
//   const [group, setGroup] = useState<GroupItem | null>(null);
//   const [members, setMembers] = useState<AstroRow[]>([]);
//   const [loading, setLoading] = useState(false);

//   const [showEdit, setShowEdit] = useState(false);
//   const [editName, setEditName] = useState("");

//   const [showAssign, setShowAssign] = useState(false);
//   const [astrologerList, setAstrologerList] = useState<
//     { id: number; name: string }[]
//   >([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedOptions, setSelectedOptions] = useState<
//     { value: number; label: string }[]
//   >([]);

//   // load current group + members
//   useEffect(() => {
//     let ok = true;
//     (async () => {
//       if (!groupId) {
//         setGroup(null);
//         setMembers([]);
//         return;
//       }
//       setLoading(true);
//       try {
//         // We can reuse list call to find the selected group row (cheap approach)
//         const res = await getGroupAstrologer({ page: 1, limit: 1, search: "" });
//         // Fallback: just set a minimal group object with id
//         const placeholder: GroupItem = { id: groupId, name: null, astrologerassign_count: 0 };
//         setGroup((prev) => prev ?? placeholder);

//         const m = await getAstrologersByGroup(groupId);
//         if (!ok) return;
//         setMembers(m || []);
//       } finally {
//         if (ok) setLoading(false);
//       }
//     })();
//     return () => {
//       ok = false;
//     };
//   }, [groupId]);

//   // fetch options for assign select
//   useEffect(() => {
//     const run = async () => {
//       const data = await getAstrologerlist(searchTerm);
//       if (Array.isArray(data)) setAstrologerList(data);
//     };
//     run();
//   }, [searchTerm]);

//   // Edit submit
//   const onEditSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!groupId || !editName.trim()) return;
//     await editAstrologerGroup({ id: groupId, name: editName.trim() });
//     setGroup((prev) => (prev ? { ...prev, name: editName.trim() } : prev));
//     setShowEdit(false);
//     onEdited();
//   };

//   // Assign submit
//   const onAssignSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!groupId || selectedOptions.length === 0) return;
//     const ids = selectedOptions.map((o) => o.value);
//     const res = await assignAstroToGroup(groupId, ids);
//     if ((res as any)?.success) {
//       const m = await getAstrologersByGroup(groupId);
//       setMembers(m || []);
//       setShowAssign(false);
//       setSelectedOptions([]);
//       onAssigned();
//     } else {
//       alert((res as any)?.message || "Failed to assign");
//     }
//   };

//   // Remove member
//   const onRemove = async (assignId: number) => {
//     if (!groupId) return;
//     if (!confirm("Remove this astrologer from the group?")) return;
//     await removeAstrologerFromGroup(assignId);
//     const m = await getAstrologersByGroup(groupId);
//     setMembers(m || []);
//     onRemoved();
//   };

//   const options = astrologerList
//     .filter((a) =>
//       a.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
//     )
//     .map((a) => ({ value: a.id, label: a.name }));

//   if (!groupId) {
//     return (
//       <div className={glass.surface + " p-10 text-center"}>
//         <FiUsers className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
//         <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
//           Select a Group
//         </h3>
//         <p className="text-slate-600 dark:text-slate-400">
//           Choose a group on the left to view and manage its astrologers.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className={glass.surface + " overflow-hidden"}>
//       {/* Header */}
//       <div className="p-6 bg-gradient-to-r from-white/60 to-white/30 dark:from-white/[0.06] dark:to-white/[0.04] border-b border-white/30 dark:border-white/10">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
//               {group?.name || "Group"}
//             </h2>
//             <p className="text-sm text-slate-600 dark:text-slate-400">
//               Assign or remove astrologers in this group
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               className={cx(glass.btn, glass.btnNeutral)}
//               onClick={() => {
//                 setEditName(group?.name || "");
//                 setShowEdit(true);
//               }}
//             >
//               <FiEdit className="h-4 w-4" />
//               Edit
//             </button>
//             <button
//               className={cx(glass.btn, glass.btnPrimary)}
//               onClick={() => {
//                 setSelectedOptions([]);
//                 setShowAssign(true);
//               }}
//             >
//               <FiPlus className="h-4 w-4" />
//               Assign
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="p-6">
//         {loading ? (
//           <div className="text-center text-slate-600 dark:text-slate-300">
//             Loading…
//           </div>
//         ) : members.length === 0 ? (
//           <div className="text-center text-slate-600 dark:text-slate-300">
//             No astrologers in this group.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-left border-b border-white/30 dark:border-white/10">
//                   <th className="py-2 text-slate-700 dark:text-slate-200">#</th>
//                   <th className="py-2 text-slate-700 dark:text-slate-200">Astrologer</th>
//                   <th className="py-2 text-slate-700 dark:text-slate-200 text-center">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {members.map((m, i) => (
//                   <tr key={m.id} className="border-b border-white/10">
//                     <td className="py-2">{i + 1}</td>
//                     <td className="py-2">
//                       <a
//                         href={`/astrologers/${m.astrologer_id}`}
//                         target="_blank"
//                         className="text-blue-600 dark:text-blue-300 hover:underline"
//                       >
//                         {m.astrologer_name}
//                       </a>
//                     </td>
//                     <td className="py-2 text-center">
//                       <button
//                         onClick={() => onRemove(m.id)}
//                         className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
//                       >
//                         <FiTrash className="h-4 w-4" />
//                         Remove
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Edit Modal */}
//       {showEdit && (
//         <Modal title="Edit Group" onClose={() => setShowEdit(false)}>
//           <form onSubmit={onEditSubmit} className="space-y-4">
//             <div>
//               <label className="block mb-1 font-medium text-slate-800 dark:text-slate-100">
//                 Group Name
//               </label>
//               <input
//                 value={editName}
//                 onChange={(e) => setEditName(e.target.value)}
//                 className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/40 outline-none"
//                 placeholder="Enter group name"
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <button
//                 type="button"
//                 className={cx(glass.btn, glass.btnNeutral)}
//                 onClick={() => setShowEdit(false)}
//               >
//                 Cancel
//               </button>
//               <button className={cx(glass.btn, glass.btnPrimary)}>Save</button>
//             </div>
//           </form>
//         </Modal>
//       )}

//       {/* Assign Modal */}
//       {showAssign && (
//         <Modal title="Assign Astrologers" onClose={() => setShowAssign(false)}>
//           <form onSubmit={onAssignSubmit} className="space-y-4">
//             <div>
//               <label className="block mb-1 font-medium text-slate-800 dark:text-slate-100">
//                 Astrologers
//               </label>
//               <Select
//                 isMulti
//                 options={options}
//                 value={selectedOptions}
//                 onChange={(opts: any) => {
//                   const selected = (opts || []) as { value: number; label: string }[];
//                   setSelectedOptions(selected);
//                 }}
//                 onInputChange={(val) => setSearchTerm(val)}
//                 placeholder="Search or select astrologers..."
//                 className="react-select-container"
//                 classNamePrefix="react-select"
//                 styles={{
//                   control: (base) => ({
//                     ...base,
//                     backgroundColor: "transparent",
//                     borderColor: "rgba(255,255,255,.2)",
//                   }),
//                   menu: (base) => ({ ...base, zIndex: 1001 }),
//                 }}
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <button
//                 type="button"
//                 className={cx(glass.btn, glass.btnNeutral)}
//                 onClick={() => setShowAssign(false)}
//               >
//                 Cancel
//               </button>
//               <button type="submit" className={cx(glass.btn, glass.btnPrimary)}>
//                 Save
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// }

// /* =================================================================================
//    Page (Two-pane layout like Roles page)
// ================================================================================= */
// export default function Page() {
//   const sp = useSearchParams();
//   const initialPage = useMemo(() => parseInt(sp.get("page") || "1", 10), [sp]);
//   const [page, setPage] = useState(initialPage);
//   const [search, setSearch] = useState(sp.get("search") || "");

//   const [selectedId, setSelectedId] = useState<number | null>(null);
//   // a simple token to trigger left pane refetch after mutations
//   const [refreshToken, setRefreshToken] = useState(0);

//   const bump = () => setRefreshToken((n) => n + 1);

//   return (
//     <div className="relative min-h-screen overflow-visible bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
//       {/* Ambient glows */}
//       <div className="pointer-events-none absolute inset-0">
//         <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
//         <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
//         <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
//       </div>

//       <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
//         {/* Page header (like Roles) */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow">
//               <FiUsers className="h-8 w-8 text-white" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
//                 Astrologer Groups
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400 mt-1">
//                 Create groups and assign astrologers
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Main Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left: Groups list */}
//           <div className="lg:col-span-1">
//             <GroupsPane
//               selectedId={selectedId}
//               onSelect={(id) => setSelectedId(id)}
//               onOpenAdd={() => {
//                 // open add modal by toggling via a hidden detail pane mechanism
//                 const ev = new CustomEvent("OPEN_ADD_GROUP");
//                 window.dispatchEvent(ev);
//               }}
//               page={page}
//               setPage={setPage}
//               search={search}
//               setSearch={setSearch}
//               refreshToken={refreshToken}
//             />
//           </div>

//           {/* Right: Details */}
//           <div className="lg:col-span-2">
//             <GroupDetailPane
//               groupId={selectedId}
//               onEdited={bump}
//               onAssigned={bump}
//               onRemoved={bump}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Global Add Group modal hooked from left header button */}
//       <AddGroupGlobal onAdded={bump} />
//     </div>
//   );
// }

// /* =================================================================================
//    Global Add Group modal (listens to OPEN_ADD_GROUP)
// ================================================================================= */
// function AddGroupGlobal({ onAdded }: { onAdded: () => void }) {
//   const [open, setOpen] = useState(false);
//   const [name, setName] = useState("");
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     const handler = () => setOpen(true);
//     window.addEventListener("OPEN_ADD_GROUP", handler);
//     return () => window.removeEventListener("OPEN_ADD_GROUP", handler);
//   }, []);

//   useEffect(() => {
//     if (open) setTimeout(() => inputRef.current?.focus(), 50);
//   }, [open]);

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const n = name.trim();
//     if (!n) return;
//     const res = await addAstrologerGroup(n);
//     if ((res as any)?.success) {
//       onAdded();
//       setOpen(false);
//       setName("");
//     } else {
//       alert((res as any)?.message || "Failed to add group");
//     }
//   };

//   if (!open) return null;

//   return (
//     <Modal title="Add Astrologer Group" onClose={() => setOpen(false)}>
//       <form onSubmit={onSubmit} className="space-y-4">
//         <div>
//           <label className="block mb-1 font-medium text-slate-800 dark:text-slate-100">
//             Name
//           </label>
//           <input
//             ref={inputRef}
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Enter group name"
//             className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/40 outline-none"
//           />
//         </div>
//         <div className="flex justify-end gap-2">
//           <button
//             type="button"
//             className={cx(glass.btn, glass.btnNeutral)}
//             onClick={() => setOpen(false)}
//           >
//             Cancel
//           </button>
//           <button className={cx(glass.btn, glass.btnPrimary)}>Add Group</button>
//         </div>
//       </form>
//     </Modal>
//   );
// }


"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import Select from "react-select";
import {
  getGroupAstrologer,
  getAstrologersByGroup,
  removeAstrologerFromGroup,
  addAstrologerGroup,
  editAstrologerGroup,
  getAstrologerlist,
  assignAstroToGroup,
  // ➕ make sure you export this from fetch.ts (see snippet below)
  deleteAstrologerGroup,
} from "./fetch";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X as XIcon,
  Check as CheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* =================================================================================
   Theme helpers
================================================================================= */
const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

const glass = {
  surface:
    "relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.10)] " +
    "dark:shadow-[0_12px_36px_rgba(0,0,0,0.40)]",
  input:
    "rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 " +
    "px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/40",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium " +
    "transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
  btnPrimary:
    "text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg",
  btnNeutral:
    "text-slate-800 dark:text-slate-200 bg-white/85 dark:bg-white/[0.08] " +
    "border border-slate-200/70 dark:border-white/10 hover:bg-white dark:hover:bg-white/10",
  pill:
    "inline-flex items-center gap-1 rounded-full border border-slate-200/70 dark:border-white/10 " +
    "bg-slate-900/5 dark:bg-white/10 text-xs px-2.5 py-1",
};


/* =================================================================================
   Types
================================================================================= */
type GroupItem = {
  id: number;
  name: string | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  astrologerassign_count?: number;
};

type AstroRow = {
  id: number;
  group_id: number;
  astrologer_id: number;
  astrologer_name: string;
  index: number;
};

/* =================================================================================
   Modal via Portal (always on top)
================================================================================= */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
function Modal({
  children,
  title,
  onClose,
  icon,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
  icon?: React.ReactNode;
}) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/70 dark:border-white/10 animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-white/10">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            aria-label="Close modal"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.98) }
          to { opacity: 1; transform: translateY(0) scale(1) }
        }
        .animate-fade-in { animation: fade-in .18s ease-out }
        .animate-slide-up { animation: slide-up .22s ease-out }
      `}</style>
    </div>,
    document.body
  );
}

/* =================================================================================
   Left Pane: Groups list (search + add + pagination)
================================================================================= */
function GroupsPane({
  selectedId,
  onSelect,
  onOpenAdd,
  page,
  setPage,
  search,
  setSearch,
  refreshToken,
  onRequestDelete,
}: {
  selectedId: number | null;
  onSelect: (id: number) => void;
  onOpenAdd: () => void;
  page: number;
  setPage: (n: number) => void;
  search: string;
  setSearch: (s: string) => void;
  refreshToken: number; // bump to refetch after create/edit/remove/assign
  onRequestDelete: (group: GroupItem) => void;
}) {
  const [rows, setRows] = useState<GroupItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // fetch page of groups
  useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getGroupAstrologer({ page, limit: 15, search });
        if (!ok) return;
        setRows(res.groups || []);
        setTotalPages(res.totalPages || 1);
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, [page, search, refreshToken]);

  return (
    <div className={glass.surface + " overflow-hidden"}>
      {/* Header */}
      <div className="p-5 border-b border-slate-200/70 dark:border-white/10 bg-gradient-to-r from-white/70 to-white/40 dark:from-white/[0.06] dark:to-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Groups
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Select a group to manage members
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <form
          className="mt-4 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups"
            className={cx(glass.input, "w-full")}
          />
          <button className={cx(glass.btn, glass.btnPrimary)}>Search</button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className={cx(glass.btn, glass.btnNeutral)}
            >
              Clear
            </button>
          )}
        </form>
      </div>
      {/* List */}
      <div className="max-h-[560px] overflow-auto p-3 space-y-2">
        {loading ? (
          <div className="p-6 text-center text-slate-600 dark:text-slate-300">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center text-slate-600 dark:text-slate-300">No groups found</div>
        ) : (
          rows.map((g) => {
            const active = selectedId === g.id;
            return (
              <div
                key={g.id}
                className={cn(
                  "group relative w-full cursor-pointer rounded-xl p-4 transition-colors",
                  active
                    ? "bg-indigo-50/70 dark:bg-indigo-900/20 shadow-sm ring-1 ring-inset ring-indigo-500/30"
                    : "hover:bg-white/70 dark:hover:bg-white/5"
                )}
                onClick={() => onSelect(g.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {g.name || "-"}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {g.astrologerassign_count ?? 0} astrologer
                      {(g.astrologerassign_count ?? 0) === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      title="Delete group"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestDelete(g);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage(Math.max(1, page - 1))}
            className={cx(
              glass.btn,
              glass.btnNeutral,
              page <= 1 && "opacity-50 cursor-not-allowed"
            )}
          >
            Prev
          </button>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className={cx(
              glass.btn,
              glass.btnNeutral,
              page >= totalPages && "opacity-50 cursor-not-allowed"
            )}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* =================================================================================
   Right Pane: Group details (edit + assign + list)
================================================================================= */
function GroupDetailPane({
  groupId,
  onEdited,
  onAssigned,
  onRemoved,
  onRequestDelete,
}: {
  groupId: number | null;
  onEdited: () => void;
  onAssigned: () => void;
  onRemoved: () => void;
  onRequestDelete: (group: GroupItem) => void;
}) {
  const [group, setGroup] = useState<GroupItem | null>(null);
  const [members, setMembers] = useState<AstroRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");

  const [showAssign, setShowAssign] = useState(false);
  const [astrologerList, setAstrologerList] = useState<
    { id: number; name: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<
    { value: number; label: string }[]
  >([]);

  // load group + members
  useEffect(() => {
    let ok = true;
    (async () => {
      if (!groupId) {
        setGroup(null);
        setMembers([]);
        return;
      }
      setLoading(true);
      try {
        // set minimal group (name will fill after edit)
        const placeholder: GroupItem = { id: groupId, name: null, astrologerassign_count: 0 };
        setGroup((prev) => prev ?? placeholder);

        const m = await getAstrologersByGroup(groupId);
        if (!ok) return;
        setMembers(m || []);
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, [groupId]);

  // fetch options for assign select
  useEffect(() => {
    const run = async () => {
      const data = await getAstrologerlist(searchTerm);
      if (Array.isArray(data)) setAstrologerList(data);
    };
    run();
  }, [searchTerm]);

  // Edit submit
  const onEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !editName.trim()) return;
    await editAstrologerGroup({ id: groupId, name: editName.trim() });
    setGroup((prev) => (prev ? { ...prev, name: editName.trim() } : prev));
    setShowEdit(false);
    onEdited();
  };

  // Assign submit
  const onAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || selectedOptions.length === 0) return;
    const ids = selectedOptions.map((o) => o.value);
    const res = await assignAstroToGroup(groupId, ids);
    if ((res as any)?.success) {
      const m = await getAstrologersByGroup(groupId);
      setMembers(m || []);
      setShowAssign(false);
      setSelectedOptions([]);
      onAssigned();
    } else {
      alert((res as any)?.message || "Failed to assign");
    }
  };

  // Remove member
  const onRemove = async (assignId: number) => {
    if (!groupId) return;
    if (!confirm("Remove this astrologer from the group?")) return;
    await removeAstrologerFromGroup(assignId);
    const m = await getAstrologersByGroup(groupId);
    setMembers(m || []);
    onRemoved();
  };

  const options = astrologerList
    .filter((a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
    .map((a) => ({ value: a.id, label: a.name }));

  if (!groupId) {
    return (
      <div className={glass.surface + " p-10 text-center"}>
        <Users className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Select a Group
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Choose a group on the left to view and manage its astrologers.
        </p>
      </div>
    );
  }

  return (
    <div className={glass.surface + " overflow-hidden"}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-white/70 to-white/40 dark:from-white/[0.06] dark:to-white/[0.03] border-b border-slate-200/70 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {group?.name || "Group"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Assign or remove astrologers in this group
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              title="Edit group"
              className={cx(glass.btn, glass.btnNeutral)}
              onClick={() => {
                setEditName(group?.name || "");
                setShowEdit(true);
              }}
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              title="Assign astrologers"
              className={cx(glass.btn, glass.btnPrimary)}
              onClick={() => {
                setSelectedOptions([]);
                setShowAssign(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              title="Delete group"
              className={cx(
                glass.btn,
                "text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border border-red-200/70 dark:border-red-900"
              )}
              onClick={() => onRequestDelete(group!)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {loading ? (
          <div className="text-center text-slate-600 dark:text-slate-300">
            Loading…
          </div>
        ) : members.length === 0 ? (
          <div className="text-center text-slate-600 dark:text-slate-300">
            No astrologers in this group.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200/70 dark:border-white/10">
                  <th className="py-2 text-slate-700 dark:text-slate-200">#</th>
                  <th className="py-2 text-slate-700 dark:text-slate-200">Astrologer</th>
                  <th className="py-2 text-slate-700 dark:text-slate-200 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={m.id} className="border-b border-white/10">
                    <td className="py-2">{i + 1}</td>
                    <td className="py-2">
                      <a
                        href={`/astrologers/${m.astrologer_id}`}
                        target="_blank"
                        className="text-indigo-600 dark:text-indigo-300 hover:underline"
                      >
                        {m.astrologer_name}
                      </a>
                    </td>
                    <td className="py-2 text-center">
                      <button
                        onClick={() => onRemove(m.id)}
                        className="inline-flex items-center rounded-lg p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <Modal
          title="Edit Group"
          onClose={() => setShowEdit(false)}
          icon={<Edit2 className="h-4 w-4 text-indigo-500" />}
        >
          <form onSubmit={onEditSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-slate-800 dark:text-slate-100">
                Group Name
              </label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/40 outline-none"
                placeholder="Enter group name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className={cx(glass.btn, glass.btnNeutral)}
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>
              <button className={cx(glass.btn, glass.btnPrimary)}>Save</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <Modal
          title="Assign Astrologers"
          onClose={() => setShowAssign(false)}
          icon={<Users className="h-4 w-4 text-indigo-500" />}
        >
          <form onSubmit={onAssignSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-slate-800 dark:text-slate-100">
                Astrologers
              </label>
              <Select
                isMulti
                options={options}
                value={selectedOptions}
                onChange={(opts: any) => {
                  const selected = (opts || []) as { value: number; label: string }[];
                  setSelectedOptions(selected);
                }}
                onInputChange={(val) => setSearchTerm(val)}
                placeholder="Search or select astrologers..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "transparent",
                    borderColor: "rgba(255,255,255,.2)",
                  }),
                  menu: (base) => ({ ...base, zIndex: 1001 }),
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className={cx(glass.btn, glass.btnNeutral)}
                onClick={() => setShowAssign(false)}
              >
                Cancel
              </button>
              <button type="submit" className={cx(glass.btn, glass.btnPrimary)}>
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* =================================================================================
   Delete Group Confirm Modal (global)
================================================================================= */
function DeleteGroupModal({
  open,
  onClose,
  onConfirm,
  name,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  name?: string | null;
}) {
  if (!open) return null;
  return (
    <Modal
      title="Delete Group"
      onClose={onClose}
      icon={<Trash2 className="h-4 w-4 text-red-500" />}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{name || "this group"}</span>? This
          will remove its assignments. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className={cx(glass.btn, glass.btnNeutral)}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              glass.btn,
              "text-white bg-red-600 hover:bg-red-700 shadow-lg"
            )}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* =================================================================================
   Page (Two-pane layout)
================================================================================= */
export default function Page() {
  const sp = useSearchParams();
  const initialPage = useMemo(() => parseInt(sp.get("page") || "1", 10), [sp]);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(sp.get("search") || "");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);

  // simple token to trigger left pane refetch after mutations
  const [refreshToken, setRefreshToken] = useState(0);
  const bump = () => setRefreshToken((n) => n + 1);

  // Add group modal (global)
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");

  // Delete group modal (global)
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GroupItem | null>(null);

  const onOpenAdd = () => setAddOpen(true);

  const onRequestDelete = (g: GroupItem) => {
    setDeleteTarget(g);
    setDeleteOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteAstrologerGroup(deleteTarget.id);
    if (selectedId === deleteTarget.id) {
      setSelectedId(null);
      setSelectedGroupName(null);
    }
    setDeleteOpen(false);
    setDeleteTarget(null);
    bump();
  };

  const addSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = addName.trim();
    if (!n) return;
    const res = await addAstrologerGroup(n);
    if ((res as any)?.success) {
      setAddOpen(false);
      setAddName("");
      bump();
    } else {
      alert((res as any)?.message || "Failed to add group");
    }
  };

  return (
    <div className="relative min-h-screen overflow-visible bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                Astrologer Groups
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create groups and assign astrologers
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAdd}
            className={cx(
              glass.btn,
              glass.btnPrimary,
              "h-9 rounded-xl px-3 shadow-lg hover:shadow-[0_12px_24px_rgba(79,70,229,0.25)]"
            )}
          >
            <Plus className="h-4 w-4" />
            New Group
          </button>

        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Groups list */}
          <div className="lg:col-span-1">
            <GroupsPane
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
              onOpenAdd={onOpenAdd}
              page={page}
              setPage={setPage}
              search={search}
              setSearch={(s) => {
                setSearch(s);
                if (!s) setPage(1);
              }}
              refreshToken={refreshToken}
              onRequestDelete={onRequestDelete}
            />
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2">
            <GroupDetailPane
              groupId={selectedId}
              onEdited={bump}
              onAssigned={bump}
              onRemoved={bump}
              onRequestDelete={onRequestDelete}
            />
          </div>
        </div>
      </div>

      {/* Add Group Modal */}
      {addOpen && (
        <Modal
          title="Add Astrologer Group"
          onClose={() => setAddOpen(false)}
          icon={<Plus className="h-4 w-4 text-indigo-500" />}
        >
          <form onSubmit={addSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-slate-800 dark:text-slate-100">
                Name
              </label>
              <input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/40 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className={cx(glass.btn, glass.btnNeutral)}
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </button>
              <button className={cx(glass.btn, glass.btnPrimary)}>
                <CheckIcon className="h-4 w-4" />
                Add
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Group Modal */}
      <DeleteGroupModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onConfirmDelete}
        name={deleteTarget?.name}
      />
    </div>
  );
}
