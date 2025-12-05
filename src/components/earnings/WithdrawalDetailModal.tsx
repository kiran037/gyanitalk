// components/earnings/WithdrawalDetailModal.tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Button } from "@/components/adminUI/Button";
import { User, CreditCard, Calendar, Building, Hash, CheckCircle, XCircle, Phone, Mail } from "lucide-react";
import { avatar } from "@/lib/images";
import { useToast } from "@/components/Toast/ToastProvider";

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

interface WithdrawalDetailModalProps {
  withdrawal: Withdrawal;
  onClose: () => void;
  onActionComplete?: () => void;
}

export function WithdrawalDetailModal({ withdrawal, onClose, onActionComplete }: WithdrawalDetailModalProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const addToast = useToast();

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/earnings/withdrawals/${withdrawal.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modifiedBy: 1 })
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Withdrawal approved successfully");
        onActionComplete?.();
        onClose();
      } else {
        addToast("error", "Error", data.error || "Failed to approve withdrawal");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to approve withdrawal");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
  const s = status?.toLowerCase?.() || '';
  if (s === 'pending') return 'Pending';
  if (s === 'released' || s === 'approved') return 'Approved';
  if (s === 'reject' || s === 'rejected') return 'Rejected';
  return status || 'Unknown';
};


  const handleReject = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/earnings/withdrawals/${withdrawal.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modifiedBy: 1,
          reason: "Rejected by admin"
        })
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Withdrawal rejected successfully");
        onActionComplete?.();
        onClose();
      } else {
        addToast("error", "Error", data.error || "Failed to reject withdrawal");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to reject withdrawal");
    } finally {
      setActionLoading(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white break-words">{value}</div>
      </div>
    </div>
  );

const getStatusColor = (status: string) => {
  const s = status?.toLowerCase?.() || '';
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    released: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    reject: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  };
  return colors[s] || colors.pending;
};


  const status = withdrawal.status?.toLowerCase?.() || '';



  return (
    <Modal isOpen={true} onClose={onClose} title="Withdrawal Request Details" size="lg">
      <div className="space-y-6">
        {/* Astrologer Info */}
        <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 overflow-hidden flex-shrink-0 ring-4 ring-white dark:ring-gray-800 shadow-lg">
            {withdrawal.astrologer?.profileImage ? (
              <img
                src={avatar(withdrawal.astrologer.profileImage)}
                alt={withdrawal.astrologer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-orange-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {withdrawal.astrologer?.name}
            </h3>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-3.5 h-3.5" />
                {withdrawal.astrologer?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-3.5 h-3.5" />
                {withdrawal.astrologer?.contactNo}
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Amount */}
        <div className="text-center p-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl text-white shadow-xl">
          <div className="text-sm font-medium opacity-90 mb-3">Withdrawal Amount</div>
          <div className="text-5xl font-bold mb-2">
            ₹{parseFloat(withdrawal.withdrawAmount).toLocaleString('en-IN')}
          </div>
          <div className="text-xs opacity-80">Request ID: #{withdrawal.id}</div>
        </div>

        {/* Payment Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Payment Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoRow
              icon={CreditCard}
              label="Payment Method"
              value={withdrawal.withdrawmethod?.method_name || 'Not specified'}
            />

            <InfoRow
              icon={Calendar}
              label="Request Date"
              value={new Date(withdrawal.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            />
          </div>

          {withdrawal.upiId && (
            <InfoRow
              icon={Hash}
              label="UPI ID"
              value={withdrawal.upiId}
            />
          )}

          {withdrawal.accountNumber && (
            <div className="grid grid-cols-1 gap-3">
              <InfoRow
                icon={Building}
                label="Account Number"
                value={withdrawal.accountNumber}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoRow
                  icon={Building}
                  label="IFSC Code"
                  value={withdrawal.ifscCode || 'N/A'}
                />
                <InfoRow
                  icon={User}
                  label="Account Holder"
                  value={withdrawal.accountHolderName || 'N/A'}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className={`p-4 rounded-xl border-2 ${getStatusColor(withdrawal.status)}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              Current Status
            </span>
           <span className="px-4 py-2 rounded-lg text-sm font-bold">
  {getStatusLabel(withdrawal.status)}
</span>
          </div>
        </div>

        {status === 'pending' && (
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="primary"
              icon={<CheckCircle className="w-5 h-5" />}
              onClick={handleApprove}
              loading={actionLoading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3"
            >
              Approve Withdrawal
            </Button>
            <Button
              variant="outline"
              icon={<XCircle className="w-5 h-5" />}
              onClick={handleReject}
              loading={actionLoading}
              className="flex-1 border-2 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold py-3"
            >
              Reject Request
            </Button>
          </div>
        )}

        {status !== 'pending' && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
            This withdrawal request has been {withdrawal.status}
          </div>
        )}

      </div>
    </Modal>
  );
}