// components/earnings/WithdrawalDetailModal.tsx
"use client";

import { Modal } from "@/components/adminUI/Modal";
import { User, CreditCard, Calendar, Building, Hash } from "lucide-react";
import { avatar } from "@/lib/images";

interface Withdrawal {
  id: string;
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
    name: string;
    email: string;
    contactNo: string;
    profileImage: string | null;
  } | null;
  withdrawmethod: {
    method_name: string;
  } | null;
}

interface WithdrawalDetailModalProps {
  withdrawal: Withdrawal;
  onClose: () => void;
}

export function WithdrawalDetailModal({ withdrawal, onClose }: WithdrawalDetailModalProps) {
  const InfoRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
      <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">{value}</div>
      </div>
    </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose} title="Withdrawal Details" size="lg">
      <div className="space-y-6">
        {/* Astrologer Info */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
            {withdrawal.astrologer?.profileImage && (
              <img
                src={avatar(withdrawal.astrologer.profileImage)}
                alt={withdrawal.astrologer.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {withdrawal.astrologer?.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {withdrawal.astrologer?.email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {withdrawal.astrologer?.contactNo}
            </p>
          </div>
        </div>

        {/* Withdrawal Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <div className="text-center p-6 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl text-white">
              <div className="text-sm opacity-90 mb-2">Withdrawal Amount</div>
              <div className="text-4xl font-bold">
                ₹{parseFloat(withdrawal.withdrawAmount).toLocaleString()}
              </div>
            </div>
          </div>

          <InfoRow
            icon={CreditCard}
            label="Payment Method"
            value={withdrawal.withdrawmethod?.method_name || 'Not specified'}
          />

          <InfoRow
            icon={Calendar}
            label="Request Date"
            value={new Date(withdrawal.created_at).toLocaleDateString()}
          />
        </div>

        {/* Payment Details */}
        {withdrawal.upiId && (
          <InfoRow
            icon={Hash}
            label="UPI ID"
            value={withdrawal.upiId}
          />
        )}

        {withdrawal.accountNumber && (
          <>
            <InfoRow
              icon={Building}
              label="Account Number"
              value={withdrawal.accountNumber}
            />
            <InfoRow
              icon={Building}
              label="IFSC Code"
              value={withdrawal.ifscCode || 'N/A'}
            />
            <InfoRow
              icon={User}
              label="Account Holder Name"
              value={withdrawal.accountHolderName || 'N/A'}
            />
          </>
        )}

        {/* Status */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Status
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              withdrawal.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : withdrawal.status === 'approved'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}