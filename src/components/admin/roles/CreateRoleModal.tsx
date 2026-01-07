import { useState } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { Shield } from "lucide-react";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateRoleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRoleModalProps) {
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!roleName.trim()) {
      setError("Role name is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setRoleName("");
        onSuccess();
      } else {
        setError(data.error || "Failed to create role");
      }
    } catch (error) {
      console.error("Failed to create role:", error);
      setError("Failed to create role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRoleName("");
      setError("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Role"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10 rounded-2xl">
            <Shield className="w-12 h-12 text-[#FF6B35]" />
          </div>
        </div>

        {/* Description */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Create a new role that can be assigned to users. Role names should be unique and descriptive.
        </p>

        {/* Input */}
        <Input
          label="Role Name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          placeholder="e.g., Manager, Support Staff, Content Creator"
          required
          disabled={loading}
        />

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Info */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Once created, role names cannot be edited or deleted. Choose wisely!
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1"
          >
            Create Role
          </Button>
        </div>
      </form>
    </Modal>
  );
}