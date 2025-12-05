// components/earnings/ManualAdjustmentModal.tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { DollarSign } from "lucide-react";

interface ManualAdjustmentModalProps {
  astrologerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManualAdjustmentModal({ 
  astrologerId, 
  onClose, 
  onSuccess 
}: ManualAdjustmentModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    transactionType: "manual_adjustment",
    isCredit: true,
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const addToast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/earnings/astrologer/${astrologerId}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          createdBy: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Manual adjustment created successfully");
        onSuccess();
      } else {
        addToast("error", "Error", data.error || "Failed to create adjustment");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to create adjustment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Manual Balance Adjustment"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="Enter amount"
          required
          min="0"
          step="0.01"
          icon={<DollarSign className="w-4 h-4" />}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.transactionType}
            onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
            required
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="manual_adjustment">Manual Adjustment</option>
            <option value="bonus">Bonus</option>
            <option value="refund">Refund</option>
            <option value="penalty">Penalty</option>
            <option value="correction">Correction</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.isCredit}
                onChange={() => setFormData({ ...formData, isCredit: true })}
                className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Credit (Add to balance)
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!formData.isCredit}
                onChange={() => setFormData({ ...formData, isCredit: false })}
                className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Debit (Deduct from balance)
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add notes about this adjustment..."
            rows={3}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            className="flex-1"
          >
            Create Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}