
"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { getSystemFlags, updateSystemFlag } from "./fetch"
import { uploadImage } from "@/upload"
import { useToast } from "@/components/Toast/ToastProvider"
import {
  Settings, Upload, X, Edit3, Save, Image as ImageIcon,
  Radio as RadioIcon, FileText, Hash, Palette, Globe, Shield, Zap
} from "lucide-react"

/* =========================
   Types (unchanged)
========================= */
type SystemFlag = {
  id: number
  name: string | null
  displayName: string | null
  value: string | null
  valueType: string | null
  description: string | null
  isActive: string | null
  flagGroupId: number
}

type FlagGroup = {
  id: number
  flagGroupName: string | null
  parentFlagGroupId: number | null
  description: string | null
  systemflags: SystemFlag[]
}

/* =========================
   Helpers (unchanged)
========================= */
const isMasterImageGroup = (g: FlagGroup) =>
  (g.flagGroupName ?? "").toLowerCase().includes("masterimage")

const buildImgSrc = (val?: string | null) => {
  if (!val) return "/placeholder.svg"
  if (val.startsWith("blob:") || val.startsWith("data:") || /^https?:\/\//i.test(val)) return val
  return `${process.env.NEXT_PUBLIC_BASEURL || ""}${val}`
}

const getTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "file": return ImageIcon
    case "radio": return RadioIcon
    case "number": return Hash
    case "text": return FileText
    default: return FileText
  }
}

const getGroupIcon = (name: string) => {
  const lower = (name || "").toLowerCase()
  if (lower.includes("image") || lower.includes("media")) return Palette
  if (lower.includes("security") || lower.includes("auth")) return Shield
  if (lower.includes("api") || lower.includes("service")) return Globe
  if (lower.includes("performance") || lower.includes("cache")) return Zap
  return Settings
}

