// components/transaction/WalletFilterPanel.tsx
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { RotateCcw } from "lucide-react";

interface WalletFilterPanelProps {
  filters: {
    transactionType: string;
    isCredit: string;
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

export default function WalletFilterPanel({
  filters,
  onFilterChange,
  onReset,
}: WalletFilterPanelProps) {
  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/20 rounded-xl p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Transaction Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction Type
          </label>
          <select
            value={filters.transactionType}
            onChange={(e) => onFilterChange("transactionType", e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          >
            <option value="">All Types</option>
            <option value="signup_bonus">Signup Bonus</option>
            <option value="chat">Chat</option>
            <option value="call">Call</option>
            <option value="recharge">Recharge</option>
            <option value="manual_recharge">Manual Recharge</option>
            <option value="cashback">Cashback</option>
            <option value="referral">Referral</option>
          </select>
        </div>

        {/* Credit/Debit */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction Flow
          </label>
          <select
            value={filters.isCredit}
            onChange={(e) => onFilterChange("isCredit", e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          >
            <option value="">All</option>
            <option value="true">Credit</option>
            <option value="false">Debit</option>
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

      {/* Reset Button */}
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