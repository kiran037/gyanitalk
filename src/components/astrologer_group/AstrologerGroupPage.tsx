// /src/components/astrologer_group/AstrologerGroupPage.tsx
"use client";

import { useState } from "react";
import { Check as CheckIcon } from "lucide-react";
import GlassModal from "@/components/GlassUI/GlassModal";
import GlassInput from "@/components/GlassUI/GlassInput";
import GlassButton from "@/components/GlassUI/GlassButton";
import GroupsPane from "./GroupsPane";
import GroupDetailPane from "./GroupDetailPane";
import DeleteGroupModal from "./DeleteGroupModal";
import { GroupItem } from "./helpers";
import { addAstrologerGroup, deleteAstrologerGroup } from "@/app/astrologer_group/fetch";

export default function AstrologerGroupPage({
  initialPage = 1,
  initialSearch = "",
}: {
  initialPage?: number;
  initialSearch?: string;
}) {
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [refreshToken, setRefreshToken] = useState(0);
  const bump = () => setRefreshToken((n) => n + 1);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");

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
    if (selectedId === deleteTarget.id) setSelectedId(null);
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows (clipped by overflow-hidden) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-32 h-[20rem] w-[20rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[14rem] w-[40rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
              Astrologer Groups
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create groups and assign astrologers
            </p>
          </div>

          <GlassButton
            variant="primary"
            onClick={onOpenAdd}
            className="h-9 rounded-xl px-3 shadow-lg"
          >
            New Group
          </GlassButton>
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
      <GlassModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Astrologer Group"
        footer={
          <div className="flex gap-2">
            <GlassButton variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => {
                const ev = new Event("submit", { bubbles: true, cancelable: true });
                document.getElementById("add-group-form")?.dispatchEvent(ev);
              }}
            >
              <CheckIcon className="h-4 w-4" />
              Add
            </GlassButton>
          </div>
        }
      >
        <form id="add-group-form" onSubmit={addSubmit} className="space-y-4">
          <GlassInput
            label="Name"
            value={addName}
            onChange={(e) => setAddName(e.currentTarget.value)}
            placeholder="Enter group name"
          />
          <button type="submit" className="hidden" />
        </form>
      </GlassModal>

      {/* Delete Group Modal */}
      <DeleteGroupModal
        open={Boolean(deleteOpen)}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onConfirmDelete}
        name={deleteTarget?.name}
      />
    </div>
  );
}
