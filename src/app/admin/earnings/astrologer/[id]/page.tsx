// app/earnings/astrologer/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowLeft
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { useParams, useRouter } from "next/navigation";
import { ManualAdjustmentModal } from "@/components/earnings/ManualAdjustmentModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";


interface BalanceData {
  astrologer: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  } | null;
  currentBalance: number;
  pendingWithdrawals: number;
  availableBalance: number;
  totalEarnings: number;
  totalWithdrawals: number;
  transactionCount: number;
}

interface Transaction {
  id: string;
  amount: number;
  transactionType: string;
  isCredit: boolean;
  created_at: string;
  order_request: {
    orderType: string;
    orderStatus: string;
  } | null;
}

export default function AstrologerBalancePage() {
  const params = useParams();
  const astrologerId = params.id as string;
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const addToast = useToast();
  const router = useRouter();

        const BackButton = () => (
    <button
      onClick={() => router.back()}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
    </button>
  );

  useEffect(() => {
    if (astrologerId) {
      fetchBalanceData();
      fetchTransactions();
    }
  }, [astrologerId]);

  const fetchBalanceData = async () => {
    try {
      const response = await fetch(`/api/earnings/astrologer/${astrologerId}/balance`);
      const data = await response.json();

      if (data.success) {
        setBalanceData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      addToast("error", "Error", "Failed to fetch balance data");
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/earnings/astrologer/${astrologerId}/transactions?limit=20`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.3)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{value.toLocaleString()}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (!balanceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-6">
      <PageHeader
        title={`${balanceData.astrologer?.name}'s Balance`}
        subtitle={balanceData.astrologer?.email || ''}
        badge={{ text: "WALLET", variant: "green" }}
        leftActions={<BackButton />}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAdjustmentModal(true)}
          >
            Manual Adjustment
          </Button>
        }
      />

      {/* Astrologer Info */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            {balanceData.astrologer?.profileImage && (
              <img
                src={avatar(balanceData.astrologer.profileImage)}
                alt={balanceData.astrologer.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {balanceData.astrologer?.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {balanceData.astrologer?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Balance Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Balance"
          value={balanceData.currentBalance}
          icon={Wallet}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Available Balance"
          value={balanceData.availableBalance}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Total Earnings"
          value={balanceData.totalEarnings}
          icon={TrendingUp}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Total Withdrawals"
          value={balanceData.totalWithdrawals}
          icon={TrendingDown}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Pending Withdrawals Alert */}
      {balanceData.pendingWithdrawals > 0 && (
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Pending Withdrawals: ₹{balanceData.pendingWithdrawals.toLocaleString()}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                This amount is locked until withdrawal approval
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(txn.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {txn.transactionType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {txn.isCredit ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`font-semibold ${txn.isCredit ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.isCredit ? '+' : '-'}₹{txn.amount.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      txn.isCredit
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {txn.isCredit ? 'Credit' : 'Debit'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Adjustment Modal */}
      {showAdjustmentModal && (
        <ManualAdjustmentModal
          astrologerId={astrologerId}
          onClose={() => setShowAdjustmentModal(false)}
          onSuccess={() => {
            setShowAdjustmentModal(false);
            fetchBalanceData();
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}