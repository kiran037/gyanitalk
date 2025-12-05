// components/supports/faq/AnswerManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/adminUI/Button";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { AnswerModal } from "./AnswerModal";
import { Plus, Edit, Trash2, MessageSquare, HelpCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

interface Answer {
  id: string;
  title: string | null;
  description: string | null;
  helpSupportId: string;
  helpSupportQuationId: string;
  isActive: boolean;
  isChatWithus: number;
  question: {
    id: string;
    question: string;
  } | null;
  created_at: string;
}

interface Question {
  id: string;
  question: string;
}

export function AnswerManager() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
    fetchAnswers();
  }, [selectedQuestion]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/support/faq/questions?limit=100");
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const fetchAnswers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (selectedQuestion) params.append("questionId", selectedQuestion);

      const response = await fetch(`/api/support/faq/answers?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnswers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch answers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (answer: Answer) => {
    setSelectedAnswer(answer);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedAnswer) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/support/faq/answers/${selectedAnswer.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedAnswer(null);
        fetchAnswers();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (answer: Answer) => {
    try {
      const response = await fetch(`/api/support/faq/answers/${answer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !answer.isActive,
          modifiedBy: 1,
        }),
      });

      if (response.ok) {
        fetchAnswers();
      }
    } catch (error) {
      console.error("Toggle active failed:", error);
    }
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "";
    const stripped = text.replace(/<[^>]*>/g, "");
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <select
          value={selectedQuestion}
          onChange={(e) => setSelectedQuestion(e.target.value)}
          className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
        >
          <option value="">All Questions</option>
          {questions.map((q) => (
            <option key={q.id} value={q.id}>
              {q.question}
            </option>
          ))}
        </select>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedAnswer(null);
            setShowModal(true);
          }}
        >
          Add Answer
        </Button>
      </div>

      {/* Answers List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : answers.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No answers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {answers.map((answer, index) => (
            <motion.div
              key={answer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  {answer.question && (
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {answer.question.question}
                      </p>
                    </div>
                  )}
                  {answer.title && (
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                      {answer.title}
                    </h3>
                  )}
                  {answer.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {truncateText(answer.description, 200)}
                    </div>
                  )}
                  {answer.isChatWithus === 1 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-medium text-blue-700 dark:text-blue-400 mt-2">
                      <MessageSquare className="w-3 h-3" />
                      Chat enabled
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(answer)}
                    className={`p-2 rounded-lg transition-colors ${
                      answer.isActive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    }`}
                  >
                    {answer.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                    onClick={() => handleEdit(answer)}
                    ariaLabel="Edit"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4 text-red-500" />}
                    onClick={() => {
                      setSelectedAnswer(answer);
                      setShowDeleteModal(true);
                    }}
                    ariaLabel="Delete"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnswerModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedAnswer(null);
        }}
        onSuccess={fetchAnswers}
        answer={selectedAnswer}
        questions={questions}
      />

      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAnswer(null);
        }}
        onConfirm={handleDelete}
        title="Delete Answer"
        message="Are you sure you want to delete this answer? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}