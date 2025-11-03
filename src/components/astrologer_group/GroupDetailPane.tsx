// /src/components/astrologer_group/GroupDetailPane.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { Users, Edit2, Plus, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import GlassModal from "@/components/GlassUI/GlassModal";
import GlassInput from "@/components/GlassUI/GlassInput";
import GlassButton from "@/components/GlassUI/GlassButton";
import {
  AstroRow,
  GroupItem,
  sanitizeAstrologerLite,
  sanitizeMembers,
} from "./helpers";
import {
  getAstrologersByGroup,
  removeAstrologerFromGroup,
  editAstrologerGroup,
  getAstrologerlist,
  assignAstroToGroup,
} from "@/app/astrologer_group/fetch";

export default function GroupDetailPane({
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
        setGroup((prev) => prev ?? { id: groupId, name: null, astrologerassign_count: 0 });
        const m = await getAstrologersByGroup(groupId);
        if (!ok) return;
        setMembers(sanitizeMembers(m));
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, [groupId]);

  // options for react-select
  useEffect(() => {
    let ok = true;
    (async () => {
      const data = await getAstrologerlist(searchTerm);
      if (!ok) return;
      if (Array.isArray(data)) setAstrologerList(sanitizeAstrologerLite(data));
    })();
    return () => {
      ok = false;
    };
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
      setMembers(sanitizeMembers(m));
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
    setMembers(sanitizeMembers(m));
    onRemoved();
  };

  const options = useMemo(
    () =>
      astrologerList
        .filter((a) =>
          a.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
        )
        .map((a) => ({ value: a.id, label: a.name })),
    [astrologerList, searchTerm]
  );

  if (!groupId) {
    return (
      <GlassCard className="p-10 text-center">
        <Users className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Select a Group
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Choose a group on the left to view and manage its astrologers.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-white/70 to-white/40 dark:from-white/[0.06] dark:to-white/[0.03] border-b border-slate-200 dark:border-white/10">
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
            <GlassButton
              variant="secondary"
              icon={Edit2}
              onClick={() => {
                setEditName(group?.name || "");
                setShowEdit(true);
              }}
            >
              Edit
            </GlassButton>
            <GlassButton
              variant="primary"
              icon={Plus}
              onClick={() => {
                setSelectedOptions([]);
                setShowAssign(true);
              }}
            >
              Assign
            </GlassButton>
            <GlassButton
              variant="danger"
              icon={Trash2}
              onClick={() =>
                onRequestDelete({
                  id: groupId,
                  name: group?.name ?? null,
                  astrologerassign_count: members.length,
                })
              }
            >
              Delete
            </GlassButton>
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
                <tr className="text-left border-b border-slate-200 dark:border-white/10">
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
      <GlassModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Group"
        footer={
          <div className="flex gap-2">
            <GlassButton variant="secondary" onClick={() => setShowEdit(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => {
                const ev = new Event("submit", { bubbles: true, cancelable: true });
                document.getElementById("edit-group-form")?.dispatchEvent(ev);
              }}
            >
              Save
            </GlassButton>
          </div>
        }
      >
        <form id="edit-group-form" onSubmit={onEditSubmit} className="space-y-4">
          <GlassInput
            label="Group Name"
            value={editName}
            onChange={(e) => setEditName(e.currentTarget.value)}
            placeholder="Enter group name"
          />
          <button type="submit" className="hidden" />
        </form>
      </GlassModal>

      {/* Assign Modal */}
      <GlassModal
        open={showAssign}
        onClose={() => setShowAssign(false)}
        title="Assign Astrologers"
        footer={
          <div className="flex gap-2">
            <GlassButton variant="secondary" onClick={() => setShowAssign(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => {
                const ev = new Event("submit", { bubbles: true, cancelable: true });
                document.getElementById("assign-astro-form")?.dispatchEvent(ev);
              }}
            >
              Save
            </GlassButton>
          </div>
        }
      >
        <form id="assign-astro-form" onSubmit={onAssignSubmit} className="space-y-4">
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
          <button type="submit" className="hidden" />
        </form>
      </GlassModal>
    </GlassCard>
  );
}
