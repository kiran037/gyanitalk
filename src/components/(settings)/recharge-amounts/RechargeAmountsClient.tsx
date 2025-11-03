"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, Save, Edit3 } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";

// reuse the tiny UI kit from settings
import {
  Surface as GlassCard,
  Button as GlowButton,
  Input,
} from "@/components/(settings)/settings/ui";

import {
  getrechargeamount,
  createrechargeamount,
  updaterechargeamount,
} from "@/app/(settings)/recharge-amounts/fetch";

/* =======================
   Types
======================= */
type Recharge = {
  id: number;
  amount: number;
  cashback?: number | null;
};

/* =======================
   Glass Modal (local)
======================= */
function GlassModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[2000] flex items-center justify-center px-4 py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <GlowButton variant="ghost" onClick={onClose}>
            <X size={16} />
          </GlowButton>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* =======================
   Main Client
======================= */
export default function RechargeAmountsClient() {
  const toast = useToast();
  const [items, setItems] = useState<Recharge[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal state
  const [addOpen, setAddOpen] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newCashback, setNewCashback] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit modal state
  const [editing, setEditing] = useState<Recharge | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCashback, setEditCashback] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getrechargeamount();
      setItems(res.rechargeamount || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    try {
      setSaving(true);
      const res = await createrechargeamount({
        amount: parseInt(newAmount, 10),
        cashback: newCashback ? parseInt(newCashback, 10) : undefined,
      });
      if (res.status) {
        toast("success", "Added", "Recharge amount created");
        setAddOpen(false);
        setNewAmount("");
        setNewCashback("");
        load();
      } else {
        toast("error", "Error", res.message || "Failed to add");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      const res = await updaterechargeamount(editing.id, {
        amount: parseInt(editAmount, 10),
        cashback: editCashback ? parseInt(editCashback, 10) : undefined,
      });
      if (res.status) {
        toast("success", "Updated", "Recharge amount updated");
        setEditing(null);
        load();
      } else {
        toast("error", "Error", res.message || "Failed to update");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-slate-600 dark:text-slate-400">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Recharge Amounts
          </h1>
          <GlowButton variant="primary" onClick={() => setAddOpen(true)}>
            <Plus size={16} /> Add Recharge
          </GlowButton>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <GlassCard key={item.id} className="p-5">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Recharge #{item.id}
                </h2>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Amount:</span> ₹{item.amount}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Cashback:</span>{" "}
                  {item.cashback ? `₹${item.cashback}` : "—"}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <GlowButton
                  variant="secondary"
                  onClick={() => {
                    setEditing(item);
                    setEditAmount(item.amount.toString());
                    setEditCashback(item.cashback?.toString() || "");
                  }}
                >
                  <Edit3 size={14} /> Edit
                </GlowButton>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      <GlassModal open={addOpen} onClose={() => setAddOpen(false)} title="Add Recharge">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Amount
            </label>
            <Input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Cashback
            </label>
            <Input
              type="number"
              value={newCashback}
              onChange={(e) => setNewCashback(e.target.value)}
              placeholder="Enter cashback (optional)"
            />
          </div>
          <div className="flex justify-end gap-2">
            <GlowButton variant="ghost" onClick={() => setAddOpen(false)}>
              <X size={14} /> Cancel
            </GlowButton>
            <GlowButton type="submit" variant="primary" disabled={saving} loading={saving}>
              <Save size={14} /> Save
            </GlowButton>
          </div>
        </form>
      </GlassModal>

      {/* Edit Modal */}
      <GlassModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit Recharge #${editing.id}` : "Edit Recharge"}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
        >
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Amount
            </label>
            <Input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Cashback
            </label>
            <Input
              type="number"
              value={editCashback}
              onChange={(e) => setEditCashback(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <GlowButton variant="ghost" onClick={() => setEditing(null)}>
              <X size={14} /> Cancel
            </GlowButton>
            <GlowButton type="submit" variant="primary" disabled={saving} loading={saving}>
              <Save size={14} /> Save
            </GlowButton>
          </div>
        </form>
      </GlassModal>
    </main>
  );
}
