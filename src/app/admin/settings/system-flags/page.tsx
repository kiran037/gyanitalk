"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Flag,
  ChevronDown,
  ChevronRight,
  Edit2,
  Search as SearchIcon,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { useToast } from "@/components/Toast/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import { avatar } from "@/lib/images";

// Assuming you have the upload utility saved at this path
import { uploadImage } from "@/upload";
// ------------------------------------------------------------------------------------

interface SystemFlag {
  id: number;
  name: string | null;
  displayName: string | null;
  value: string | null;
  valueType: string | null;
  description: string;
  isActive: string | null;
  flagGroupId: number;
  flagGroup?: {
    id: number;
    flagGroupName: string | null;
  };
}

interface FlagGroup {
  id: number;
  flagGroupName: string | null;
  description: string;
  _count?: {
    systemflags: number;
  };
}

export default function SystemFlagsPage() {
  const [groups, setGroups] = useState<FlagGroup[]>([]);
  const [flags, setFlags] = useState<SystemFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<SystemFlag | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    value: "",
    valueType: "text",
    description: "",
    flagGroupId: 0,
  });

  // Upload State
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">(
    "upload",
  );

  const addToast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchFlagsByGroup(selectedGroupId);
    } else {
      fetchAllFlags();
    }
  }, [selectedGroupId, searchQuery]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(
        "/api/settings/system-flags/groups?withFlags=false",
      );
      const data = await response.json();
      if (data.success) {
        setGroups(data.data);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch groups");
    }
  };

  const fetchAllFlags = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/settings/system-flags?${params}`);
      const data = await response.json();
      if (data.success) {
        setFlags(data.data);
        // Auto expand all groups if searching
        if (searchQuery) {
          const allGroupIds = data.data.map((f: SystemFlag) => f.flagGroupId);
          setExpandedGroups([...new Set(allGroupIds)] as number[]);
        }
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch flags");
    } finally {
      setLoading(false);
    }
  };

  const fetchFlagsByGroup = async (groupId: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/settings/system-flags/by-group/${groupId}`,
      );
      const data = await response.json();
      if (data.success) {
        setFlags(data.data.flags);
        // Auto expand the selected group
        setExpandedGroups([groupId]);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch flags");
    } finally {
      setLoading(false);
    }
  };

  // --- Image Upload Logic ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Using the user's logic path
      // Define where you want these images stored. e.g., "system-flags"
      const response = await uploadImage(file, "system-flags");

      // Assuming response contains { url: "https://..." } or { path: "..." }
      // Adjust based on your actual API response structure
      const finalUrl = response.url || response.path || response.data?.url;

      setFormData((prev) => ({ ...prev, value: finalUrl }));
      addToast("success", "Uploaded", "Image uploaded successfully");
    } catch (error) {
      console.error(error);
      addToast("error", "Upload Failed", "Could not upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = selectedFlag
        ? `/api/settings/system-flags/${selectedFlag.id}`
        : "/api/settings/system-flags";

      const response = await fetch(url, {
        method: selectedFlag ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", data.message);
        if (selectedGroupId) {
          fetchFlagsByGroup(selectedGroupId);
        } else {
          fetchAllFlags();
        }
        handleCloseModal();
      } else {
        addToast("error", "Error", data.error);
      }
    } catch (error) {
      addToast("error", "Error", "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (flag: SystemFlag) => {
    setSelectedFlag(flag);
    setFormData({
      name: flag.name || "",
      displayName: flag.displayName || "",
      value: flag.value || "",
      valueType: flag.valueType || "text",
      description: flag.description || "",
      flagGroupId: flag.flagGroupId,
    });

    // Auto-switch tab if value looks like a URL
    if (
      flag.value &&
      (flag.value.startsWith("http") || flag.value.startsWith("/"))
    ) {
      setImageInputMode("upload"); // or 'url' depending on preference, kept upload to show preview
    }

    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedFlag(null);
    setFormData({
      name: "",
      displayName: "",
      value: "",
      valueType: "text",
      description: "",
      flagGroupId: selectedGroupId || groups[0]?.id || 0, // Pre-select current group
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFlag(null);
    setImageInputMode("upload");
  };

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const groupedFlags = flags.reduce(
    (acc, flag) => {
      const groupId = flag.flagGroupId;
      if (!acc[groupId]) acc[groupId] = [];
      acc[groupId].push(flag);
      return acc;
    },
    {} as Record<number, SystemFlag[]>,
  );

  // Helper to determine if we are editing an Image group
  const isMasterImageGroup = () => {
    const group = groups.find((g) => g.id === formData.flagGroupId);
    return (
      group?.flagGroupName === "MasterImage" ||
      formData.name.toLowerCase().includes("image")
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Flags"
        subtitle="Configure system-wide settings and feature flags"
        badge={{ text: "System", variant: "blue" }}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={handleCreate}
          >
            Add Flag
          </Button>
        }
      />

      <div className="relative grid items-start gap-6 lg:grid-cols-12">
        {/* Sidebar - Groups - Now Sticky */}
        <div className="lg:sticky lg:top-6 lg:col-span-3">
          <div className="rounded-xl border border-gray-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
            <h3 className="mb-3 ml-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Groups
            </h3>
            <div className="custom-scrollbar max-h-[80vh] space-y-1 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedGroupId(null)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  selectedGroupId === null
                    ? "bg-[#FF6B35] text-white shadow-md shadow-orange-500/20"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  <span>All Flags</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${selectedGroupId === null ? "bg-white/20" : "bg-gray-200 dark:bg-gray-600"}`}
                >
                  {flags.length}
                </span>
              </button>
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    selectedGroupId === group.id
                      ? "bg-[#FF6B35] text-white shadow-md shadow-orange-500/20"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="truncate text-left">
                    {group.flagGroupName}
                  </span>
                  {group._count && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${selectedGroupId === group.id ? "bg-white/20" : "bg-gray-200 dark:bg-gray-600"}`}
                    >
                      {group._count.systemflags}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 lg:col-span-9">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search flags by name, key or value..."
          />

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                >
                  <div className="flex justify-between">
                    <div className="w-1/2 space-y-2">
                      <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedFlags).map(([groupId, groupFlags]) => {
                const group = groups.find((g) => g.id === parseInt(groupId));
                const isExpanded = expandedGroups.includes(parseInt(groupId));

                return (
                  <div
                    key={groupId}
                    className="overflow-hidden rounded-xl border border-gray-200/60 bg-white/60 shadow-sm backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                  >
                    <button
                      onClick={() => toggleGroup(parseInt(groupId))}
                      className="flex w-full items-center justify-between bg-gray-50/50 p-4 transition-colors hover:bg-gray-50 dark:bg-gray-800/30 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-md p-1 transition-transform duration-200 ${isExpanded ? "rotate-90 bg-gray-200 dark:bg-gray-700" : ""}`}
                        >
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="text-left">
                          <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                            {group?.flagGroupName || "Ungrouped"}
                            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-normal text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                              {groupFlags.length}
                            </span>
                          </h4>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="divide-y divide-gray-200 border-t border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                            {groupFlags.map((flag) => (
                              <div
                                key={flag.id}
                                className="group relative p-5 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                              >
                                <div className="flex items-start justify-between gap-6">
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-1.5 flex items-center gap-3">
                                      <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                                        {flag.displayName || flag.name}
                                      </h5>
                                      {flag.isActive === "1" ? (
                                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                          <CheckCircle2 className="h-3 w-3" />{" "}
                                          Active
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                          Inactive
                                        </span>
                                      )}
                                    </div>

                                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                                      {flag.description ||
                                        "No description provided."}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                                      <div className="flex items-center gap-2 text-gray-500">
                                        <span className="font-medium">
                                          Key:
                                        </span>
                                        <code className="rounded border border-gray-200 bg-gray-100 px-2 py-1 font-mono text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                          {flag.name}
                                        </code>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-500">
                                          Value:
                                        </span>
                                        {/* Preview Logic */}
                                        {flag.valueType === "boolean" ? (
                                          <span
                                            className={`rounded px-2 py-1 font-bold ${flag.value === "true" || flag.value === "1" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
                                          >
                                            {flag.value}
                                          </span>
                                        ) : flag.value &&
                                          (flag.value.startsWith("http") ||
                                            flag.value.match(
                                              /\.(jpeg|jpg|gif|png)$/,
                                            )) ? (
                                          <div className="flex items-center gap-2">
                                            <img
                                              src={avatar(flag.value)}
                                              alt="Preview"
                                              className="h-6 w-6 rounded border border-gray-200 object-cover"
                                            />
                                            <span className="max-w-[150px] truncate italic text-gray-400">
                                              {flag.value}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="max-w-[200px] truncate text-gray-900 dark:text-white">
                                            {flag.value || "—"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    icon={<Edit2 className="h-3.5 w-3.5" />}
                                    onClick={() => handleEdit(flag)}
                                    className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedFlag ? "Edit System Flag" : "Add System Flag"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Group Selection (Only if creating) */}
          {!selectedFlag && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Flag Group
              </label>
              <select
                value={formData.flagGroupId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    flagGroupId: parseInt(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.flagGroupName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Key Name (Code Ref)"
              value={formData.name}
              onChange={(e) =>
                !selectedFlag &&
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., master_bg_image"
              required
              readOnly={!!selectedFlag}
              disabled={!!selectedFlag}
            />
            <Input
              label="Display Name"
              value={formData.displayName}
              onChange={(e) =>
                !selectedFlag &&
                setFormData({ ...formData, displayName: e.target.value })
              }
              placeholder="e.g., Master Background"
              readOnly={!!selectedFlag}
              disabled={!!selectedFlag}
            />
          </div>

          {/* Dynamic Value Input Section */}
          <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">
                Flag Value Configuration
              </label>
              <select
                value={formData.valueType}
                onChange={(e) =>
                  setFormData({ ...formData, valueType: e.target.value })
                }
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="text">Text / URL</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
              </select>
            </div>

            {/* Render Input based on Group Logic or Type */}
            {isMasterImageGroup() ? (
              <div className="space-y-3">
                <div className="flex w-fit rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => setImageInputMode("upload")}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${imageInputMode === "upload" ? "bg-orange-100 text-orange-700" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    <Upload className="h-3 w-3" /> Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode("url")}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${imageInputMode === "url" ? "bg-orange-100 text-orange-700" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    <LinkIcon className="h-3 w-3" /> URL Path
                  </button>
                </div>

                {imageInputMode === "upload" ? (
                  <div
                    className="relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    {uploadingImage ? (
                      <div className="flex flex-col items-center">
                        <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
                        <p className="text-xs text-gray-500">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Click to upload image
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          SVG, PNG, JPG or GIF
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    placeholder="https://example.com/image.png"
                    icon={<LinkIcon className="h-4 w-4" />}
                  />
                )}

                {/* Image Preview Area */}
                {formData.value && (
                  <div className="mt-2 flex items-center gap-3 rounded border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
                    <img
                      src={formData.value}
                      alt="Preview"
                      className="h-12 w-12 rounded bg-gray-100 object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase text-gray-500">
                        Current Value
                      </p>
                      <p
                        className="truncate font-mono text-xs text-gray-900 dark:text-white"
                        title={formData.value}
                      >
                        {formData.value}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, value: "" })}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : formData.valueType === "boolean" ? (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, value: "true" })}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${formData.value === "true" ? "border-green-200 bg-green-50 text-green-700 ring-1 ring-green-500" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  True
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, value: "false" })}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${formData.value === "false" ? "border-red-200 bg-red-50 text-red-700 ring-1 ring-red-500" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  False
                </button>
              </div>
            ) : (
              <Input
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="Enter value"
              />
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what this flag controls..."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="flex-1"
            >
              {selectedFlag ? "Update Flag" : "Create Flag"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
