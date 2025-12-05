// components/earnings/WithdrawalTable.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { avatar } from "@/lib/images";

interface Withdrawal {
  id: string;
  astrologerId: string;
  withdrawAmount: string;
  status: string;
  paymentMethod: number | null;
  upiId: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  accountHolderName: string | null;
  created_at: string;
  updated_at: string;
  astrologer: {
    id: string;
    name: string;
    email: string;
    contactNo: string;
    profileImage: string | null;
  } | null;
  withdrawmethod: {
    id: number;
    method_name: string;
  } | null;
}

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
    const s = status?.toLowerCase?.() || '';
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      released: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      reject: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[s] || colors.pending;
  };


  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase?.() || '';
    const icons: Record<string, any> = {
      pending: Clock,
      approved: CheckCircle,
      released: CheckCircle,
      rejected: XCircle,
      reject: XCircle,
    };
    const Icon = icons[s] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase?.() || '';
    if (s === 'pending') return 'Pending';
    if (s === 'released' || s === 'approved') return 'Approved';
    if (s === 'reject' || s === 'rejected') return 'Rejected';
    return status || 'Unknown';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Astrologer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {withdrawals.map((withdrawal) => (
              <motion.tr
                key={withdrawal.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700">
                      {withdrawal.astrologer?.profileImage ? (
                        <img
                          src={avatar(withdrawal.astrologer.profileImage)}
                          alt={withdrawal.astrologer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                            {withdrawal.astrologer?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {withdrawal.astrologer?.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {withdrawal.astrologer?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{parseFloat(withdrawal.withdrawAmount).toLocaleString('en-IN')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {withdrawal.withdrawmethod?.method_name || 'Not specified'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(withdrawal.status)}`}>
                    {getStatusIcon(withdrawal.status)}
                    {getStatusLabel(withdrawal.status)}
                  </span>

                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white font-medium">
                    {new Date(withdrawal.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(withdrawal.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => onViewDetail(withdrawal)}
                      ariaLabel="View Details"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    />
                    {(withdrawal.status || '').toLowerCase() === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<CheckCircle className="w-4 h-4" />}
                          onClick={() => onApprove(withdrawal)}
                          ariaLabel="Approve"
                          className="hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<XCircle className="w-4 h-4" />}
                          onClick={() => onReject(withdrawal)}
                          ariaLabel="Reject"
                          className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
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