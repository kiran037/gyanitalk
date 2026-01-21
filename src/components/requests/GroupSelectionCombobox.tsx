// ===================================
// FILE: components/requests/GroupSelectionCombobox.tsx
// ===================================

"use client";

import { useState, useMemo } from "react";
import { Group } from "@/lib/requests/types";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Check, Users, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GroupSelectionComboboxProps {
  groups: Group[];
  value: number | null;
  onChange: (groupId: number | null) => void;
  placeholder?: string;
  showStats?: boolean;
}

export function GroupSelectionCombobox({
  groups,
  value,
  onChange,
  placeholder = "Select a group...",
  showStats = true,
}: GroupSelectionComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    if (!search) return groups;
    return groups.filter((g) =>
      g.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [groups, search]);

  const selectedGroup = groups.find((g) => Number(g.id) === value);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-left text-gray-900 dark:text-white hover:border-[#FF6B35]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 transition-colors"
      >
        {selectedGroup ? (
          <div className="flex items-center justify-between">
            <span className="font-medium">{selectedGroup.name}</span>
            {showStats && (
              <span className="text-xs text-gray-500">
                {selectedGroup.activeAstrologers}/{selectedGroup.totalAstrologers} active
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-80 overflow-hidden"
            >
              {/* Search */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search groups..."
                />
              </div>

              {/* Group List */}
              <div className="overflow-y-auto max-h-64">
                {filteredGroups.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No groups found
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <button
                      key={group.id.toString()}
                      type="button"
                      onClick={() => {
                        onChange(Number(group.id));
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center text-white">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {group.name}
                            </span>
                            {group.priority && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold">
                                <Award className="w-3 h-3" />
                                P{group.priority}
                              </span>
                            )}
                          </div>
                          {showStats && (
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>
                                {group.totalAstrologers} astrologer
                                {group.totalAstrologers !== 1 ? "s" : ""}
                              </span>
                              <span>•</span>
                              <span className="text-green-600 dark:text-green-400">
                                {group.activeAstrologers} active
                              </span>
                              {group.timeout && (
                                <>
                                  <span>•</span>
                                  <span>{group.timeout}s timeout</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {Number(group.id) === value && (
                        <Check className="w-5 h-5 text-[#FF6B35]" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}