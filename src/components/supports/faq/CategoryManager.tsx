// components/supports/faq/CategoryManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { CategoryModal } from "./CategoryModal";
import { Plus, Edit, Trash2, HelpCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  questionCount: number;
  ticketCount: number;
  created_at: string;
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/support/faq/categories?${params}`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCategories();
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/support/faq/categories/${selectedCategory.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedCategory(null);
        fetchCategories();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const response = await fetch(`/api/support/faq/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !category.isActive,
          modifiedBy: 1,
        }),
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error("Toggle active failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search categories..."
          className="flex-1 max-w-md"
        />
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedCategory(null);
            setShowModal(true);
          }}
        >
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <HelpCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{category.questionCount} questions</span>
                    <span>•</span>
                    <span>{category.ticketCount} tickets</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(category)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    category.isActive
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                  }`}
                >
                  {category.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit className="w-3 h-3" />}
                  onClick={() => handleEdit(category)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="w-3 h-3 text-red-500" />}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowDeleteModal(true);
                  }}
                  ariaLabel="Delete category"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCategory(null);
        }}
        onSuccess={fetchCategories}
        category={selectedCategory}
      />

      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name}"? ${
          selectedCategory?.questionCount && selectedCategory.questionCount > 0
            ? "This category has questions and cannot be deleted."
            : "This action cannot be undone."
        }`}
        confirmText="Delete"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}