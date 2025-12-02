// app/courses/categories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { CategoryModal } from "@/components/courses/CategoryModal";
import { DeleteConfirmModal } from "@/components/courses/DeleteConfirmModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";

interface Category {
  id: number;
  name: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  _count?: {
    courses: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const addToast = useToast();

  useEffect(() => {
    fetchCategories();
  }, [searchQuery]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const response = await fetch(`/api/courses/categories?${params}`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      } else {
        addToast("error", "Error", data.error || "Failed to fetch categories");
      }
    } catch (error) {
      addToast("error", "Error", "Error fetching categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    try {
      const response = await fetch(`/api/courses/categories/${selectedCategory.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Category deleted successfully");
        fetchCategories();
        setShowDeleteModal(false);
        setSelectedCategory(null);
      } else {
        addToast("error", "Error", data.error || "Failed to delete category");
      }
    } catch (error) {
      addToast("error", "Error", "Error deleting category");
      console.error(error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

  const handleModalSuccess = () => {
    fetchCategories();
    handleModalClose();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Course Categories"
          subtitle="Manage your course categories"
          badge={{ text: "Management", variant: "blue" }}
          actions={
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
          }
        />

        {/* Search and Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search categories..."
              className="flex-1 min-w-[280px]"
            />
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FolderOpen className="w-4 h-4" />
              <span className="font-medium text-gray-900 dark:text-white">
                {categories.length}
              </span>
              categories
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
              >
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Categories Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Get started by creating your first category"}
              </p>
              {!searchQuery && (
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
              )}
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-[#FF6B35]/50 hover:shadow-lg transition-all p-6"
              >
                {/* Image */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  {category.image ? (
                    <img
                      src={avatar(category.image)}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderOpen className="w-8 h-8 text-white" />
                  )}
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {category._count?.courses || 0} courses
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Pencil className="w-3 h-3" />}
                    onClick={() => handleEdit(category)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="w-3 h-3" />}
                    onClick={() => handleDelete(category)}
                    ariaLabel="Delete category"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <CategoryModal
          category={selectedCategory}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {showDeleteModal && selectedCategory && (
        <DeleteConfirmModal
          title="Delete Category"
          message={`Are you sure you want to delete "${selectedCategory.name}"? ${
            selectedCategory._count?.courses
              ? `This category has ${selectedCategory._count.courses} courses that will need to be reassigned.`
              : ""
          }`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
}