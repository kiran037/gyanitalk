// components/supports/faq/QuestionManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { QuestionModal } from "./QuestionModal";
import { Plus, Edit, Trash2, HelpCircle, MessageCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

interface Question {
  id: string;
  question: string;
  answer: string | null;
  helpSupportId: string;
  isActive: boolean;
  isChatWithus: number;
  support: { id: string; name: string } | null;
  answerCount: number;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

export function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/support/faq/categories?limit=100");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("categoryId", selectedCategory);

      const response = await fetch(`/api/support/faq/questions?${params}`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchQuestions();
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedQuestion) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/support/faq/questions/${selectedQuestion.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedQuestion(null);
        fetchQuestions();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (question: Question) => {
    try {
      const response = await fetch(`/api/support/faq/questions/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !question.isActive,
          modifiedBy: 1,
        }),
      });

      if (response.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error("Toggle active failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search questions..."
          className="flex-1"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedQuestion(null);
            setShowModal(true);
          }}
        >
          Add Question
        </Button>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <HelpCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No questions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {question.support && (
                      <span className="inline-flex px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                        {question.support.name}
                      </span>
                    )}
                    {question.isChatWithus === 1 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-medium text-blue-700 dark:text-blue-400">
                        <MessageCircle className="w-3 h-3" />
                        Chat
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                    {question.question}
                  </h3>
                  {question.answer && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {question.answer}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{question.answerCount} detailed answers</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(question)}
                    className={`p-2 rounded-lg transition-colors ${
                      question.isActive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    }`}
                  >
                    {question.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                    onClick={() => handleEdit(question)}
                    ariaLabel="Edit"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4 text-red-500" />}
                    onClick={() => {
                      setSelectedQuestion(question);
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
      <QuestionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedQuestion(null);
        }}
        onSuccess={fetchQuestions}
        question={selectedQuestion}
        categories={categories}
      />

      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedQuestion(null);
        }}
        onConfirm={handleDelete}
        title="Delete Question"
        message={`Are you sure you want to delete this question? All related answers will also be deleted. This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}