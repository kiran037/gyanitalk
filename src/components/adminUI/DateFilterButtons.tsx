import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface DateFilterButtonsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  customDate?: { startDate: string; endDate: string };
  onCustomDateChange?: (dates: { startDate: string; endDate: string }) => void;
}

export function DateFilterButtons({
  activeFilter,
  onFilterChange,
  customDate,
  onCustomDateChange,
}: DateFilterButtonsProps) {
  const filters = [
    { value: "today", label: "Today" },
    { value: "last_7_days", label: "7 Days" },
    { value: "last_30_days", label: "30 Days" },
    { value: "last_3_months", label: "3 Months" },
    { value: "last_6_months", label: "6 Months" },
    { value: "last_1_year", label: "1 Year" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          Time Period
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <motion.button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === filter.value
                ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filter.label}
          </motion.button>
        ))}
      </div>

      {activeFilter === "custom" && onCustomDateChange && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 grid grid-cols-2 gap-3"
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={customDate?.startDate || ""}
              onChange={(e) =>
                onCustomDateChange({
                  startDate: e.target.value,
                  endDate: customDate?.endDate || "",
                })
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={customDate?.endDate || ""}
              onChange={(e) =>
                onCustomDateChange({
                  startDate: customDate?.startDate || "",
                  endDate: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}