///Users/xeoren/gyanitallk-admin/src/components/adminUI/ActionModal.tsx
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "./Button";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  loading?: boolean;
}

export function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  loading = false,
}: ActionModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    danger: <Trash2 className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
    info: <AlertTriangle className="w-6 h-6" />,
  };

  const colorMap = {
    danger: "text-red-600 bg-red-100 dark:bg-red-900/20",
    warning: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
    info: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-full ${colorMap[type]} flex items-center justify-center mb-4`}>
          {iconMap[type]}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={type === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            className="flex-1"
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}