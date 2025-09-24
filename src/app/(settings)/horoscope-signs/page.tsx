
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useToast } from "@/components/Toast/ToastProvider"   // ✅ fixed import
import { gethororscope, updatehororscope } from "./fetch"
import { uploadImage } from "@/upload"
import { Edit3, X, Save, Upload } from "lucide-react"

/* =========================
   Helpers
========================= */
const buildImgSrc = (val?: string) => {
  if (!val) return "/placeholder.svg"
  if (/^(blob:|data:|https?:\/\/)/i.test(val)) return val
  return `${process.env.NEXT_PUBLIC_BASEURL || ""}${val}`
}

/* =========================
   Glass UI Atoms
========================= */
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`
      relative overflow-hidden rounded-2xl
      bg-white/70 dark:bg-slate-800/50
      border border-slate-200/80 dark:border-white/10
      shadow-[0_8px_20px_-6px_rgba(0,0,0,0.15)]
      backdrop-blur-xl
      transition-all duration-200
      hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.22)] hover:-translate-y-0.5
      ${className}
    `}
  >
    {children}
  </div>
)

const GlowButton = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  icon: Icon,
  className = "",
  type = "button",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md"
  disabled?: boolean
  loading?: boolean
  icon?: React.ElementType
  className?: string
  type?: "button" | "submit"
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-sm",
    secondary:
      "bg-white/80 dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 hover:bg-white",
    ghost:
      "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-700/50 border border-transparent",
  }
  const sizes = { sm: "h-8 px-3 text-xs rounded-lg", md: "h-10 px-4 text-sm rounded-lg" }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 font-medium transition-all active:scale-[0.98]
        ${variants[variant]} ${sizes[size]}
        ${disabled || loading ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02]"}
        ${className}
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {children}
    </button>
  )
}

/* =========================
   Glass Modal
========================= */
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
  const dialogRef = useRef<HTMLDivElement | null>(null)

  // Close on ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        ref={dialogRef}
        className={`
          relative w-full max-w-lg overflow-hidden
          rounded-3xl border border-slate-200/80 dark:border-white/10
          bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl
          shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <GlowButton variant="ghost" size="sm" onClick={onClose} icon={X}>
            Close
          </GlowButton>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

/* =========================
   Main Component
========================= */
export default function DefaultProfilesPage() {
  const toast = useToast()   // ✅ using your provider
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState<string>("")
  const [editFile, setEditFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadBusy, setUploadBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await gethororscope()
    setProfiles(res.hororscope || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openEditor = (p: any) => {
    setEditingId(p.id)
    setEditingName(p.name || "")
    setPreview(buildImgSrc(p.image))
    setEditFile(null)
  }
  const closeEditor = () => {
    setEditingId(null)
    setEditingName("")
    setPreview(null)
    setEditFile(null)
    setUploadBusy(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleUpdate = async () => {
    if (editingId == null) return
    try {
      setUploadBusy(true)
      let pathToSave: string | undefined

      if (editFile) {
        const uploaded = await uploadImage(editFile, "images")
        pathToSave = uploaded.path
      } else if (preview && !/^blob:|^data:/i.test(preview)) {
        pathToSave = (preview || "").replace(process.env.NEXT_PUBLIC_BASEURL || "", "")
      }

      if (!pathToSave) {
        toast("error", "No image", "Please choose an image to upload.")   // ✅ your toast signature
        setUploadBusy(false)
        return
      }

      const res = await updatehororscope(editingId, pathToSave)
      if (res?.status) {
        toast("success", "Updated", "Profile updated")
        closeEditor()
        await load()
      } else {
        toast("error", "Error", res?.message || "Update failed")
      }
    } catch (e: any) {
      toast("error", "Error", e?.message || "Update failed")
    } finally {
      setUploadBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-slate-600 dark:text-slate-400">Loading…</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-10 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Horoscope Signs</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage and update default horoscope sign profiles.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {profiles.map((p) => {
            const imgSrc = buildImgSrc(p.image)
            return (
              <GlassCard key={p.id} className="flex flex-col items-center p-5">
                <div className="relative group">
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className="h-20 w-20 rounded-xl object-cover border border-slate-200/80 dark:border-white/10 shadow"
                    onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100 text-center">
                  {p.name}
                </div>

                <GlowButton
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={() => openEditor(p)}
                  icon={Edit3}
                >
                  Change
                </GlowButton>
              </GlassCard>
            )
          })}
        </div>
      </div>

      <GlassModal
        open={editingId !== null}
        onClose={closeEditor}
        title={editingName ? `Edit ${editingName}` : "Edit Profile"}
      >
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            handleUpdate()
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10">
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Upload new image
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                <span
                  className={`
                    inline-flex items-center gap-2 px-3 py-2 text-xs rounded-lg
                    bg-white/90 dark:bg-slate-700/60 text-slate-800 dark:text-slate-100
                    border border-slate-200 dark:border-slate-600 hover:bg-white
                  `}
                >
                  <Upload size={14} />
                  Choose file
                </span>
              </label>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                PNG/JPG recommended. Max 5MB.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <GlowButton variant="ghost" size="md" onClick={closeEditor} icon={X}>
              Cancel
            </GlowButton>
            <GlowButton
              variant="primary"
              size="md"
              type="submit"
              disabled={uploadBusy}
              loading={uploadBusy}
              icon={!uploadBusy ? Save : undefined}
            >
              {uploadBusy ? "Saving…" : "Save"}
            </GlowButton>
          </div>
        </form>
      </GlassModal>
    </main>
  )
}
