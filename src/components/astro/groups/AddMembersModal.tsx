///Users/xeoren/Desktop/gyanitallk-admin/src/components/astro/groups/AddMembersModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { UserPlus, Search } from "lucide-react";
import { avatar } from "@/lib/images";
import { motion } from "framer-motion";

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onSuccess: () => void;
}

export function AddMembersModal({ isOpen, onClose, groupId, onSuccess }: AddMembersModalProps) {
  const addToast = useToast();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      searchAstrologers();
    }
  }, [isOpen]);

  const searchAstrologers = async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams({ groupId });
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/astrologer-groups/search-astrologers?${params}`);
      const data = await response.json();

      if (data.success) {
        setAstrologers(data.data);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to search astrologers");
    } finally {
      setSearching(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddMembers = async () => {
    if (selectedIds.length === 0) {
      addToast("error", "Error", "Please select at least one astrologer");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/astrologer-groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ astrologerIds: selectedIds }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", data.message || "Members added successfully");
        onSuccess();
      } else {
        addToast("error", "Error", data.error || "Failed to add members");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to add members");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Members to Group" size="lg">
      <div className="space-y-6">
        {/* Search */}
        <div className="flex gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search astrologers by name, email..."
            className="flex-1"
          />
          <Button
            variant="outline"
            icon={<Search className="w-4 h-4" />}
            onClick={searchAstrologers}
            loading={searching}
          >
            Search
          </Button>
        </div>

        {/* Selected Count */}
        {selectedIds.length > 0 && (
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              {selectedIds.length} astrologer{selectedIds.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        )}

        {/* Astrologers List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {searching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : astrologers.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Astrologers Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery
                  ? "Try a different search term"
                  : "All astrologers are already in this group"}
              </p>
            </div>
          ) : (
            astrologers.map((astrologer, index) => (
              <motion.div
                key={astrologer.id}
                className={`p-4 rounded-xl cursor-pointer transition-colors ${
                  selectedIds.includes(astrologer.id.toString())
                    ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500"
                    : "bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleSelect(astrologer.id.toString())}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedIds.includes(astrologer.id.toString())
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {selectedIds.includes(astrologer.id.toString()) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>

                  {/* Avatar */}
                  <img
                    src={avatar(astrologer.profileImage)}
                    alt={astrologer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {astrologer.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {astrologer.email}
                      </span>
                      {astrologer.isVerified && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            icon={<UserPlus className="w-4 h-4" />}
            onClick={handleAddMembers}
            loading={loading}
            disabled={selectedIds.length === 0}
            className="flex-1"
          >
            Add {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
          </Button>
        </div>
      </div>
    </Modal>
  );
}