/* =========================
   UI atoms (theme-aligned)
   - Surfaces: white / gray-800
   - Borders: gray-200 / gray-700
   - Primary: purple-600 → pink-600 (like your other pages)
========================= */
const Surface = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${className}`}>
    {children}
  </div>
)

const Section = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
  <Surface>
    <div className="px-4 py-3 rounded-t-2xl border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      {desc ? <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{desc}</p> : null}
    </div>
    <div className="p-4">{children}</div>
  </Surface>
)

const Button = ({
  children, onClick, type = "button", variant = "primary", size = "md", disabled = false, icon: Icon, loading = false, className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit"
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  icon?: React.ElementType
  loading?: boolean
  className?: string
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }
  const sizes = {
    sm: "h-8 px-3 text-xs rounded-lg",
    md: "h-10 px-4 text-sm rounded-lg",
    lg: "h-12 px-5 text-base rounded-lg",
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${sizes[size]} ${variants[variant]} inline-flex items-center gap-2 font-medium transition-colors ${disabled || loading ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (Icon ? <Icon size={16} /> : null)}
      {children}
    </button>
  )
}

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={[
      "w-full rounded-lg",
      "border border-gray-300 dark:border-gray-600",
      "bg-white dark:bg-gray-800",
      "px-3 py-2 text-sm text-gray-900 dark:text-gray-100",
      "placeholder:text-gray-400 dark:placeholder:text-gray-500",
      "focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent",
      props.className || "",
    ].join(" ")}
  />
)

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={[
      "w-full rounded-lg",
      "border border-gray-300 dark:border-gray-600",
      "bg-white dark:bg-gray-800",
      "px-3 py-2 text-sm text-gray-900 dark:text-gray-100",
      "placeholder:text-gray-400 dark:placeholder:text-gray-500",
      "focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent",
      "min-h-24",
      props.className || "",
    ].join(" ")}
  />
)

/* =========================
   Main Component
========================= */
export default function SystemFlagsPage() {
  const toast = useToast()
  const [groups, setGroups] = useState<FlagGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<SystemFlag>>({})
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const loadFlags = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getSystemFlags()
      setGroups(res?.groups || [])
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch system flags")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFlags()
  }, [loadFlags])

  const parents = useMemo(() => groups.filter((g) => g.parentFlagGroupId === null), [groups])

  useEffect(() => {
    if (!activeTab && parents.length) setActiveTab(String(parents[0].id))
  }, [parents, activeTab])

  const startEdit = (flag: SystemFlag) => {
    setEditingId(flag.id)
    setFormData({ ...flag })
    setFilePreview(flag.value ? buildImgSrc(flag.value) : null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({})
    setFilePreview(null)
    setBusy(false)
  }

  const onFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onRadioChange = (value: string) => setFormData((prev) => ({ ...prev, value }))

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setBusy(true)
      const localUrl = URL.createObjectURL(file)
      setFilePreview(localUrl)
      const uploaded = await uploadImage(file, "images")
      setFormData((prev) => ({ ...prev, value: uploaded.path }))
      toast("success", "Uploaded", "Image uploaded successfully.")
    } catch (err: any) {
      setFilePreview(null)
      toast("error", "Upload failed", err?.message ?? "Please try again.")
    } finally {
      setBusy(false)
    }
  }

  const saveEdit = async (id: number) => {
    try {
      setBusy(true)
      const result = await updateSystemFlag(id, formData)
      if (!result?.status) throw new Error(result?.message || "Update failed")
      toast("success", "Saved", "Flag updated successfully.")
      cancelEdit()
      await loadFlags()
    } catch (err: any) {
      toast("error", "Update failed", err?.message ?? "Please try again.")
    } finally {
      setBusy(false)
    }
  }

  const renderInput = (flag: SystemFlag) => {
    const type = (flag.valueType || "").toLowerCase()
    const editing = editingId === flag.id
    const TypeIcon = getTypeIcon(type)

    if (!editing) {
      if (type === "file") {
        const src = buildImgSrc(flag.value)
        return (
          <img
            src={src}
            alt={(flag.displayName || flag.name || "Image") ?? "Image"}
            className="h-20 w-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
          />
        )
      }
      return (
        <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
          <TypeIcon size={16} className="text-gray-500" />
          <span className="break-words">{flag.value ?? "—"}</span>
        </div>
      )
    }

    switch (type) {
      case "text":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FileText size={16} className="text-gray-500" /> Value
            </label>
            <Input name="value" value={formData.value ?? ""} onChange={onFieldChange} placeholder="Enter value" />
          </div>
        )
      case "number":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Hash size={16} className="text-gray-500" /> Value
            </label>
            <Input type="number" name="value" value={formData.value ?? ""} onChange={onFieldChange} placeholder="0" inputMode="numeric" />
          </div>
        )
      case "radio": {
        const options = (flag.value ?? "").split(",").map((v) => v.trim()).filter(Boolean)
        const current = (formData.value ?? "").toString()
        return options.length ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <RadioIcon size={16} /> Select an option
            </div>
            <div className="flex flex-wrap gap-2">
              {options.map((opt, i) => {
                const checked = current === opt
                return (
                  <button
                    key={`${flag.id}-${i}`}
                    type="button"
                    onClick={() => onRadioChange(opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      checked
                        ? "border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No options available.</div>
        )
      }
      case "file":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={filePreview || buildImgSrc(flag.value)}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <Upload size={16} className="text-gray-500" /> Upload new image
                </label>
                <Input type="file" accept="image/*" onChange={onFileChange} disabled={busy} />
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FileText size={16} className="text-gray-500" /> Value
            </label>
            <Textarea name="value" value={formData.value ?? ""} onChange={onFieldChange} placeholder="Enter value" />
          </div>
        )
    }
  }

  /* =========================
     UI (theme-aligned)
  ========================= */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-md">
              <Settings size={24} className="text-white" />
            </div>
            <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Surface key={i}>
                <div className="p-6 space-y-4">
                  <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </Surface>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <Surface>
            <div className="p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 text-white">
                <X size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Unable to load system flags</h2>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <Button variant="secondary" onClick={loadFlags} className="mx-auto">Try again</Button>
            </div>
          </Surface>
        </div>
      </main>
    )
  }

  if (!groups.length) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <Surface>
            <div className="p-12 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-700">
                <Settings size={24} className="text-gray-600 dark:text-gray-300" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No system flags found</h2>
              <p className="text-gray-600 dark:text-gray-400">Once flags are available, they will appear here for editing.</p>
            </div>
          </Surface>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-md">
            <Settings size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">System Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage application-wide settings, toggles, and configuration values.</p>
        </div>

        {/* Tabs */}
        <Surface>
          <div className="p-2 overflow-x-auto">
            <div className="flex gap-2">
              {parents.map((pg) => {
                const GroupIcon = getGroupIcon(pg.flagGroupName || "")
                const isActive = activeTab === String(pg.id)
                return (
                  <button
                    key={pg.id}
                    onClick={() => setActiveTab(String(pg.id))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap border transition-colors
                      ${isActive
                        ? "border-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    <GroupIcon size={16} />
                    {pg.flagGroupName || `Group ${pg.id}`}
                  </button>
                )
              })}
            </div>
          </div>
        </Surface>

        {/* Content per group */}
        {parents.map((pg) => {
          if (activeTab !== String(pg.id)) return null

          const generalFlags = groups.find((g) => g.id === pg.id)?.systemflags ?? []
          const children = groups.filter((g) => g.parentFlagGroupId === pg.id)

          // Master Images
          if (isMasterImageGroup(pg)) {
            const allFlags = [...generalFlags, ...children.flatMap((c) => c.systemflags || [])]
            return (
              <Section key={pg.id} title="Master Images" desc={pg.description || "Manage your application's image assets"}>
                {allFlags.length ? (
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {allFlags.map((flag) => {
                      const editing = editingId === flag.id
                      const src = editing ? filePreview || buildImgSrc(flag.value) : buildImgSrc(flag.value)
                      return (
                        <Surface key={flag.id}>
                          <div className="p-4">
                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700">
                              <img
                                src={src}
                                alt={(flag.displayName || flag.name || "image") ?? "image"}
                                className="w-full h-full object-cover"
                                onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                              />
                            </div>
                            <div className="mt-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {flag.displayName || flag.name || `Flag ${flag.id}`}
                                </h3>
                              </div>
                              {editing ? (
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={busy} icon={X}>Cancel</Button>
                                  <Button variant="primary" size="sm" onClick={() => saveEdit(flag.id)} disabled={busy} loading={busy} icon={busy ? undefined : Save}>
                                    {busy ? "Saving..." : "Save"}
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="secondary" size="sm" onClick={() => startEdit(flag)} icon={Edit3}>Edit</Button>
                              )}
                            </div>

                            {editing && (
                              <div className="mt-3">
                                <Input type="file" accept="image/*" onChange={onFileChange} disabled={busy} />
                              </div>
                            )}
                          </div>
                        </Surface>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-600 dark:text-gray-400">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 mb-2">
                      <ImageIcon size={18} className="text-gray-500 dark:text-gray-300" />
                    </div>
                    No images in this group.
                  </div>
                )}
              </Section>
            )
          }

          // Default groups
          return (
            <div key={pg.id} className="space-y-8">
              {/* General Settings */}
              {generalFlags.length > 0 && (
                <Section title="General Settings" desc={pg.description || "Core application configuration"}>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {generalFlags.map((flag) => {
                      const editing = editingId === flag.id
                      const TypeIcon = getTypeIcon(flag.valueType || "")
                      return (
                        <Surface key={flag.id}>
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700">
                                  <TypeIcon size={16} className="text-gray-600 dark:text-gray-300" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {flag.displayName || flag.name || `Flag ${flag.id}`}
                                  </h3>
                                  {flag.description && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{flag.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0">
                                {editing ? (
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={busy} icon={X}>Cancel</Button>
                                    <Button variant="primary" size="sm" onClick={() => saveEdit(flag.id)} disabled={busy} loading={busy} icon={busy ? undefined : Save}>
                                      {busy ? "Saving..." : "Save"}
                                    </Button>
                                  </div>
                                ) : (
                                  <Button variant="secondary" size="sm" onClick={() => startEdit(flag)} icon={Edit3}>Edit</Button>
                                )}
                              </div>
                            </div>

                            <div className="mt-4">
                              {renderInput(flag)}
                            </div>
                          </div>
                        </Surface>
                      )
                    })}
                  </div>
                </Section>
              )}

              {/* Child Groups */}
              {children.length > 0 && (
                <div className="grid gap-8 lg:grid-cols-2">
                  {children.map((cg) => {
                    const GroupIcon = getGroupIcon(cg.flagGroupName || "")
                    return (
                      <Section key={cg.id} title={cg.flagGroupName || `Group ${cg.id}`} desc={cg.description || undefined}>
                        <div className="space-y-4">
                          {cg.systemflags.map((flag) => {
                            const editing = editingId === flag.id
                            const TypeIcon = getTypeIcon(flag.valueType || "")
                            return (
                              <div key={flag.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700">
                                      <TypeIcon size={14} className="text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {flag.displayName || flag.name || `Flag ${flag.id}`}
                                      </h4>
                                      {flag.description && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{flag.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="shrink-0">
                                    {editing ? (
                                      <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={busy} icon={X}>Cancel</Button>
                                        <Button variant="primary" size="sm" onClick={() => saveEdit(flag.id)} disabled={busy} loading={busy} icon={busy ? undefined : Save}>
                                          {busy ? "Saving..." : "Save"}
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button variant="secondary" size="sm" onClick={() => startEdit(flag)} icon={Edit3}>Edit</Button>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-3">{renderInput(flag)}</div>
                              </div>
                            )
                          })}
                        </div>
                      </Section>
                    )
                  })}
                </div>
              )}

              {!generalFlags.length && !children.length && (
                <Surface>
                  <div className="p-10 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 mb-2">
                      <Settings size={18} className="text-gray-600 dark:text-gray-300" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">No settings in this group.</p>
                  </div>
                </Surface>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
