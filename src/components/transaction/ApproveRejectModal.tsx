
// components/transaction/ApproveRejectModal.tsx
import { useState } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Button } from "@/components/adminUI/Button";
import { CheckCircle, XCircle } from "lucide-react";

interface ApproveRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: number;
    amount: number | null;
    user: { name: string; email: string } | null;
    paymentReference: string | null;
    attachment: string | null;
  };
  onSuccess: () => void;
}

export default function ApproveRejectModal({ isOpen, onClose, transaction, onSuccess }: ApproveRejectModalProps) {
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/transactions/manual/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason }),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || "Failed to process");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Manual Payment">
      <div className="space-y-6">
        {/* Transaction Details */}
        <div className="bg-gray-50 dark:bg-gray-900/20 rounded-xl p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">User:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">₹{transaction.amount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Reference:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.paymentReference || "-"}</span>
          </div>
        </div>

        {/* Rejection Reason (only shown when rejecting) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rejection Reason (Optional)
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            rows={3}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => handleAction("approve")}
            loading={loading}
            icon={<CheckCircle className="w-4 h-4" />}
            className="flex-1"
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => handleAction("reject")}
            loading={loading}
            icon={<XCircle className="w-4 h-4" />}
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      </div>
    </Modal>
  );
}