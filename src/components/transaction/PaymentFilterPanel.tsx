// components/transaction/PaymentFilterPanel.tsx
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { RotateCcw } from "lucide-react";

interface PaymentFilterPanelProps {
  filters: {
    paymentStatus: string;
    paymentMode: string;
    type: string;
    startDate: string;
    endDate: string;
    minAmount: string;
    maxAmount: string;
    sortBy: string;
    sortOrder: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

export function PaymentFilterPanel({
  filters,
  onFilterChange,
  onReset,
}: PaymentFilterPanelProps) {
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
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Payment Mode */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Mode
          </label>
          <select
            value={filters.paymentMode}
            onChange={(e) => onFilterChange("paymentMode", e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          >
            <option value="">All Modes</option>
            <option value="online">Online</option>
            <option value="manual">Manual</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="netbanking">Net Banking</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange("type", e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          >
            <option value="">All Types</option>
            <option value="recharge">Recharge</option>
            <option value="gift">Gift</option>
          </select>
        </div>

        {/* Min Amount */}
        <Input
          label="Min Amount"
          type="number"
          value={filters.minAmount}
          onChange={(e) => onFilterChange("minAmount", e.target.value)}
          placeholder="₹0"
        />

        {/* Max Amount */}
        <Input
          label="Max Amount"
          type="number"
          value={filters.maxAmount}
          onChange={(e) => onFilterChange("maxAmount", e.target.value)}
          placeholder="₹10000"
        />

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
            <option value="created_at">Date</option>
            <option value="amount">Amount</option>
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