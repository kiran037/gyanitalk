// components/supports/faq/AnswerModal.tsx
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { useState, useEffect } from "react";
import { FileText, HelpCircle, MessageSquare } from "lucide-react";
import { RichTextEditor } from "@/components/courses/RichTextEditor";


interface Answer {
  id: string;
  title: string | null;
  description: string | null;
  helpSupportId: string;
  helpSupportQuationId: string;
  isActive: boolean;
  isChatWithus: number;
}

interface Question {
  id: string;
  question: string;
  helpSupportId?: string;
}

interface AnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  answer: Answer | null;
  questions: Question[];
}

export function AnswerModal({
  isOpen,
  onClose,
  onSuccess,
  answer,
  questions,
}: AnswerModalProps) {
  const [formData, setFormData] = useState({
    helpSupportQuationId: "",
    helpSupportId: "",
    title: "",
    description: "",
    isActive: true,
    isChatWithus: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (answer) {
      setFormData({
        helpSupportQuationId: answer.helpSupportQuationId,
        helpSupportId: answer.helpSupportId,
        title: answer.title || "",
        description: answer.description || "",
        isActive: answer.isActive,
        isChatWithus: answer.isChatWithus,
      });
    } else {
      setFormData({
        helpSupportQuationId: "",
        helpSupportId: "",
        title: "",
        description: "",
        isActive: true,
        isChatWithus: 0,
      });
    }
    setError("");
  }, [answer, isOpen]);

  const handleQuestionChange = (questionId: string) => {
    const selectedQuestion = questions.find((q) => q.id === questionId);
    setFormData({
      ...formData,
      helpSupportQuationId: questionId,
      helpSupportId: selectedQuestion?.helpSupportId || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.helpSupportQuationId || !formData.helpSupportId) {
      setError("Question is required");
      return;
    }

    setLoading(true);
    try {
      const url = answer
        ? `/api/support/faq/answers/${answer.id}`
        : "/api/support/faq/answers";

      const response = await fetch(url, {
        method: answer ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          title: formData.title || null,
          description: formData.description || null,
          createdBy: 1,
          modifiedBy: 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Failed to save answer");
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
      title={answer ? "Edit Answer" : "Create Answer"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Question Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <select
              value={formData.helpSupportQuationId}
              onChange={(e) => handleQuestionChange(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            >
              <option value="">Select question</option>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.question}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
        <Input
          label="Answer Title (Optional)"
          name="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Step-by-step guide"
          icon={<FileText className="w-4 h-4" />}
        />

        {/* Description - Rich Text Editor */}
        <RichTextEditor
          label="Detailed Answer"
          value={formData.description}
          onChange={(val) => setFormData({ ...formData, description: val })}
          placeholder="Provide a detailed answer with formatting support (HTML allowed)..."
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Supports HTML formatting for rich content
          </p>
          <p className="text-xs text-gray-500">
            {formData.description.length} characters
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
            {answer ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}