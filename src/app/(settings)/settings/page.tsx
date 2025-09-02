"use client"

import type * as React from "react"
import useSWR from "swr"
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

type FlagsResponse = { groups: FlagGroup[] }

const fetcher = async (): Promise<FlagsResponse> => {
  const res = await fetch("/api/systemflags", { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load system flags")
  return res.json()
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
  const { data, error, isLoading, mutate } = useSWR<FlagsResponse>("systemflags", fetcher)
  const { toast } = useToast()

  const groups = data?.groups ?? []
  const parentGroups = useMemo(() => groups.filter((g) => g.parentFlagGroupId === null), [groups])

  // Track active tab (parent group id)
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

  const startEdit = (flag: SystemFlag) => {
    setEditingId(flag.id)
    setFormData({ ...flag })
    setFilePreview(flag.value ?? null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({})
    setFilePreview(null)
  }

  const onFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, value }))
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setFilePreview(url)
    // Store filename in value (server can handle actual upload if needed)
    setFormData((prev) => ({ ...prev, value: file.name }))
  }

  const saveEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/systemflags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const result = await res.json()
      if (!result?.status) {
        throw new Error(result?.message || "Update failed")
      }
      toast({
        title: "Saved",
        description: "Flag updated successfully.",
      })
      setEditingId(null)
      setFormData({})
      setFilePreview(null)
      // Refresh list
      mutate()
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderInput = (flag: SystemFlag) => {
    const type = flag.valueType?.toLowerCase()
    if (editingId !== flag.id) {
      return <div className="text-sm text-muted-foreground break-words">{flag.value ?? "—"}</div>
    }

    switch (type) {
      case "text":
        return <Input name="value" value={formData.value ?? ""} onChange={onFieldChange} placeholder="Enter value" />
      case "number":
        return (
          <Input
            type="number"
            name="value"
            value={formData.value ?? ""}
            onChange={onFieldChange}
            placeholder="0"
            inputMode="numeric"
          />
        )
      case "radio": {
        // Derive options from current value string (comma-separated).
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
        return (
          <div className="space-y-3">
            <Input type="file" onChange={onFileChange} />
            {filePreview ? (
              <div className="flex items-center gap-3">
                <img
                  src={filePreview || "/placeholder.svg"}
                  alt="Selected preview"
                  className="h-16 w-16 rounded-md object-cover border"
                />
                <div className="text-sm text-muted-foreground">Preview</div>
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
            className="min-h-24"
          />
        )
    }
  }

  if (isLoading) return <LoadingSkeleton />
  if (error) {
    return (
      <EmptyState
        title="Unable to load system flags"
        description="Please check your connection or try again in a moment."
      />
    )
  }

  if (!groups.length) {
    return (
      <EmptyState
        title="No system flags found"
        description="Once flags are available, they will appear here for editing."
      />
    )
  }

  return (
    <main className="container mx-auto py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">System Flags</h1>
          <p className="text-sm text-muted-foreground">
            Manage application-wide feature toggles and configuration values.
          </p>
        </div>
      </header>

      <Separator className="mb-6" />

      <Tabs value={activeTab ?? undefined} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {parentGroups.map((pg) => (
            <TabsTrigger key={pg.id} value={String(pg.id)} className="whitespace-nowrap">
              {pg.flagGroupName || `Group ${pg.id}`}
            </TabsTrigger>
          ))}
        </TabsList>

        {parentGroups.map((pg) => {
          const generalFlags = groups.find((g) => g.id === pg.id)?.systemflags ?? []
          const children = groups.filter((g) => g.parentFlagGroupId === pg.id)

          return (
            <TabsContent key={pg.id} value={String(pg.id)} className="mt-6 space-y-6">
              {/* General settings under this parent group */}
              {generalFlags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    {pg.description ? <CardDescription>{pg.description}</CardDescription> : null}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {generalFlags.map((flag) => (
                      <div key={flag.id} className="space-y-2">
                        <Label htmlFor={`flag-${flag.id}`} className="font-medium">
                          {flag.displayName || flag.name || `Flag ${flag.id}`}
                        </Label>
                        {renderInput(flag)}
                        {flag.description ? <p className="text-xs text-muted-foreground">{flag.description}</p> : null}
                        <div className="flex justify-end gap-2 pt-2">
                          {editingId === flag.id ? (
                            <>
                              <Button variant="outline" onClick={cancelEdit}>
                                Cancel
                              </Button>
                              <Button onClick={() => saveEdit(flag.id)}>Save</Button>
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

              {/* Child groups under this parent */}
              {children.length ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {children.map((child) => (
                    <Card key={child.id}>
                      <CardHeader>
                        <CardTitle>{child.flagGroupName || `Group ${child.id}`}</CardTitle>
                        {child.description ? <CardDescription>{child.description}</CardDescription> : null}
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {child.systemflags.map((flag) => (
                          <div key={flag.id} className="space-y-2">
                            <Label htmlFor={`flag-${flag.id}`} className="font-medium">
                              {flag.displayName || flag.name || `Flag ${flag.id}`}
                            </Label>
                            {renderInput(flag)}
                            {flag.description ? (
                              <p className="text-xs text-muted-foreground">{flag.description}</p>
                            ) : null}
                            <div className="flex justify-end gap-2 pt-2">
                              {editingId === flag.id ? (
                                <>
                                  <Button variant="outline" onClick={cancelEdit}>
                                    Cancel
                                  </Button>
                                  <Button onClick={() => saveEdit(flag.id)}>Save</Button>
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
