"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Surface,
  Section,
  Button,
  Input,
  Textarea,
} from "./ui";
import {
  buildImgSrc,
  getGroupIcon,
  getTypeIcon,
  isMasterImageGroup,
} from "./helpers";
import {
  Settings,
  Upload,
  X,
  Save,
  Image as ImageIcon,
  Radio as RadioIcon,
  FileText,
  Hash,
} from "lucide-react";

import { getSystemFlags, updateSystemFlag } from "@/app/(settings)/settings/fetch";
import { uploadImage } from "@/upload";
import { useToast } from "@/components/Toast/ToastProvider";

/* =========================
   Types
========================= */
export type SystemFlag = {
  id: number;
  name: string | null;
  displayName: string | null;
  value: string | null;
  valueType: string | null;
  description: string | null;
  isActive: string | null;
  flagGroupId: number;
};

export type FlagGroup = {
  id: number;
  flagGroupName: string | null;
  parentFlagGroupId: number | null;
  description: string | null;
  systemflags: SystemFlag[];
};

/* =========================
   Page Component
========================= */
export default function SettingsClient() {
  const toast = useToast();

  const [groups, setGroups] = useState<FlagGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<SystemFlag>>({});
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadFlags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSystemFlags();
      setGroups(res?.groups || []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch system flags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  const parents = useMemo(
    () => groups.filter((g) => g.parentFlagGroupId === null),
    [groups]
  );

  useEffect(() => {
    if (!activeTab && parents.length) setActiveTab(String(parents[0].id));
  }, [parents, activeTab]);

  const startEdit = (flag: SystemFlag) => {
    setEditingId(flag.id);
    setFormData({ ...flag });
    setFilePreview(flag.value ? buildImgSrc(flag.value) : null);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setFilePreview(null);
    setBusy(false);
  };

  const onFieldChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };
  const onRadioChange = (value: string) => setFormData((p) => ({ ...p, value }));

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      const localUrl = URL.createObjectURL(file);
      setFilePreview(localUrl);
      const uploaded = await uploadImage(file, "images");
      setFormData((p) => ({ ...p, value: uploaded.path }));
      toast("success", "Uploaded", "Image uploaded successfully.");
    } catch (err: any) {
      setFilePreview(null);
      toast("error", "Upload failed", err?.message ?? "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (id: number) => {
    try {
      setBusy(true);
      const result = await updateSystemFlag(id, formData);
      if (!result?.status) throw new Error(result?.message || "Update failed");
      toast("success", "Saved", "Flag updated successfully.");
      cancelEdit();
      await loadFlags();
    } catch (err: any) {
      toast("error", "Update failed", err?.message ?? "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const renderInput = (flag: SystemFlag) => {
    const type = (flag.valueType || "").toLowerCase();
    const editing = editingId === flag.id;
    const TypeIcon = getTypeIcon(type);

    if (!editing) {
      if (type === "file") {
        const src = buildImgSrc(flag.value || "");
        return (
          <img
            src={src}
            alt={(flag.displayName || flag.name || "Image") ?? "Image"}
            className="h-20 w-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
          />
        );
      }
      return (
        <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
          <TypeIcon size={16} className="text-gray-500" />
          <span className="break-words">{flag.value ?? "—"}</span>
        </div>
      );
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
        );
      case "number":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Hash size={16} className="text-gray-500" /> Value
            </label>
            <Input type="number" name="value" value={formData.value ?? ""} onChange={onFieldChange} placeholder="0" inputMode="numeric" />
          </div>
        );
      case "radio": {
        const options = (flag.value ?? "").split(",").map((v) => v.trim()).filter(Boolean);
        const current = (formData.value ?? "").toString();
        return options.length ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <RadioIcon size={16} /> Select an option
            </div>
            <div className="flex flex-wrap gap-2">
              {options.map((opt, i) => {
                const checked = current === opt;
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
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No options available.</div>
        );
      }
      case "file":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={filePreview || buildImgSrc(flag.value || "")}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                />
              </div>
              <div className="flex-1">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Upload size={16} className="text-gray-500" /> Upload new image
                </label>
                <Input type="file" accept="image/*" onChange={onFileChange} disabled={busy} />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FileText size={16} className="text-gray-500" /> Value
            </label>
            <Textarea name="value" value={formData.value ?? ""} onChange={onFieldChange} placeholder="Enter value" />
          </div>
        );
    }
  };

  /* =========================
     Screens: loading / error / empty
  ========================= */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-3 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-md">
              <Settings size={24} className="text-white" />
            </div>
            <div className="mx-auto h-6 w-64 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mx-auto h-4 w-96 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Surface key={i}>
                <div className="space-y-4 p-6">
                  <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </Surface>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl">
          <Surface>
            <div className="space-y-4 p-8 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white">
                <X size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Unable to load system flags
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <Button variant="secondary" onClick={loadFlags} className="mx-auto">
                Try again
              </Button>
            </div>
          </Surface>
        </div>
      </main>
    );
  }

  if (!groups.length) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl">
          <Surface>
            <div className="p-12 text-center">
              <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-200 dark:bg-gray-700">
                <Settings size={24} className="text-gray-600 dark:text-gray-300" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                No system flags found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Once flags are available, they will appear here for editing.
              </p>
            </div>
          </Surface>
        </div>
      </main>
    );
  }

  /* =========================
     Main UI
  ========================= */
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-md">
            <Settings size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            System Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage application-wide settings, toggles, and configuration values.
          </p>
        </div>

        {/* Tabs */}
        <Surface>
          <div className="overflow-x-auto p-2">
            <div className="flex gap-2">
              {parents.map((pg) => {
                const GroupIcon = getGroupIcon(pg.flagGroupName || "");
                const isActive = activeTab === String(pg.id);
                return (
                  <button
                    key={pg.id}
                    onClick={() => setActiveTab(String(pg.id))}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? "border-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <GroupIcon size={16} />
                    {pg.flagGroupName || `Group ${pg.id}`}
                  </button>
                );
              })}
            </div>
          </div>
        </Surface>

        {/* Active group content */}
        {parents.map((pg) => {
          if (activeTab !== String(pg.id)) return null;

          const generalFlags = groups.find((g) => g.id === pg.id)?.systemflags ?? [];
          const children = groups.filter((g) => g.parentFlagGroupId === pg.id);

          // Master Images grid
          if (isMasterImageGroup(pg)) {
            const allFlags = [...generalFlags, ...children.flatMap((c) => c.systemflags || [])];
            return (
              <Section
                key={pg.id}
                title="Master Images"
                desc={pg.description || "Manage your application's image assets"}
              >
                {allFlags.length ? (
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {allFlags.map((flag) => {
                      const editing = editingId === flag.id;
                      const src = editing ? filePreview || buildImgSrc(flag.value || "") : buildImgSrc(flag.value || "");
                      return (
                        <Surface key={flag.id}>
                          <div className="p-4">
                            <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-700">
                              <img
                                src={src}
                                alt={(flag.displayName || flag.name || "image") ?? "image"}
                                className="h-full w-full object-cover"
                                onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                              />
                            </div>
                            <div className="mt-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {flag.displayName || flag.name || `Flag ${flag.id}`}
                                </h3>
                              </div>
                              {editing ? (
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={busy} icon={X}>
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => saveEdit(flag.id)}
                                    disabled={busy}
                                    loading={busy}
                                    icon={busy ? undefined : Save}
                                  >
                                    {busy ? "Saving..." : "Save"}
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="secondary" size="sm" onClick={() => startEdit(flag)}>
                                  Edit
                                </Button>
                              )}
                            </div>

                            {editing && (
                              <div className="mt-3">
                                <Input type="file" accept="image/*" onChange={onFileChange} disabled={busy} />
                              </div>
                            )}
                          </div>
                        </Surface>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-10 text-center text-gray-600 dark:text-gray-400">
                    <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
                      <ImageIcon size={18} className="text-gray-500 dark:text-gray-300" />
                    </div>
                    No images in this group.
                  </div>
                )}
              </Section>
            );
          }

          // Default groups
          return (
            <div key={pg.id} className="space-y-8">
              {/* General Settings */}
              {generalFlags.length > 0 && (
                <Section title="General Settings" desc={pg.description || "Core application configuration"}>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {generalFlags.map((flag) => {
                      const editing = editingId === flag.id;
                      const TypeIcon = getTypeIcon(flag.valueType || "");
                      return (
                        <Surface key={flag.id}>
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                                  <TypeIcon size={16} className="text-gray-600 dark:text-gray-300" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {flag.displayName || flag.name || `Flag ${flag.id}`}
                                  </h3>
                                  {flag.description && (
                                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{flag.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0">
                                {editing ? (
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={busy} icon={X}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => saveEdit(flag.id)}
                                      disabled={busy}
                                      loading={busy}
                                      icon={busy ? undefined : Save}
                                    >
                                      {busy ? "Saving..." : "Save"}
                                    </Button>
                                  </div>
                                ) : (
                                  <Button variant="secondary" size="sm" onClick={() => startEdit(flag)}>
                                    Edit
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="mt-4">{renderInput(flag)}</div>
                          </div>
                        </Surface>
                      );
                    })}
                  </div>
                </Section>
              )}

              {/* Child Groups */}
              {children.length > 0 && (
                <div className="grid gap-8 lg:grid-cols-2">
                  {children.map((cg) => {
                    return (
                      <Section
                        key={cg.id}
                        title={cg.flagGroupName || `Group ${cg.id}`}
                        desc={cg.description || undefined}
                      >
                        <div className="space-y-4">
                          {cg.systemflags.map((flag) => {
                            const editing = editingId === flag.id;
                            const TypeIcon = getTypeIcon(flag.valueType || "");
                            return (
                              <div
                                key={flag.id}
                                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700">
                                      <TypeIcon size={14} className="text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {flag.displayName || flag.name || `Flag ${flag.id}`}
                                      </h4>
                                      {flag.description && (
                                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{flag.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="shrink-0">
                                    {editing ? (
                                      <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={busy} icon={X}>
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="primary"
                                          size="sm"
                                          onClick={() => saveEdit(flag.id)}
                                          disabled={busy}
                                          loading={busy}
                                          icon={busy ? undefined : Save}
                                        >
                                          {busy ? "Saving..." : "Save"}
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button variant="secondary" size="sm" onClick={() => startEdit(flag)}>
                                        Edit
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-3">{renderInput(flag)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </Section>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
