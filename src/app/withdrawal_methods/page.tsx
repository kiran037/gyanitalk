
"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Pencil } from "lucide-react";

import { useToast } from "@/components/Toast/ToastProvider";
import {
  getWithdrawalMethods,
  editWithdrawalMethods,
  updateWithdrawMethodsStatus,
} from "@/app/withdrawal_methods/fetch";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */
type WithdrawMethod = {
  id: number;
  method_name: string;
  isActive: boolean;
};

/* -------------------------------------------------------------------------- */
/*                              Glass UI Helpers                              */
/* -------------------------------------------------------------------------- */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const glass = {
  surface:
    "rounded-3xl border border-white/20 bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-5",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-4 text-sm font-medium transition active:scale-[0.97]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-[0_8px_20px_rgba(59,130,246,0.25)]",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.08] border border-white/20 hover:bg-white/90",
};

/* -------------------------------------------------------------------------- */
/*                            Status Toggle Pill UI                           */
/* -------------------------------------------------------------------------- */
function StatusPill({
  id,
  status,
  onChange,
}: {
  id: number;
  status: boolean;
  onChange: (val: boolean) => void;
}) {
  const [checked, setChecked] = useState(status);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  async function toggle(newVal: boolean) {
    setChecked(newVal);
    const res = await updateWithdrawMethodsStatus(id, newVal);
    if (res?.success) {
      toast("success", "Updated", "Status updated successfully");
    } else {
      toast("error", "Error", "Failed to update status");
      setChecked((prev) => !prev);
    }
  }

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(() => {
          toggle(!checked);
          onChange(!checked);
        })
      }
      className={cx(
        "px-3 py-1.5 text-xs font-semibold rounded-full",
        checked
          ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30"
          : "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30"
      )}
    >
      {checked ? "Active" : "Inactive"}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Edit Modal                                 */
/* -------------------------------------------------------------------------- */
function EditModal({
  method,
  onClose,
  onSave,
}: {
  method: WithdrawMethod | null;
  onClose: () => void;
  onSave: (m: WithdrawMethod) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState(method?.method_name || "");
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted || !method) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!method) return; // ✅ early exit if null

    const res = await editWithdrawalMethods(method.id, { method_name: name });
    if (res?.success) {
      toast("success", "Saved", "Method updated successfully");
      onSave({ ...method, method_name: name });
      onClose();
    } else {
      toast("error", "Error", "Failed to update");
    }
  }


  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cx(glass.surface, "relative z-10 w-full max-w-md space-y-4")}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Method</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-white/30 bg-white/80 dark:bg-white/[0.08] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={cx(glass.btn, glass.btnNeutral)}>
              Cancel
            </button>
            <button type="submit" className={cx(glass.btn, glass.btnPrimary)}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/* -------------------------------------------------------------------------- */
/*                          Card List for Withdrawal Methods                  */
/* -------------------------------------------------------------------------- */
function MethodsList({ initial }: { initial: WithdrawMethod[] }) {
  const [data, setData] = useState(initial);
  const [editMethod, setEditMethod] = useState<WithdrawMethod | null>(null);

  return (
    <div className="grid gap-4">
      {data.map((item) => (
        <div key={item.id} className={glass.surface}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {item.method_name}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill
                id={item.id}
                status={item.isActive}
                onChange={(val) =>
                  setData((prev) =>
                    prev.map((m) => (m.id === item.id ? { ...m, isActive: val } : m))
                  )
                }
              />
              <button
                onClick={() => setEditMethod(item)}
                className="p-2 rounded-lg border border-white/20 bg-white/60 dark:bg-white/[0.08] hover:bg-white/80 dark:hover:bg-white/[0.12]"
              >
                <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {data.length === 0 && (
        <div className={glass.surface}>
          <p className="text-center text-slate-500 dark:text-slate-400">No Withdrawal Methods found</p>
        </div>
      )}

      {editMethod && (
        <EditModal
          method={editMethod}
          onClose={() => setEditMethod(null)}
          onSave={(updated) =>
            setData((prev) =>
              prev.map((m) => (m.id === updated.id ? updated : m))
            )
          }
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */
export default function WithdrawalMethodsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState<WithdrawMethod[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getWithdrawalMethods();
        if (mounted) setMethods(res?.methods ?? []);
      } catch {
        toast("error", "Error", "Failed to load withdrawal methods");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  return (
    <div className="relative min-h-screen overflow-hidden p-6 space-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-32 h-[20rem] w-[20rem] rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-32 h-[20rem] w-[20rem] rounded-full bg-purple-400/10 blur-3xl" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Withdrawal Methods</h1>

      {loading ? <div className={glass.surface}>Loading...</div> : <MethodsList initial={methods} />}
    </div>
  );
}

