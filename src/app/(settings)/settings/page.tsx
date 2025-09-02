"use client"

import type * as React from "react"
import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { getSystemFlags, updateSystemFlag } from "./fetch"
import { uploadImage } from "@/upload"

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

function EmptyState({ title, description }: { title: string; description?: string }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="text-2xl font-semibold text-foreground/80">{title}</div>
            {description ? <p className="text-muted-foreground mt-2 max-w-md">{description}</p> : null}
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-8 w-40 bg-muted rounded" />
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="h-5 w-48 bg-muted rounded" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="h-8 w-full bg-muted rounded" />
                            <div className="h-4 w-2/3 bg-muted rounded" />
                            <div className="flex justify-end">
                                <div className="h-9 w-20 bg-muted rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function SystemFlagsPage() {
    const { toast } = useToast()

    // local state instead of SWR
    const [groups, setGroups] = useState<FlagGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadFlags = async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await getSystemFlags()
            setGroups(res.groups)
        } catch (err: any) {
            setError(err.message ?? "Failed to fetch system flags")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadFlags()
    }, [])

    const parentGroups = useMemo(() => groups.filter((g) => g.parentFlagGroupId === null), [groups])

    const [activeTab, setActiveTab] = useState<string | null>(null)
    useEffect(() => {
        if (!activeTab && parentGroups.length) {
            setActiveTab(String(parentGroups[0].id))
        }
    }, [parentGroups, activeTab])

    // Editing state
    const [editingId, setEditingId] = useState<number | null>(null)
    const [formData, setFormData] = useState<Partial<SystemFlag>>({})
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [uploadBusy, setUploadBusy] = useState(false)
    const startEdit = (flag: SystemFlag) => {
        setEditingId(flag.id)
        setFormData({ ...flag })
        setFilePreview(flag.value ?? null)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setFormData({})
        setFilePreview(null)
        setUploadBusy(false)
    }

    const onFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const onRadioChange = (value: string) => {
        setFormData((prev) => ({ ...prev, value }))
    }

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            setUploadBusy(true)
            const localUrl = URL.createObjectURL(file)
            setFilePreview(localUrl)
            // upload & set server path
            const uploadedUrl = await uploadImage(file, "images")
            setFormData((prev) => ({ ...prev, value: uploadedUrl.path }))
            toast({ title: "Uploaded", description: "Image uploaded successfully." + uploadedUrl.path })
        } catch (err: any) {
            toast({
                title: "Upload failed",
                description: err?.message ?? "Please try again.",
                variant: "destructive",
            })
        } finally {
            setUploadBusy(false)
        }
    }

    const saveEdit = async (id: number) => {
        try {
            const result = await updateSystemFlag(id, formData);
            if (!result?.status) throw new Error(result?.message || "Update failed")
            toast({ title: "Saved", description: "Flag updated successfully." })
            cancelEdit()
            loadFlags()
        } catch (err: any) {
            toast({
                title: "Update failed",
                description: err?.message ?? "Please try again.",
                variant: "destructive",
            })
        }
    }

    const isMasterImageGroup = (g: FlagGroup) =>
        (g.flagGroupName ?? "").toLowerCase().includes("masterimage")

    const renderInput = (flag: SystemFlag) => {
        const type = flag.valueType?.toLowerCase()
        if (editingId !== flag.id) {
            return <div className="text-sm text-muted-foreground break-words">{flag.value ?? "—"}</div>
        }

        switch (type) {
            case "text":
                return (
                    <Input
                        name="value"
                        value={formData.value ?? ""}
                        onChange={onFieldChange}
                        placeholder="Enter value"
                        className="bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                )
            case "number":
                return (
                    <Input
                        type="number"
                        name="value"
                        value={formData.value ?? ""}
                        onChange={onFieldChange}
                        placeholder="0"
                        inputMode="numeric"
                        className="bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                )
            case "radio": {
                const options = (flag.value ?? "")
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean)
                const current = (formData.value ?? "").toString()
                return options.length ? (
                    <RadioGroup value={current} onValueChange={onRadioChange} className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {options.map((opt, idx) => (
                            <div key={`${flag.id}-${idx}`} className="flex items-center space-x-2">
                                <RadioGroupItem id={`${flag.id}-${idx}`} value={opt} />
                                <Label htmlFor={`${flag.id}-${idx}`}>{opt}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                ) : (
                    <div className="text-sm text-muted-foreground">No options available.</div>
                )
            }
            case "file":
                // NOTE: normal file-type flags (non-masterimage) also use upload flow
                return (
                    <div className="space-y-3">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={onFileChange}
                            disabled={uploadBusy}
                            className="bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                        {filePreview ? (
                            <div className="flex items-center gap-3">
                                <img src={filePreview} alt="Selected preview" className="h-16 w-16 rounded-md object-cover border" />
                                <div className="text-sm text-muted-foreground">
                                    {uploadBusy ? "Uploading..." : "Preview"}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )
            default:
                return (
                    <Textarea
                        name="value"
                        value={formData.value ?? ""}
                        onChange={onFieldChange}
                        placeholder="Enter value"
                        className="bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary min-h-24"
                    />
                )
        }
    }

    if (loading) return <LoadingSkeleton />
    if (error) {
        return <EmptyState title="Unable to load system flags" description={error} />
    }
    if (!groups.length) {
        return (
            <EmptyState
                title="No system flags found"
                description="Once flags are available, they will appear here for editing."
            />
        )
    }

    const buildImgSrc = (val?: string | null) => {
        if (!val) return "/placeholder.svg"
        return `${process.env.NEXT_PUBLIC_BASEURL}${val}`
    }

    return (
        <main className="container mx-auto py-8">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-balance">System Flags</h1>
                    <p className="text-sm text-muted-foreground">Manage application-wide feature toggles and configuration values.</p>
                </div>
            </header>

            <Separator className="mb-6" />

            <Tabs value={activeTab ?? undefined} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start overflow-x-auto bg-muted/30 p-1 rounded-lg">
                    {parentGroups.map((pg) => (
                        <TabsTrigger
                            key={pg.id}
                            value={String(pg.id)}
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-4 py-2 transition-colors"
                        >
                            {pg.flagGroupName || `Group ${pg.id}`}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {parentGroups.map((pg) => {
                    const generalFlags = groups.find((g) => g.id === pg.id)?.systemflags ?? []
                    const children = groups.filter((g) => g.parentFlagGroupId === pg.id)

                    // ---- MASTERIMAGE special rendering (card grid + upload per card) ----
                    if (isMasterImageGroup(pg)) {
                        // combine own + children flags for a unified gallery (optional)
                        const childFlags = children.flatMap((c) => c.systemflags || [])
                        const allFlags = [...generalFlags, ...childFlags]

                        return (
                            <TabsContent key={pg.id} value={String(pg.id)} className="mt-6 space-y-6">
                                <Card className="bg-white dark:bg-slate-900 shadow-md border border-border rounded-xl">
                                    <CardHeader className="bg-muted/40 dark:bg-slate-800/50 rounded-t-xl px-4 py-3">
                                        <CardTitle className="text-lg font-semibold">Master Images</CardTitle>
                                        {pg.description ? <CardDescription>{pg.description}</CardDescription> : null}
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {allFlags.length ? (
                                            <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                                {allFlags.map((flag) => {
                                                    const isEditing = editingId === flag.id
                                                    const imgSrc = isEditing
                                                        ? filePreview || buildImgSrc(flag.value)
                                                        : buildImgSrc(flag.value)

                                                    return (
                                                        <div
                                                            key={flag.id}
                                                            className="flex flex-col items-center justify-between border border-border rounded-lg p-3 bg-background/50"
                                                        >
                                                            {/* Thumbnail */}
                                                            <img
                                                                src={imgSrc}
                                                                alt={flag.displayName ?? flag.name ?? `Image ${flag.id}`}
                                                                className="h-20 w-20 object-cover rounded-md border"
                                                            />

                                                            {/* Title */}
                                                            <div className="mt-2 text-xs font-medium text-center">
                                                                {flag.displayName || flag.name || `Flag ${flag.id}`}
                                                            </div>

                                                            {/* Edit / Upload */}
                                                            {isEditing ? (
                                                                <div className="mt-2 w-full space-y-2">
                                                                    <Input type="file" accept="image/*" onChange={onFileChange} />
                                                                    <div className="flex justify-between gap-2">
                                                                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                                                                            Cancel
                                                                        </Button>
                                                                        <Button size="sm" onClick={() => saveEdit(flag.id)}>
                                                                            Save
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    className="mt-2 "
                                                                    onClick={() => startEdit(flag)}
                                                                >
                                                                    Change
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                        ) : (
                                            <EmptyState title="No images" description="Add images by editing flags in this group." />
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )
                    }

                    // ---- DEFAULT rendering for non-masterimage groups: list + children cards ----
                    return (
                        <TabsContent key={pg.id} value={String(pg.id)} className="mt-6 space-y-6">
                            {generalFlags.length > 0 && (
                                <Card className="bg-white dark:bg-slate-900 shadow-md border border-border rounded-xl">
                                    <CardHeader className="bg-muted/40 dark:bg-slate-800/50 rounded-t-xl px-4 py-3">
                                        <CardTitle>General Settings</CardTitle>
                                        {pg.description ? <CardDescription>{pg.description}</CardDescription> : null}
                                    </CardHeader>
                                    <CardContent className="space-y-6 p-6">
                                        {generalFlags.map((flag) => (
                                            <div key={flag.id} className="space-y-2 bg-gray-100 p-4 rounded-lg">
                                                <Label className="font-medium">
                                                    {flag.displayName || flag.name || `Flag ${flag.id}`}
                                                </Label>
                                                {renderInput(flag)}
                                                {flag.description ? <p className="text-xs text-muted-foreground">{flag.description}</p> : null}
                                                <div className="flex justify-end gap-2 pt-2">
                                                    {editingId === flag.id ? (
                                                        <>
                                                            <Button variant="outline" onClick={cancelEdit} disabled={uploadBusy}>
                                                                Cancel
                                                            </Button>
                                                            <Button className="text-white" onClick={() => saveEdit(flag.id)} disabled={uploadBusy}>
                                                                {uploadBusy ? "Uploading..." : "Save"}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button variant="secondary" onClick={() => startEdit(flag)}>
                                                            Edit
                                                        </Button>
                                                    )}
                                                </div>
                                                <Separator className="mt-4" />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {children.length ? (
                                <div className="grid gap-6 md:grid-cols-2">
                                    {children.map((child) => (
                                        <Card key={child.id} className="bg-white dark:bg-slate-900 shadow-md border border-border rounded-xl">
                                            <CardHeader className="bg-muted/40 dark:bg-slate-800/50 rounded-t-xl px-4 py-3">
                                                <CardTitle>{child.flagGroupName || `Group ${child.id}`}</CardTitle>
                                                {child.description ? <CardDescription>{child.description}</CardDescription> : null}
                                            </CardHeader>
                                            <CardContent className="space-y-6 p-6">
                                                {child.systemflags.map((flag) => (
                                                    <div key={flag.id} className="space-y-2 bg-gray-100 p-4 rounded-lg">
                                                        <Label className="font-medium">{flag.displayName || flag.name || `Flag ${flag.id}`}</Label>
                                                        {renderInput(flag)}
                                                        {flag.description ? (
                                                            <p className="text-xs text-muted-foreground">{flag.description}</p>
                                                        ) : null}
                                                        <div className="flex justify-end gap-2 pt-2">
                                                            {editingId === flag.id ? (
                                                                <>
                                                                    <Button variant="outline" onClick={cancelEdit} disabled={uploadBusy}>
                                                                        Cancel
                                                                    </Button>
                                                                    <Button onClick={() => saveEdit(flag.id)} disabled={uploadBusy}>
                                                                        {uploadBusy ? "Uploading..." : "Save"}
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Button variant="secondary" onClick={() => startEdit(flag)}>
                                                                    Edit
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <Separator className="mt-4" />
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                !generalFlags.length && (
                                    <EmptyState
                                        title="No settings in this group"
                                        description="Try switching to another group to view or edit its flags."
                                    />
                                )
                            )}
                        </TabsContent>
                    )
                })}
            </Tabs>
        </main>
    )
}
