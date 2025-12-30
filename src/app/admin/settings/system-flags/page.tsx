"use client";

import { useState, useEffect } from "react";
import { Plus, Flag, ChevronDown, ChevronRight, Edit2, Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { useToast } from "@/components/Toast/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<SystemFlag | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    value: "",
    valueType: "text",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

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
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch flags");
    } finally {
      setLoading(false);
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
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFlag(null);
    setFormData({
      name: "",
      displayName: "",
      value: "",
      valueType: "text",
      description: "",
    });
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
            onClick={() => setIsModalOpen(true)}
          >
            Add Flag
          </Button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Sidebar - Groups */}
        <div className="lg:col-span-3">
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Flag Groups</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedGroupId(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedGroupId === null
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span>All Flags</span>
                <span className="text-xs">{flags.length}</span>
              </button>
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedGroupId === group.id
                      ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="truncate">{group.flagGroupName}</span>
                  {group._count && (
                    <span className="text-xs">{group._count.systemflags}</span>
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
            placeholder="Search flags..."
          />

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
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
                    className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleGroup(parseInt(groupId))}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <Flag className="w-4 h-4 text-[#FF6B35]" />
                        <div className="text-left">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {group?.flagGroupName || "Ungrouped"}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {groupFlags.length} flags
                          </p>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                            {groupFlags.map((flag) => (
                              <div
                                key={flag.id}
                                className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                        {flag.displayName || flag.name}
                                      </h5>
                                      {flag.isActive === "1" && (
                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-medium rounded">
                                          Active
                                        </span>
                                      )}
                                    </div>
                                    <code className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                      {flag.name}
                                    </code>
                                    {flag.description && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {flag.description}
                                      </p>
                                    )}
                                    <div className="mt-2 flex items-center gap-2">
                                      <span className="text-xs text-gray-500">Value:</span>
                                      <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded">
                                        {flag.value || "—"}
                                      </code>
                                      <span className="text-xs text-gray-400">
                                        ({flag.valueType})
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<Edit2 className="w-4 h-4" />}
                                    onClick={() => handleEdit(flag)}
                                    ariaLabel="Edit"
                                  />
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Flag Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., gst_percentage"
              required
              icon={<Flag className="w-4 h-4" />}
            />
            <Input
              label="Display Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="e.g., GST Percentage"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Enter value"
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Value Type
              </label>
              <select
                value={formData.valueType}
                onChange={(e) => setFormData({ ...formData, valueType: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this flag..."
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
              {selectedFlag ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}