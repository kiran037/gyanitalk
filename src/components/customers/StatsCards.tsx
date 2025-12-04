import { Users, UserCheck, TrendingUp, Wallet } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  newToday: number;
  totalWalletBalance: string;
}

interface StatsCardsProps {
  stats: Stats;
  loading: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Customers",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "blue",
      bgGradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Customers",
      value: stats.activeUsers.toLocaleString(),
      icon: UserCheck,
      color: "green",
      bgGradient: "from-green-500 to-emerald-500",
    },
    {
      title: "New Today",
      value: stats.newToday.toLocaleString(),
      icon: TrendingUp,
      color: "orange",
      bgGradient: "from-[#FF6B35] to-[#FFB347]",
    },
    {
      title: "Total Balance",
      value: `₹${parseFloat(stats.totalWalletBalance).toLocaleString()}`,
      icon: Wallet,
      color: "purple",
      bgGradient: "from-purple-500 to-pink-500",
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
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
            </div>
            <div
              className={`w-12 h-12 bg-gradient-to-br ${card.bgGradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            >
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}