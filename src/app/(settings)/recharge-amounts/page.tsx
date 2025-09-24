
"use client"

import { useEffect, useState, useCallback } from "react"
import { useToast } from "@/components/Toast/ToastProvider"
import {
  getrechargeamount,
  createrechargeamount,
  updaterechargeamount,
} from "./fetch"
import { Plus, X, Save, Edit3 } from "lucide-react"

/* =======================
   Types
======================= */
type Recharge = {
  id: number
  amount: number
  cashback?: number | null
}

/* =======================
   Glass Atoms
======================= */
const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <div
    className={`
      relative rounded-2xl overflow-hidden
      bg-white/70 dark:bg-slate-800/50
      border border-slate-200/80 dark:border-white/10
      backdrop-blur-xl shadow-md
      transition-all duration-200
      hover:shadow-xl hover:-translate-y-0.5
      p-5
    `}
  >
    {children}
  </div>
)

const GlowButton = ({
  children,
  onClick,
  variant = "primary",
  disabled,
  loading,
  type = "button",
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost"
  disabled?: boolean
  loading?: boolean
  type?: "button" | "submit"
  className?: string
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700",
    secondary:
      "bg-white/90 dark:bg-slate-700/70 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600",
    ghost:
      "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-700/50",
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium
        transition-all active:scale-[0.98]
        ${variants[variant]}
        ${disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02]"}
        ${className}
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  )
}

/* =======================
   Glass Modal
======================= */
function GlassModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[2000] flex items-center justify-center px-4 py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        className={`
          relative w-full max-w-md rounded-2xl
          border border-slate-200/80 dark:border-white/10
          bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl
          shadow-2xl overflow-hidden
        `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
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
  )
}

/* =======================
   Main Page
======================= */
export default function RechargePage() {
  const toast = useToast()
  const [items, setItems] = useState<Recharge[]>([])
  const [loading, setLoading] = useState(true)

  // Add modal state
  const [addOpen, setAddOpen] = useState(false)
  const [newAmount, setNewAmount] = useState("")
  const [newCashback, setNewCashback] = useState("")
  const [saving, setSaving] = useState(false)

  // Edit modal state
  const [editing, setEditing] = useState<Recharge | null>(null)
  const [editAmount, setEditAmount] = useState("")
  const [editCashback, setEditCashback] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const res = await getrechargeamount()
    setItems(res.rechargeamount)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    try {
      setSaving(true)
      const res = await createrechargeamount({
        amount: parseInt(newAmount, 10),
        cashback: newCashback ? parseInt(newCashback, 10) : undefined,
      })
      if (res.status) {
        toast("success", "Added", "Recharge amount created")
        setAddOpen(false)
        setNewAmount("")
        setNewCashback("")
        load()
      } else {
        toast("error", "Error", res.message || "Failed to add")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editing) return
    try {
      setSaving(true)
      const res = await updaterechargeamount(editing.id, {
        amount: parseInt(editAmount, 10),
        cashback: editCashback ? parseInt(editCashback, 10) : undefined,
      })
      if (res.status) {
        toast("success", "Updated", "Recharge amount updated")
        setEditing(null)
        load()
      } else {
        toast("error", "Error", res.message || "Failed to update")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading…</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-10 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Recharge Amounts
          </h1>
          <GlowButton variant="primary" onClick={() => setAddOpen(true)}>
            <Plus size={16} /> Add Recharge
          </GlowButton>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <GlassCard key={item.id}>
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
              <div className="flex justify-end mt-4">
                <GlowButton
                  variant="secondary"
                  onClick={() => {
                    setEditing(item)
                    setEditAmount(item.amount.toString())
                    setEditCashback(item.cashback?.toString() || "")
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
            e.preventDefault()
            handleCreate()
          }}
        >
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Amount
            </label>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/70 p-2 text-sm"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Cashback
            </label>
            <input
              type="number"
              value={newCashback}
              onChange={(e) => setNewCashback(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/70 p-2 text-sm"
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
        title={`Edit Recharge #${editing?.id}`}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleUpdate()
          }}
        >
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Amount
            </label>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/70 p-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Cashback
            </label>
            <input
              type="number"
              value={editCashback}
              onChange={(e) => setEditCashback(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/70 p-2 text-sm"
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
  )
}
