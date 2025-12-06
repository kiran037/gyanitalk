import { ReactNode } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPercentage?: boolean;
    isCurrency?: boolean;
  };
  color: "blue" | "green" | "orange" | "purple";
}

export function StatsCard({ title, value, icon, trend, color }: StatsCardProps) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
  };

  const bgColors = {
    blue: "bg-blue-500/10",
    green: "bg-green-500/10",
    orange: "bg-orange-500/10",
    purple: "bg-purple-500/10",
  };

  const formatTrendValue = () => {
    if (!trend) return "";
    
    if (trend.isPercentage) {
      return `${trend.value}%`;
    }
    
    if (trend.isCurrency) {
      return `₹${(trend.value / 1000).toFixed(1)}K`;
    }
    
    return trend.value.toLocaleString();
  };

  return (
    <motion.div
      className="group bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 cursor-pointer"
      whileHover={{
        scale: 1.02,
        borderColor: "rgba(255, 107, 53, 0.5)",
        boxShadow: "0 10px 30px rgba(255, 107, 53, 0.15)",
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${bgColors[color]} rounded-xl flex items-center justify-center`}>
          <div className={`text-${color}-600 dark:text-${color}-400`}>
            {icon}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>

        {trend && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              {formatTrendValue()} {trend.label}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}