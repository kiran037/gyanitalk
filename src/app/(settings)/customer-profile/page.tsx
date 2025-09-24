
"use client"

import { useEffect, useState, useCallback } from "react"
import { useToast } from "@/components/Toast/ToastProvider"
import { getDefaultProfiles, updateDefaultProfiles } from "./fetch"
import { uploadImage } from "@/upload"
import { Edit3, Save, X, Upload } from "lucide-react"

/* =======================
   Types
======================= */
type DefaultProfile = {
  id: number
  name: string
  profile: string
  isActive: boolean
}

/* =======================
   Helpers
======================= */
const buildImgSrc = (val?: string) => {
  if (!val) return "/placeholder.svg"
  if (/^(blob:|data:|https?:\/\/)/i.test(val)) return val
  return `${process.env.NEXT_PUBLIC_BASEURL}${val}`
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
      p-5 flex flex-col items-center
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
      "bg-white/90 dark:bg-slate-700/70 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600 hover:bg-white",
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
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
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
export default function DefaultProfilesPage() {
  const toast = useToast()
  const [profiles, setProfiles] = useState<DefaultProfile[]>([])
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState<DefaultProfile | null>(null)
  const [editFile, setEditFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadBusy, setUploadBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await getDefaultProfiles()
    setProfiles(res.profiles || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleUpdate = async () => {
    if (!editing) return
    try {
      setUploadBusy(true)
      if (!editFile) {
        toast("warning", "No file", "Please select an image")
        return
      }
      const uploaded = await uploadImage(editFile, "images")
      const res = await updateDefaultProfiles(editing.id, uploaded.path)
      if (res.status) {
        toast("success", "Updated", "Profile updated successfully")
        setEditing(null)
        setEditFile(null)
        setPreview(null)
        load()
      } else {
        toast("error", "Error", res.message || "Update failed")
      }
    } catch (err: any) {
      toast("error", "Error", err?.message || "Something went wrong")
    } finally {
      setUploadBusy(false)
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
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Default Profiles</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage and update default profile images.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {profiles.map((p) => (
            <GlassCard key={p.id}>
              <img
                src={buildImgSrc(p.profile)}
                alt={p.name}
                className="h-20 w-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
              />
              <div className="mt-2 text-sm font-medium text-center text-slate-900 dark:text-slate-100">
                {p.name}
              </div>
              <GlowButton variant="secondary" className="mt-3" onClick={() => setEditing(p)}>
                <Edit3 size={14} /> Change
              </GlowButton>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Modal */}
      <GlassModal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.name}`}>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            handleUpdate()
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
              <img
                src={preview || buildImgSrc(editing?.profile)}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            </div>
            <label className="flex-1 text-xs text-slate-700 dark:text-slate-300">
              Upload new image
              <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm" />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <GlowButton variant="ghost" onClick={() => setEditing(null)}>
              <X size={14} /> Cancel
            </GlowButton>
            <GlowButton type="submit" variant="primary" disabled={uploadBusy} loading={uploadBusy}>
              <Save size={14} /> {uploadBusy ? "Saving…" : "Save"}
            </GlowButton>
          </div>
        </form>
      </GlassModal>
    </main>
  )
}
