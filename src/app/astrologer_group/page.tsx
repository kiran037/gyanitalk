
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, CheckSquare } from "lucide-react";
import { getGroupAstrologer, getAstrologersByGroup, removeAstrologerFromGroup,
  addAstrologerGroup, editAstrologerGroup, getAstrologerlist, assignAstroToGroup,
} from "./fetch";
import { cn } from "@/lib/utils";

/* =================================================================================
   Tiny Glass Kit
================================================================================= */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";

const glass = {
  surface:
    "relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_28px_rgba(0,0,0,0.08)] " +
    "dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
  lift:
    "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(0,0,0,0.10)] " +
    "dark:hover:shadow-[0_16px_44px_rgba(0,0,0,0.45)]",
  input:
    "rounded-xl border border-white/30 dark:border-white/10 bg-white/85 dark:bg-white/[0.06] " +
    "px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40",
  pill:
    "inline-flex items-center gap-2 rounded-full border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] text-xs px-3 py-1",
  th:
    "text-left text-[12px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300",
  td: "align-middle text-sm text-slate-700 dark:text-slate-200",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white",
};

/* =================================================================================
   Skeleton
================================================================================= */
function GroupsSkeleton() {
  return (
    <div className={glass.surface + " p-6"}>
      <div className="h-6 w-40 mb-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
      <div className="overflow-hidden rounded-2xl border border-white/30">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cx(
              "grid grid-cols-12 items-center gap-4 px-4 py-3",
              i % 2 ? "bg-white/60 dark:bg-white/[0.04]" : "bg-transparent"
            )}
          >
            <div className="col-span-4 sm:col-span-4 h-10 rounded-full bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
            <div className="col-span-4 h-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
            <div className="col-span-4 h-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
/* =================================================================================
   Table (client-fetched)
================================================================================= */
function GroupsTable({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [groupAstrologers, setGroupAstrologers] = useState<{ [key: number]: any[] }>({});

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const [astrologerList, setAstrologerList] = useState<{ id: number; name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [editData, setEditData] = useState<{ id?: number; name?: string }>({});
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [assignData, setAssignData] = useState<{ id?: number; astrologers?: number[] }>({});

  // 🧙 Fetch astrologer groups (main table)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getGroupAstrologer({ page, limit, search });
        if (!mounted) return;
        setRows(res.groups || []);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || page);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, limit, search]);

  // 🔍 Fetch astrologers dynamically (used in Assign modal)
  useEffect(() => {
    const fetchAstrologers = async () => {
      const data = await getAstrologerlist(searchTerm);
      setAstrologerList(data);
    };
    fetchAstrologers();
  }, [searchTerm]);

  // ➕ Add new group
  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;

    try {
      const newGroup = await addAstrologerGroup(name);
      setRows((prev) => [newGroup, ...prev]);
      setShowAdd(false); // close modal
      form.reset(); // clear form
    } catch (err: any) {
      alert(err.message);
      console.error(err);
    }
  };

  // ✏️ Edit existing group
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData.id || !editData.name) return;

    try {
      await editAstrologerGroup({ id: editData.id, name: editData.name });
      alert("Group updated successfully");
      setShowEdit(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update group");
    }
  };

  const filteredOptions = astrologerList
  .filter((astro) =>
    astro.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  )
  .map((astro) => ({ value: astro.id, label: astro.name }));

  // 🧙 Assign astrologers to group
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignData.id || !assignData.astrologers) return;
    const res = await assignAstroToGroup(assignData.id, assignData.astrologers);
    if (res.success) {
      alert("Astrologers assigned successfully!");
      setShowAssign(false);
      setAssignData({});
      setSelectedOptions([]); // reset select
    } else {
      alert("Error: " + res.message);
    }
  };

  // 🔽 Expand group to show astrologers
  const toggleExpand = async (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    if (!groupAstrologers[id]) {
      const data = await getAstrologersByGroup(id);
      setGroupAstrologers((prev) => ({ ...prev, [id]: data }));
    }
  };

  // ❌ Remove astrologer from group
  const handleRemove = async (assignId: number, groupId: number) => {
  if (!confirm("Are you sure you want to remove this astrologer?")) return;

  try {
    await removeAstrologerFromGroup(assignId);
    const updated = await getAstrologersByGroup(groupId);
    setGroupAstrologers((prev) => ({ ...prev, [groupId]: updated }));
  } catch (err) {
    alert("Failed to remove astrologer");
    console.error(err);
  }
};

  if (loading) return <GroupsSkeleton />;
  return (
    <div className={glass.surface + " p-0 overflow-hidden"}>
      <div className="px-6 pt-6 flex items-center justify-between">
        {/* Left side content */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Astrologer Group</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage astrologer groups and assignments.
          </p>
        </div>

        {/* Right side content */}
        <div>
          <button
            type="button"
            className={cx(glass.btn, glass.btnPrimary)}
            onClick={() => setShowAdd(true)}
          >
            Add Astrologer Group
          </button>
        </div>
      </div>
      
      {/* Head */}
      <div className="mt-4">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-y border-white/30 bg-white/60 dark:bg-white/[0.06]">
          <div className={cx("col-span-4 ml-15", glass.th)}>Name</div>
          <div className={cx("col-span-4 text-center", glass.th)}>Astrologers</div>
          <div className={cx("col-span-4 text-center", glass.th)}>ACTIONS</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/30">
          {rows.map((item: any, idx: number) => {
            const isOpen = expanded[item.id];
            return (
              <div
                key={`group-${item.id}`} // prefix to ensure uniqueness
                className={cn(
                  "grid grid-cols-12 items-center gap-4 px-6 py-3 cursor-pointer",
                  idx % 2 ? "bg-white/50 dark:bg-white/[0.03]" : "bg-transparent"
                )}
                 onClick={() => toggleExpand(item.id)}
              >
                {/* User */}
                <div className="col-span-4 flex items-center gap-2 ml-10">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="font-medium">{item.name || "-"}</span>
                </div>

                {/* Astrologers */}
                <div className="col-span-4 text-center font-medium">
                  {item.astrologerassign_count || 0}
                </div>

                {/* Actions */}
                <div className={cn("col-span-4 text-center flex justify-center gap-4", glass.td)}>
                  {/* Edit Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditData({ id: item.id, name: item.name });
                        setShowEdit(true);
                      }}
                      className="flex items-center mr-3 text-blue-600 hover:text-blue-800"
                    >
                      <CheckSquare className="w-4 h-4 mr-1 inline" />
                      Edit
                    </button>

                    {/* Assign Astrologer Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssignData({ id: item.id, astrologers: [] });
                        setShowAssign(true);
                      }}
                      className="flex items-center mr-3 text-green-600 hover:text-green-800"
                    >
                      <CheckSquare className="w-4 h-4 mr-1 inline" />
                      Assign Astrologer
                    </button>
                </div>
              {/* Expanded astrologer list */}
                {isOpen && (
                  <div className="col-span-12 w-full bg-slate-50 px-4 py-2">
                    {(groupAstrologers[item.id] || []).length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-white/20">
                          <th className="py-1">#</th>
                          <th className="py-1 text-center">Astrologer</th>
                          <th className="py-1 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupAstrologers[item.id].map((astro, i) => (
                          <tr key={`astro-${item.id}-${astro.id}-${i}`}>
                            <td className="py-2">{i + 1}</td>
                            <td className="py-2 text-center">
                              <a
                                href={`/astrologers/${astro.astrologer_id}`}
                                target="_blank"
                                className="text-blue-600 hover:underline"
                              >
                                {astro.astrologer_name}
                              </a>
                            </td>
                            <td className="py-2 text-center">
                              <button
                                onClick={() => handleRemove(astro.id, item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    ) : (
                      <p className="text-center text-slate-500">No astrologers in this group.</p>
                    )}
                  </div>
                )}
                </div>
               );
          })}
          {!rows.length && (
            <div className="px-6 py-10 text-center text-sm text-slate-600 dark:text-slate-400">
              No astrologer groups found
            </div>
          )}

          {/* ✅ Add Group Modal */}
          {showAdd && (
            <Modal onClose={() => setShowAdd(false)} title="Add Astrologer Group">
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter group name"
                    className="form-control w-full p-2 border rounded"
                  />
                </div>
                <button className={cx(glass.btn, glass.btnPrimary)} >Add Astrologer Group</button>
              </form>
            </Modal>
          )}

          {/* ✅ Edit Group Modal */}
          {showEdit && (
            <Modal onClose={() => setShowEdit(false)} title="Edit Astrologer Group">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <input type="hidden" value={editData.id} />
                <div>
                  <label className="block mb-1 font-medium">Name</label>
                  <input
                    type="text"
                    value={editData.name || ""}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    required
                    placeholder="Name"
                    className="form-control w-full p-2 border rounded"
                  />
                </div>
                <button className={cx(glass.btn, glass.btnPrimary)}>Save</button>
              </form>
            </Modal>
          )}

          {/* ✅ Assign Astrologer Modal */}
          {showAssign && (
            <Modal onClose={() => setShowAssign(false)} title="Assign Astrologer Group">
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <input type="hidden" value={assignData.id} />
                {/* 🧙 Astrologer multi-select */}
                <div>
                  <label className="block mb-1 font-medium">Astrologers</label>
                  <Select
                    isMulti
                    options={filteredOptions} // filtered based on searchTerm
                    value={selectedOptions}
                    onChange={(opts: any) => {
                      const selected = opts as { value: number; label: string }[];
                      setSelectedOptions(selected);
                      setAssignData({
                        ...assignData,
                        astrologers: selected.map((o) => o.value),
                      });
                    }}
                    onInputChange={(inputValue) => setSearchTerm(inputValue)} // updates searchTerm
                    placeholder="Search or select astrologers..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                {/* Action buttons */}
                <div className="flex justify-end gap-2">
                  <button type="button" className={cx(glass.btn)} onClick={() => setShowAssign(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={cx(glass.btn, glass.btnPrimary)}>
                    Save
                  </button>
                </div>
              </form>
            </Modal>
          )}
      
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

                const href = `?page=${pageNum}${search ? `&search=${encodeURIComponent(search)}` : ""}`;

                return (
                  <a
                    key={i}
                    href={href}
                    className={cn(
                      glass.btn,
                      isCurrent
                        ? glass.btnPrimary
                        : glass.btnNeutral
                    )}
                  >
                    {isLast ? "Last" : pageNum}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>   
    );
} 
    
function Modal({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
/* =================================================================================
   Page (client)
================================================================================= */
export default function Page() {
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

      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Astrologers Group</h1>
        </div>

        {/* Filters */}
        <div className={glass.surface + " p-5"}>
          <form method="get" className="flex flex-wrap items-center gap-3">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by name/contact"
              className={cx(glass.input, "min-w-[240px]")}
            />
            <button type="submit" className={cx(glass.btn, glass.btnPrimary)}>
              Search
            </button>
            {search && (
              <a href="?page=1" className={cx(glass.btn, glass.btnNeutral)}>
                Clear
              </a>
            )}
          </form>
        </div>

        <Suspense fallback={<GroupsSkeleton />}>
          <GroupsTable page={page} search={search} />
        </Suspense>
      </div>
    </div>
  );
}
