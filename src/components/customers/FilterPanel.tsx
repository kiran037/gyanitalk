import { X } from "lucide-react";
import { Button } from "@/components/adminUI/Button";

interface FilterPanelProps {
  filters: {
    status: string;
    gender: string;
    minBalance: string;
    maxBalance: string;
    location: string;
    startDate: string;
    endDate: string;
    sortBy: string;
    sortOrder: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

export default function FilterPanel({
  filters,
  onFilterChange,
  onReset,
}: FilterPanelProps) {
  return (
    <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-200/60 dark:border-gray-700/60 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Filters
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gender
          </label>
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange("gender", e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          >
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Min Balance */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Min Balance
          </label>
          <input
            type="number"
            value={filters.minBalance}
            onChange={(e) => onFilterChange("minBalance", e.target.value)}
            placeholder="₹0"
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          />
        </div>

        {/* Max Balance */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Balance
          </label>
          <input
            type="number"
            value={filters.maxBalance}
            onChange={(e) => onFilterChange("maxBalance", e.target.value)}
            placeholder="₹10000"
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => onFilterChange("location", e.target.value)}
            placeholder="City or state"
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange("endDate", e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange("sortBy", e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          >
            <option value="joinDate">Join Date</option>
            <option value="name">Name</option>
            <option value="balance">Balance</option>
            <option value="birthDate">Birth Date</option>
          </select>
        </div>
      </div>
    </div>
  );
}