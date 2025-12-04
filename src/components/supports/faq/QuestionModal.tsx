// components/supports/faq/QuestionModal.tsx
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { useState, useEffect } from "react";
import { HelpCircle, Tag, MessageSquare } from "lucide-react";
import { RichTextEditor } from "@/components/courses/RichTextEditor";


interface Question {
  id: string;
  question: string;
  answer: string | null;
  helpSupportId: string;
  isActive: boolean;
  isChatWithus: number;
}

interface Category {
  id: string;
  name: string;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  question: Question | null;
  categories: Category[];
}

export function QuestionModal({
  isOpen,
  onClose,
  onSuccess,
  question,
  categories,
}: QuestionModalProps) {
  const [formData, setFormData] = useState({
    helpSupportId: "",
    question: "",
    answer: "",
    isActive: true,
    isChatWithus: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (question) {
      setFormData({
        helpSupportId: question.helpSupportId,
        question: question.question,
        answer: question.answer || "",
        isActive: question.isActive,
        isChatWithus: question.isChatWithus,
      });
    } else {
      setFormData({
        helpSupportId: "",
        question: "",
        answer: "",
        isActive: true,
        isChatWithus: 0,
      });
    }
    setError("");
  }, [question, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.helpSupportId || !formData.question.trim()) {
      setError("Category and question are required");
      return;
    }

    setLoading(true);
    try {
      const url = question
        ? `/api/support/faq/questions/${question.id}`
        : "/api/support/faq/questions";

      const response = await fetch(url, {
        method: question ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          answer: formData.answer || null,
          createdBy: 1,
          modifiedBy: 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Failed to save question");
      }
    } catch (error) {
      console.error("Save failed:", error);
      setError("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={question ? "Edit Question" : "Create Question"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

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
              value={formData.helpSupportId}
              onChange={(e) => setFormData({ ...formData, helpSupportId: e.target.value })}
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

        {/* Question */}
        <Input
          label="Question"
          name="question"
          type="text"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          placeholder="What is your question?"
          required
          icon={<HelpCircle className="w-4 h-4" />}
        />

        {/* Short Answer (Optional) */}
        <div>
          <RichTextEditor
            label="Short Answer (Optional)"
            value={formData.answer}
            onChange={(val) => setFormData({ ...formData, answer: val })}
            placeholder="Brief answer (max 255 characters). For detailed answers, use the Answers tab."
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.answer.length}/255 characters
          </p>
        </div>


        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-[#FF6B35] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-[#FF6B35]/50"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isChatWithus"
              checked={formData.isChatWithus === 1}
              onChange={(e) => setFormData({ ...formData, isChatWithus: e.target.checked ? 1 : 0 })}
              className="w-4 h-4 text-[#FF6B35] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-[#FF6B35]/50"
            />
            <label htmlFor="isChatWithus" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable "Chat with us" option
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" className="flex-1" loading={loading}>
            {question ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}