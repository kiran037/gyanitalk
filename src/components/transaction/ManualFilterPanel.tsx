
// components/transaction/ManualFilterPanel.tsx
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { RotateCcw } from "lucide-react";


interface ManualFilterPanelProps {
  filters: {
    paymentStatus: string;
    startDate: string;
    endDate: string;
    sortBy: string;
    sortOrder: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

export function ManualFilterPanel({
  filters,
  onFilterChange,
  onReset,
}: ManualFilterPanelProps) {
  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/20 rounded-xl p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Payment Status */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => onFilterChange("paymentStatus", e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="success">Approved</option>
            <option value="failed">Rejected</option>
          </select>
        </div>

        {/* Start Date */}
        <Input
          label="Start Date"
          type="date"
          value={filters.startDate}
          onChange={(e) => onFilterChange("startDate", e.target.value)}
        />

        {/* End Date */}
        <Input
          label="End Date"
          type="date"
          value={filters.endDate}
          onChange={(e) => onFilterChange("endDate", e.target.value)}
        />

        {/* Sort Order */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Order
          </label>
          <select
            value={filters.sortOrder}
            onChange={(e) => onFilterChange("sortOrder", e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}

export default ManualFilterPanel;