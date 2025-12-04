"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Image as ImageIcon,
  GripVertical,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";
import { uploadImage } from "@/upload";
import { ActionModal } from "@/components/adminUI/ActionModal";

interface Category {
  id: string;
  name: string;
  categoryImage: string;
  isActive: boolean;
  _count?: { product: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/astroshop/categories?search=${search}`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      addToast("error", "Error", "Category name is required");
      return;
    }

    setSubmitting(true);
    try {
      let imagePath = editingCategory?.categoryImage || "";

      if (imageFile) {
        const uploaded = await uploadImage(imageFile, "categories");
        imagePath = uploaded.path;
      }

      const payload = {
        name: formData.name,
        categoryImage: imagePath,
        createdBy: 1,
        modifiedBy: 1,
      };

      const url = editingCategory
        ? `/api/astroshop/categories/${editingCategory.id}`
        : "/api/astroshop/categories";

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        addToast(
          "success",
          "Success",
          `Category ${editingCategory ? "updated" : "created"} successfully`
        );
        setIsModalOpen(false);
        resetForm();
        fetchCategories();
      } else {
        addToast("error", "Error", data.error || "Failed to save category");
      }
    } catch (error) {
      addToast("error", "Error", "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const response = await fetch(`/api/astroshop/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !category.isActive,
          modifiedBy: 1,
        }),
      });

      const data = await response.json();
      if (data.success) {
        addToast("success", "Success", "Category status updated");
        fetchCategories();
      }
    } catch (error) {
      addToast("error", "Error", "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/astroshop/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        addToast("success", "Success", "Category deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingCategory(null);
        fetchCategories();
      } else {
        addToast("error", "Error", data.error || "Failed to delete category");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete category");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", });
    setEditingCategory(null);
    setImageFile(null);
    setImagePreview("");
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
    });
    setImagePreview(avatar(category.categoryImage));
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PageHeader
            title="Product Categories"
            subtitle="Manage your product categories"
            badge={{ text: `${categories.length} Categories`, variant: "blue" }}
            actions={
              <Button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Category
              </Button>
            }
          />
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search categories..."
            className="max-w-md"
          />
        </motion.div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories
              .filter((cat) =>
                cat.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-[#FF6B35] transition-all p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon on Left */}
                    <div className="w-16 h-16 rounded-xl  dark:from-gray-700 dark:to-gray-600 flex-shrink-0">
                      <img
                        src={avatar(category.categoryImage)}
                        alt={category.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Info on Right */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {category.name}
                        </h3>
                        {/* Active Toggle at Top Right */}
                        <button
                          onClick={() => handleToggleActive(category)}
                          className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                        >
                          {category.isActive ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {category._count?.product || 0} products
                      </p>

                      {/* Buttons at Bottom */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingCategory ? "Edit Category" : "Add New Category"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Enter category name"
            required
          />

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category Image <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-[#FF6B35] transition-colors">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload image
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              className="flex-1"
            >
              {editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
      {/* Delete Confirmation Modal */}
      <ActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCategory(null);
        }}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={submitting}
      />
    </div>
  );
}