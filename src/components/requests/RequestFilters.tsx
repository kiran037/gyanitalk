// ===================================
// FILE: components/requests/RequestFilters.tsx
// ===================================

"use client";

import { useState } from "react";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { RequestFilters as Filters } from "@/lib/requests/types";
import { Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RequestFiltersProps {
  onFilterChange: (filters: Filters) => void;
  availableGroups?: Array<{ id: bigint; name: string | null }>;
  showGroupFilter?: boolean;
}

export function RequestFilters({
  onFilterChange,
  availableGroups = [],
  showGroupFilter = true,
}: RequestFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  const handleApply = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        icon={<Filter className="w-4 h-4" />}
      >
        Filters
        {activeFiltersCount > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-[#FF6B35] text-white rounded-full text-xs">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 p-4 space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <SearchInput
                value={filters.search || ""}
                onChange={(value) => setFilters({ ...filters, search: value })}
                placeholder="Search..."
              />

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {showGroupFilter && availableGroups.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assigned Group
                  </label>
                  <select
                    value={filters.groupId || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, groupId: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                  >
                    <option value="">All Groups</option>
                    {availableGroups.map((group) => (
                      <option key={group.id.toString()} value={group.id.toString()}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Reset
                </Button>
                <Button variant="primary" onClick={handleApply} className="flex-1">
                  Apply
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}