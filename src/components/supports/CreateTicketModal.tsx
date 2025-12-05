// components/supports/CreateTicketModal.tsx
import { Modal } from "../adminUI/Modal";
import { Input } from "../adminUI/Input";
import { Button } from "../adminUI/Button";
import { useState } from "react";
import { User, Tag, FileText, MessageSquare } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

export function CreateTicketModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
}: CreateTicketModalProps) {
  const [formData, setFormData] = useState({
    userId: "",
    helpSupportId: "",
    subject: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.userId || !formData.helpSupportId || !formData.subject || !formData.description) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          createdBy: 1, // Replace with actual admin user ID
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setFormData({
          userId: "",
          helpSupportId: "",
          subject: "",
          description: "",
        });
        onSuccess();
      } else {
        setError(data.error || "Failed to create ticket");
      }
    } catch (error) {
      console.error("Create ticket failed:", error);
      setError("An error occurred while creating the ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Ticket" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User ID */}
          <Input
            label="User ID"
            name="userId"
            type="text"
            value={formData.userId}
            onChange={handleChange}
            placeholder="Enter user ID"
            required
            icon={<User className="w-4 h-4" />}
          />

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Tag className="w-4 h-4" />
              </div>
              <select
                name="helpSupportId"
                value={formData.helpSupportId}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subject */}
        <Input
          label="Subject"
          name="subject"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Brief description of the issue"
          required
          icon={<FileText className="w-4 h-4" />}
        />

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the issue..."
              required
              rows={6}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 resize-none"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-xs text-blue-800 dark:text-blue-400">
            <strong>Note:</strong> A unique ticket number will be automatically generated upon creation.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="flex-1"
            loading={loading}
          >
            Create Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}