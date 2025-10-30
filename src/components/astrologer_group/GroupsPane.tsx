// /src/components/astrologer_group/GroupsPane.tsx
"use client";

import { useEffect, useState } from "react";
import { Users, Trash2 } from "lucide-react"; // ⟵ removed Plus
import { GlassCard, cx, glass } from "@/components/GlassUI/GlassKit";
import GlassInput from "@/components/GlassUI/GlassInput";
import GlassButton from "@/components/GlassUI/GlassButton";
import { GroupItem, toNumber } from "./helpers";
import { getGroupAstrologer } from "@/app/astrologer_group/fetch";

export default function GroupsPane({
  selectedId,
  onSelect,
  onOpenAdd, // still accepted, not used here
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
  refreshToken: number;
  onRequestDelete: (group: GroupItem) => void;
}) {
  const [rows, setRows] = useState<GroupItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getGroupAstrologer({ page, limit: 15, search });
        if (!ok) return;
        const groups = Array.isArray(res?.groups) ? res.groups : [];
        const sanitized: GroupItem[] = groups.map((g: any) => ({
          id: toNumber(g?.id),
          name: g?.name ?? null,
          astrologerassign_count: toNumber(g?.astrologerassign_count ?? 0),
        }));
        setRows(sanitized);
        setTotalPages(toNumber(res?.totalPages ?? 1, 1) || 1);
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, [page, search, refreshToken]);

  return (
    <GlassCard className="overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-white/70 to-white/40 dark:from-white/[0.06] dark:to-white/[0.03]">
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
          {/* removed duplicate "New Group" button here */}
        </div>

        {/* Search */}
        <form
          className="mt-4 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
        >
          <GlassInput
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search groups"
            className="w-full"
          />
          <GlassButton variant="secondary" type="submit">
            Search
          </GlassButton>
          {search ? (
            <GlassButton
              variant="ghost"
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
            >
              Clear
            </GlassButton>
          ) : null}
        </form>
      </div>

      {/* List */}
      <div className="max-h-[560px] overflow-auto p-3 space-y-2">
        {loading ? (
          <div className="p-6 text-center text-slate-600 dark:text-slate-300">
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center text-slate-600 dark:text-slate-300">
            No groups found
          </div>
        ) : (
          rows.map((g) => {
            const active = selectedId === g.id;
            return (
              <div
                key={g.id}
                className={cx(
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
              glass.btnSecondary,
              "disabled:opacity-50 disabled:cursor-not-allowed"
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
              glass.btnSecondary,
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Next
          </button>
        </div>
      )}
    </GlassCard>
  );
}
