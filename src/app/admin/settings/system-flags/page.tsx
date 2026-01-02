

"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, Flag, ChevronDown, ChevronRight, Edit2, 
  Search as SearchIcon, Image as ImageIcon, Upload, 
  Link as LinkIcon, X, CheckCircle2, AlertCircle 
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
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  
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
      const response = await fetch("/api/settings/system-flags/groups?withFlags=false");
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
      const response = await fetch(`/api/settings/system-flags/by-group/${groupId}`);
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
      
      setFormData(prev => ({ ...prev, value: finalUrl }));
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
    if (flag.value && (flag.value.startsWith("http") || flag.value.startsWith("/"))) {
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
        flagGroupId: selectedGroupId || (groups[0]?.id || 0), // Pre-select current group
      });
      setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFlag(null);
    setImageInputMode("upload");
  };

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const groupedFlags = flags.reduce((acc, flag) => {
    const groupId = flag.flagGroupId;
    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push(flag);
    return acc;
  }, {} as Record<number, SystemFlag[]>);

  // Helper to determine if we are editing an Image group
  const isMasterImageGroup = () => {
    const group = groups.find(g => g.id === formData.flagGroupId);
    return group?.flagGroupName === "MasterImage" || formData.name.toLowerCase().includes("image");
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
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreate}
          >
            Add Flag
          </Button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-6 relative items-start">
        {/* Sidebar - Groups - Now Sticky */}
        <div className="lg:col-span-3 lg:sticky lg:top-6">
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-3 ml-2">
                Groups
            </h3>
            <div className="space-y-1 max-h-[80vh] overflow-y-auto pr-1 custom-scrollbar">
              <button
                onClick={() => setSelectedGroupId(null)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedGroupId === null
                    ? "bg-[#FF6B35] text-white shadow-md shadow-orange-500/20"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    <span>All Flags</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${selectedGroupId === null ? "bg-white/20" : "bg-gray-200 dark:bg-gray-600"}`}>
                    {flags.length}
                </span>
              </button>
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    selectedGroupId === group.id
                      ? "bg-[#FF6B35] text-white shadow-md shadow-orange-500/20"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="truncate text-left">{group.flagGroupName}</span>
                  {group._count && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedGroupId === group.id ? "bg-white/20" : "bg-gray-200 dark:bg-gray-600"}`}>
                        {group._count.systemflags}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-4">
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
                  className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse"
                >
                  <div className="flex justify-between">
                    <div className="space-y-2 w-1/2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
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
                    className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => toggleGroup(parseInt(groupId))}
                      className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-md transition-transform duration-200 ${isExpanded ? "rotate-90 bg-gray-200 dark:bg-gray-700" : ""}`}>
                           <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {group?.flagGroupName || "Ungrouped"}
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
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
                          <div className="divide-y divide-gray-200 dark:divide-gray-700 border-t border-gray-200 dark:border-gray-700">
                            {groupFlags.map((flag) => (
                              <div
                                key={flag.id}
                                className="p-5 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors group relative"
                              >
                                <div className="flex items-start justify-between gap-6">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5">
                                      <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                                        {flag.displayName || flag.name}
                                      </h5>
                                      {flag.isActive === "1" ? (
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold uppercase tracking-wide rounded-full">
                                          <CheckCircle2 className="w-3 h-3" /> Active
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wide rounded-full">
                                           Inactive
                                        </span>
                                      )}
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {flag.description || "No description provided."}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <span className="font-medium">Key:</span>
                                            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded font-mono border border-gray-200 dark:border-gray-600">
                                                {flag.name}
                                            </code>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 font-medium">Value:</span>
                                            {/* Preview Logic */}
                                            {flag.valueType === 'boolean' ? (
                                                <span className={`px-2 py-1 rounded font-bold ${flag.value === 'true' || flag.value === '1' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                                                    {flag.value}
                                                </span>
                                            ) : (flag.value && (flag.value.startsWith('http') || flag.value.match(/\.(jpeg|jpg|gif|png)$/))) ? (
                                                <div className="flex items-center gap-2">
                                                    <img src={avatar(flag.value)} alt="Preview" className="w-6 h-6 rounded object-cover border border-gray-200" />
                                                    <span className="text-gray-400 italic truncate max-w-[150px]">{flag.value}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-900 dark:text-white truncate max-w-[200px]">
                                                    {flag.value || "—"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                  </div>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    icon={<Edit2 className="w-3.5 h-3.5" />}
                                    onClick={() => handleEdit(flag)}
                                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Flag Group
                </label>
                <select 
                    value={formData.flagGroupId}
                    onChange={(e) => setFormData({...formData, flagGroupId: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                >
                    {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.flagGroupName}</option>
                    ))}
                </select>
             </div>
           )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Key Name (Code Ref)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., master_bg_image"
              required

            />
            <Input
              label="Display Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="e.g., Master Background"
            />
          </div>

          {/* Dynamic Value Input Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                    Flag Value Configuration
                </label>
                <select
                    value={formData.valueType}
                    onChange={(e) => setFormData({ ...formData, valueType: e.target.value })}
                    className="text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[#FF6B35]/50"
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
                    <div className="flex p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
                        <button
                            type="button"
                            onClick={() => setImageInputMode("upload")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${imageInputMode === 'upload' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Upload className="w-3 h-3" /> Upload
                        </button>
                        <button
                            type="button"
                            onClick={() => setImageInputMode("url")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${imageInputMode === 'url' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <LinkIcon className="w-3 h-3" /> URL Path
                        </button>
                    </div>

                    {imageInputMode === "upload" ? (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            {uploadingImage ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <p className="text-xs text-gray-500">Uploading...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mb-2 text-orange-500">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload image</p>
                                    <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Input
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            placeholder="https://example.com/image.png"
                            icon={<LinkIcon className="w-4 h-4" />}
                        />
                    )}

                    {/* Image Preview Area */}
                    {formData.value && (
                        <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                            <img 
                                src={formData.value} 
                                alt="Preview" 
                                className="w-12 h-12 rounded object-cover bg-gray-100"
                                onError={(e) => (e.currentTarget.style.display = 'none')} 
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-500 uppercase">Current Value</p>
                                <p className="text-xs text-gray-900 dark:text-white truncate font-mono" title={formData.value}>{formData.value}</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setFormData({...formData, value: ''})}
                                className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                 </div>
            ) : formData.valueType === 'boolean' ? (
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, value: 'true'})}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${formData.value === 'true' ? 'bg-green-50 border-green-200 text-green-700 ring-1 ring-green-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        True
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, value: 'false'})}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${formData.value === 'false' ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        False
                    </button>
                </div>
            ) : (
                <Input
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Enter value"
                />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this flag controls..."
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
              {selectedFlag ? "Update Flag" : "Create Flag"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}