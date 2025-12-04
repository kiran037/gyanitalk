import { Modal } from "@/components/adminUI/Modal";
import { Button } from "@/components/adminUI/Button";
import { AlertCircle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  couponCode: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  couponCode,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Coupon" size="sm">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Delete Coupon "{couponCode}"?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          This action cannot be undone. The coupon will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}