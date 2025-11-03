// /src/components/astrologer_group/DeleteGroupModal.tsx
"use client";

import GlassModal from "@/components/GlassUI/GlassModal";
import GlassButton from "@/components/GlassUI/GlassButton";
import { Trash2 } from "lucide-react";

export default function DeleteGroupModal({
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
  return (
    <GlassModal
      open={open}
      onClose={onClose}
      title="Delete Group"
      footer={
        <div className="flex gap-2">
          <GlassButton variant="secondary" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton variant="danger" icon={Trash2} onClick={onConfirm}>
            Delete
          </GlassButton>
        </div>
      }
    >
      <p className="text-sm text-slate-700 dark:text-slate-300">
        Are you sure you want to delete{" "}
        <span className="font-semibold">{name || "this group"}</span>? This will
        remove its assignments. This action cannot be undone.
      </p>
    </GlassModal>
  );
}
