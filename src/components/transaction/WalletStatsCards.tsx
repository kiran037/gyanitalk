// components/transaction/WalletStatsCards.tsx
import { ArrowUpCircle, ArrowDownCircle, Activity, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface Statistics {
  totalTransactions: number;
  totalAmount: number;
  totalCredit: number;
  totalDebit: number;
  netAmount: number;
}

interface WalletStatsCardsProps {
  stats: Statistics;
  loading: boolean;
}

export default function WalletStatsCards({ stats, loading }: WalletStatsCardsProps) {
  const cards = [
    {
      title: "Total Transactions",
      value: stats.totalTransactions.toLocaleString(),
      icon: Activity,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-900/20",
    },
    {
      title: "Total Credit",
      value: `₹${stats.totalCredit.toLocaleString()}`,
      icon: ArrowUpCircle,
      gradient: "from-green-500 to-green-600",
      bgLight: "bg-green-50",
      bgDark: "dark:bg-green-900/20",
    },
    {
      title: "Total Debit",
      value: `₹${stats.totalDebit.toLocaleString()}`,
      icon: ArrowDownCircle,
      gradient: "from-red-500 to-red-600",
      bgLight: "bg-red-50",
      bgDark: "dark:bg-red-900/20",
    },
    {
      title: "Net Amount",
      value: `₹${stats.netAmount.toLocaleString()}`,
      icon: TrendingUp,
      gradient: "from-[#FF6B35] to-[#FFB347]",
      bgLight: "bg-orange-50",
      bgDark: "dark:bg-orange-900/20",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group"
        >
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer overflow-hidden">
            <div className={`absolute inset-0 ${card.bgLight} ${card.bgDark} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <div className={`p-2 bg-gradient-to-br ${card.gradient} rounded-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </h3>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}