import { User, Wallet, TrendingUp, Calendar } from "lucide-react";
import { avatar } from "@/lib/images";

interface CustomerHeaderProps {
  customer: {
    id: string;
    name: string;
    email: string;
    profile: string | null;
    walletBalance: string;
    isActive: boolean;
    createdAt: Date;
    stats: {
      totalSpent: string;
    };
  };
}

export default function CustomerHeader({ customer }: CustomerHeaderProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#FFB347] p-1">
              {customer.profile ? (
                <img
                  src={avatar(customer.profile)}
                  alt={customer.name}
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            {/* Status Badge */}
            <div
              className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 ${
                customer.isActive
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
              title={customer.isActive ? "Active" : "Inactive"}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {customer.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{customer.email}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                ID: {customer.id}
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {formatDate(customer.createdAt)}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-800 dark:text-green-300">
                  Balance
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                ₹{parseFloat(customer.walletBalance).toFixed(2)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-medium text-orange-800 dark:text-orange-300">
                  Total Spent
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                ₹{parseFloat(customer.stats.totalSpent).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}