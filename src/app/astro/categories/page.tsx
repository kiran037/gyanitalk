// app/astro/categories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, GripVertical, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { avatar } from "@/lib/images";
import { uploadImage } from "@/upload";

interface Category {
    id: string;
    name: string;
    image: string | null;
    displayOrder: number;
    isActive: boolean;
    astrologerCount: number;
    created_at: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterActive, setFilterActive] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        image: null as File | null,
        imagePreview: "",
        displayOrder: 0,
        isActive: true,
    });
    const [formLoading, setFormLoading] = useState(false);

    const addToast = useToast();

    useEffect(() => {
        fetchCategories();
    }, [currentPage, filterActive]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
                ...(searchQuery && { search: searchQuery }),
                ...(filterActive && { isActive: filterActive }),
            });

            const response = await fetch(`/api/astrologers/categories?${params}`);
            const data = await response.json();

            if (data.success) {
                setCategories(data.data);
                setTotalPages(data.pagination.totalPages);
                setTotalCount(data.pagination.totalCount);
            }
        } catch (error) {
            addToast("error", "Error", "Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchCategories();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file, imagePreview: URL.createObjectURL(file) });
        }
    };

    const handleCreate = async () => {
        setFormLoading(true);
        try {
            let imagePath = "";
            if (formData.image) {
                const uploadResult = await uploadImage(formData.image, "categories");
                imagePath = uploadResult.mainPath;
            }

            const response = await fetch("/api/astrologers/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    image: imagePath,
                    displayOrder: formData.displayOrder,
                    isActive: formData.isActive,
                    createdBy: 1,
                }),
            });

            const data = await response.json();

            if (data.success) {
                addToast("success", "Success", "Category created successfully");
                setShowCreateModal(false);
                fetchCategories();
                resetForm();
            } else {
                addToast("error", "Error", data.error);
            }
        } catch (error) {
            addToast("error", "Error", "Failed to create category");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedCategory) return;
        setFormLoading(true);
        try {
            let imagePath = selectedCategory.image;
            if (formData.image) {
                const uploadResult = await uploadImage(formData.image, "categories");
                imagePath = uploadResult.mainPath;
            }

            const response = await fetch(`/api/astrologers/categories/${selectedCategory.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    image: imagePath,
                    displayOrder: formData.displayOrder,
                    isActive: formData.isActive,
                    modifiedBy: 1,
                }),
            });

            const data = await response.json();

            if (data.success) {
                addToast("success", "Success", "Category updated successfully");
                setShowEditModal(false);
                fetchCategories();
                resetForm();
            } else {
                addToast("error", "Error", data.error);
            }
        } catch (error) {
            addToast("error", "Error", "Failed to update category");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;
        setFormLoading(true);
        try {
            const response = await fetch(
                `/api/astrologers/categories/${selectedCategory.id}?modifiedBy=1`,
                { method: "DELETE" }
            );

            const data = await response.json();

            if (data.success) {
                addToast("success", "Success", "Category deleted successfully");
                setShowDeleteModal(false);
                fetchCategories();
            } else {
                addToast("error", "Error", data.error);
            }
        } catch (error) {
            addToast("error", "Error", "Failed to delete category");
        } finally {
            setFormLoading(false);
        }
    };

    const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
        if (selectedCategories.length === 0) {
            addToast("warning", "Warning", "Please select categories first");
            return;
        }

        try {
            const response = await fetch("/api/astrologers/categories", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    categoryIds: selectedCategories.map(id => BigInt(id)),
                    modifiedBy: 1,
                }),
            });

            const data = await response.json();

            if (data.success) {
                addToast("success", "Success", data.message);
                setSelectedCategories([]);
                fetchCategories();
            } else {
                addToast("error", "Error", data.error);
            }
        } catch (error) {
            addToast("error", "Error", `Failed to ${action} categories`);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(categories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const reorderedCategories = items.map((category, index) => ({
            id: category.id,
            displayOrder: index + 1,
        }));

        setCategories(items);

        try {
            const response = await fetch("/api/astrologers/categories/reorder", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categories: reorderedCategories,
                    modifiedBy: 1,
                }),
            });

            const data = await response.json();

            if (data.success) {
                addToast("success", "Success", "Categories reordered successfully");
            } else {
                addToast("error", "Error", data.error);
                fetchCategories();
            }
        } catch (error) {
            addToast("error", "Error", "Failed to reorder categories");
            fetchCategories();
        }
    };

    const openEditModal = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            image: null,
            imagePreview: category.image ? avatar(category.image) : "",
            displayOrder: category.displayOrder,
            isActive: category.isActive,
        });
        setShowEditModal(true);
    };

    const openViewModal = (category: Category) => {
        setSelectedCategory(category);
        setShowViewModal(true);
    };

    const openDeleteModal = (category: Category) => {
        setSelectedCategory(category);
        setShowDeleteModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            image: null,
            imagePreview: "",
            displayOrder: 0,
            isActive: true,
        });
        setSelectedCategory(null);
    };

    const toggleSelectAll = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(categories.map((c) => c.id));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <PageHeader
                    title="Categories Management"
                    subtitle="Manage astrologer categories and specializations"
                    badge={{ text: "CATEGORIES", variant: "orange" }}
                    actions={
                        <Button onClick={() => setShowCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
                            Add Category
                        </Button>
                    }
                />

                {/* Filters & Search */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search categories..."
                            className="flex-1"
                        />
                        <Button onClick={handleSearch}>Search</Button>

                        <select
                            value={filterActive}
                            onChange={(e) => setFilterActive(e.target.value)}
                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedCategories.length > 0 && (
                        <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                {selectedCategories.length} selected
                            </span>
                            <Button size="sm" variant="outline" onClick={() => handleBulkAction("activate")}>
                                Activate
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleBulkAction("deactivate")}>
                                Deactivate
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleBulkAction("delete")}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Categories</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
                        <div className="text-2xl font-bold text-green-600">
                            {categories.filter((c) => c.isActive).length}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Astrologers</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {categories.reduce((sum, c) => sum + c.astrologerCount, 0)}
                        </div>
                    </div>
                </div>

                {/* Categories Grid/Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No categories found</div>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="categories">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef}>
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.length === categories.length}
                                                            onChange={toggleSelectAll}
                                                            className="rounded"
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                        Order
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                        Image
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                        Category Name
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                        Astrologers
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {categories.map((category, index) => (
                                                    <Draggable key={category.id} draggableId={category.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <tr
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${snapshot.isDragging ? "bg-gray-100 dark:bg-gray-700" : ""
                                                                    }`}
                                                            >
                                                                <td className="px-4 py-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedCategories.includes(category.id)}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedCategories([...selectedCategories, category.id]);
                                                                            } else {
                                                                                setSelectedCategories(
                                                                                    selectedCategories.filter((id) => id !== category.id)
                                                                                );
                                                                            }
                                                                        }}
                                                                        className="rounded"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div {...provided.dragHandleProps} className="cursor-grab">
                                                                        <GripVertical className="w-4 h-4 text-gray-400" />
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {category.image ? (
                                                                        <img
                                                                            src={avatar(category.image)}
                                                                            alt={category.name}
                                                                            className="w-10 h-10 rounded-lg object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                                            <ImageIcon className="w-5 h-5 text-gray-400" />
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                                        {category.name}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {category.astrologerCount} astrologers
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {category.isActive ? (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                                                                            <CheckCircle className="w-3 h-3" />
                                                                            Active
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                                                                            <XCircle className="w-3 h-3" />
                                                                            Inactive
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            icon={<Eye className="w-4 h-4" />}
                                                                            onClick={() => openViewModal(category)}
                                                                            ariaLabel="View"
                                                                        />
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            icon={<Edit2 className="w-4 h-4" />}
                                                                            onClick={() => openEditModal(category)}
                                                                            ariaLabel="Edit"
                                                                        />
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            icon={<Trash2 className="w-4 h-4" />}
                                                                            onClick={() => openDeleteModal(category)}
                                                                            ariaLabel="Delete"
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((p) => p - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((p) => p + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Category" size="md">
                <div className="space-y-4">
                    <Input
                        label="Category Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter category name"
                        required
                    />

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35]/10 file:text-[#FF6B35] hover:file:bg-[#FF6B35]/20"
                        />
                        {formData.imagePreview && (
                            <img
                                src={formData.imagePreview}
                                alt="Preview"
                                className="mt-2 w-24 h-24 rounded-lg object-cover"
                            />
                        )}
                    </div>

                    <Input
                        label="Display Order"
                        type="number"
                        value={
                            formData.displayOrder === null || formData.displayOrder === undefined
                                ? ""
                                : formData.displayOrder.toString()
                        }
                        onChange={(e) => {
                            const val = e.target.value;
                            setFormData({
                                ...formData,
                                displayOrder: val === "" ? 0 : Number(val) || 0,
                            });
                        }}
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                            Active
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} loading={formLoading} className="flex-1">
                            Create
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Category" size="md">
                <div className="space-y-4">
                    <Input
                        label="Category Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter category name"
                        required
                    />

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35]/10 file:text-[#FF6B35] hover:file:bg-[#FF6B35]/20"
                        />
                        {formData.imagePreview && (
                            <img
                                src={formData.imagePreview}
                                alt="Preview"
                                className="mt-2 w-24 h-24 rounded-lg object-cover"
                            />
                        )}
                    </div>
                    <Input
                        label="Display Order"
                        type="number"
                        value={
                            formData.displayOrder === null || formData.displayOrder === undefined
                                ? ""
                                : formData.displayOrder.toString()
                        }
                        onChange={(e) => {
                            const val = e.target.value;
                            setFormData({
                                ...formData,
                                displayOrder: val === "" ? 0 : Number(val) || 0,
                            });
                        }}
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="editIsActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded"
                        />
                        <label htmlFor="editIsActive" className="text-sm text-gray-700 dark:text-gray-300">
                            Active
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleEdit} loading={formLoading} className="flex-1">
                            Update
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Category Details">
                {selectedCategory && (
                    <div className="space-y-4">
                        {selectedCategory.image && (
                            <div>
                                <label className="text-xs font-medium text-gray-500">Image</label>
                                <img
                                    src={avatar(selectedCategory.image)}
                                    alt={selectedCategory.name}
                                    className="mt-2 w-32 h-32 rounded-lg object-cover"
                                />
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-medium text-gray-500">Name</label>
                            <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedCategory.name}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Display Order</label>
                            <p className="text-sm text-gray-900 dark:text-white mt-1">
                                {selectedCategory.displayOrder}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Astrologers Count</label>
                            <p className="text-sm text-gray-900 dark:text-white mt-1">
                                {selectedCategory.astrologerCount} astrologers
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Status</label>
                            <p className="text-sm text-gray-900 dark:text-white mt-1">
                                {selectedCategory.isActive ? "Active" : "Inactive"}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Modal */}
            <ActionModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                type="danger"
                loading={formLoading}
            />
        </div>
    );
}