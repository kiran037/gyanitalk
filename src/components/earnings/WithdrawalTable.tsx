// components/earnings/WithdrawalTable.tsx
"use client";

// components/earnings/WithdrawalTable.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { avatar } from "@/lib/images";
import type { Withdrawal } from "@/types/earnings"; // 👈 use shared type

interface WithdrawalTableProps {
  withdrawals: Withdrawal[];
  loading: boolean;
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  onViewDetail: (withdrawal: Withdrawal) => void;
  onApprove: (withdrawal: Withdrawal) => void;
  onReject: (withdrawal: Withdrawal) => void;
}


export function WithdrawalTable({
  withdrawals,
  loading,
  selectedIds,
  onSelectIds,
  onViewDetail,
  onApprove,
  onReject
}: WithdrawalTableProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectIds(withdrawals.filter(w => w.status === 'pending').map(w => w.id));
    } else {
      onSelectIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectIds([...selectedIds, id]);
    } else {
      onSelectIds(selectedIds.filter(sid => sid !== id));
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Withdrawal Requests
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          There are no withdrawal requests matching your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === withdrawals.filter(w => w.status === 'pending').length && withdrawals.filter(w => w.status === 'pending').length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-[#FF6B35] bg-gray-100 border-gray-300 rounded focus:ring-[#FF6B35]"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Astrologer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {withdrawals.map((withdrawal) => (
              <motion.tr
                key={withdrawal.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td className="px-6 py-4">
                  {withdrawal.status === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(withdrawal.id)}
                      onChange={(e) => handleSelectOne(withdrawal.id, e.target.checked)}
                      className="w-4 h-4 text-[#FF6B35] bg-gray-100 border-gray-300 rounded focus:ring-[#FF6B35]"
                    />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                      {withdrawal.astrologer?.profileImage && (
                        <img
                          src={avatar(withdrawal.astrologer.profileImage)}
                          alt={withdrawal.astrologer.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {withdrawal.astrologer?.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {withdrawal.astrologer?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{parseFloat(withdrawal.withdrawAmount).toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {withdrawal.withdrawmethod?.method_name || 'Not specified'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(withdrawal.status)}`}>
                    {getStatusIcon(withdrawal.status)}
                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(withdrawal.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => onViewDetail(withdrawal)}
                    />
                    {withdrawal.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<CheckCircle className="w-4 h-4 text-green-600" />}
                          onClick={() => onApprove(withdrawal)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<XCircle className="w-4 h-4 text-red-600" />}
                          onClick={() => onReject(withdrawal)}
                        />
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}