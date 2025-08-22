"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TrashIcon } from "@/assets/icons";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui-elements/table";
import { isValidImageUrl } from "../functions";
import { createCategory, deleteCategory, getCategories, updateCategory } from "@/app/(courses)/fetch";
import { uploadImage } from "@/upload";
import toast from "react-hot-toast";
import { Pencil, Plus } from "lucide-react";

export function CategoryTable() {
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [categories, setCategories] = useState<any[]>([]);

    // 🔧 NEW: Add Course modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [addFormData, setAddFormData] = useState<any>({
        name: "",
        image: null as File | null,
    });
    const [addImagePreview, setAddImagePreview] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await getCategories();
            setCategories(res.categories);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">

            {/* 🔧 NEW: Add Course button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => {
                        // reset add form each open
                        setAddFormData({
                            name: "",
                            image: null,
                        });
                        setAddImagePreview(null);
                        setShowAddModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                    <Plus size={16} /> Add Category
                </button>
            </div>

            {loading ? (
                <p className="text-center py-4">Loading categories...</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
                            <TableHead className="min-w-[220px]">Course</TableHead>
                            <TableHead className="min-w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {categories.map((item: any, index: number) => (
                            <TableRow
                                key={index}
                                className="hover:bg-muted/40 dark:hover:bg-muted/10 transition-colors border-[#eee] dark:border-dark-3"
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={
                                                isValidImageUrl(item?.image)
                                                    ? `${process.env.NEXT_PUBLIC_BASEURL}${item?.image}`
                                                    : "https://gyanitalk.com/build/assets/images/person.png"
                                            }

                                            className="object-cover rounded-md border border-gray-300 dark:border-dark-3"
                                            width={42}
                                            height={42}
                                            alt={item?.name || "Course"}
                                        />
                                        <span className="text-dark dark:text-white font-medium line-clamp-1">
                                            {item?.name || "-"}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingCourse(item);
                                                setFormData({ ...item });
                                                setImagePreview(
                                                    isValidImageUrl(item?.image)
                                                        ? `${process.env.NEXT_PUBLIC_BASEURL}${item.image}`
                                                        : null
                                                );
                                                setShowEditModal(true);
                                            }}
                                            className="text-blue-500 hover:text-blue-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedCourseId(item.id);
                                                setShowModal(true);
                                            }}
                                            className="text-red-500 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <span className="sr-only">Delete</span>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Delete Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Delete Course
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete this course? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (selectedCourseId) {
                                        const result = await deleteCategory(selectedCourseId);
                                        if (result.success) {
                                            toast.success(`category deleted successfully!`);
                                            fetchCategories();
                                        } else {
                                            toast.error("Failed to delete");
                                        }
                                        setShowModal(false);
                                        setSelectedCourseId(null);
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3">
                            ✏️ Edit Category
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Category Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                />
                            </div>


                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category Image
                                </label>
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-24 h-24 rounded object-cover mb-2 border"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setFormData({ ...formData, image: file });
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="w-full text-sm text-gray-700 dark:text-gray-300"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingCourse(null);
                                    setImagePreview(null);
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    let updatedFormData = { ...formData };

                                    if (formData.image instanceof File) {
                                        const uploadData = await uploadImage(formData.image, "images");
                                        if (uploadData?.success && uploadData?.path) {
                                            updatedFormData.image = uploadData.path;
                                            toast.success("Image Upload Success");
                                        } else {
                                            toast.error("Image upload failed");
                                            return;
                                        }
                                    }

                                    // 🔧 FIX: use editingCourse.id instead of 12
                                    const result = await updateCategory(editingCourse.id, updatedFormData);

                                    if (result.success) {
                                        toast.success("Course updated successfully");
                                        fetchCategories();
                                        setShowEditModal(false);
                                        setEditingCourse(null);
                                        setImagePreview(null);
                                    } else {
                                        toast.error("Update failed");
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔧 NEW: Add Course Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3">
                            ➕ Add Category
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Category Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={addFormData.name}
                                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category Image
                                </label>
                                {addImagePreview && (
                                    <img
                                        src={addImagePreview}
                                        alt="Preview"
                                        className="w-24 h-24 rounded object-cover mb-2 border"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setAddFormData({ ...addFormData, image: file });
                                        setAddImagePreview(file ? URL.createObjectURL(file) : null);
                                    }}
                                    className="w-full text-sm text-gray-700 dark:text-gray-300"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setAddImagePreview(null);
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        let payload: any = { ...addFormData };

                                        // upload image if provided
                                        if (addFormData.image instanceof File) {
                                            const uploadData = await uploadImage(addFormData.image, "images");
                                            if (uploadData?.success && uploadData?.path) {
                                                payload.image = uploadData.path;
                                                toast.success("Image Upload Success");
                                            } else {
                                                toast.error("Image upload failed");
                                                return;
                                            }
                                        } else {
                                            // if no image chosen, remove key so backend doesn’t get null/undefined
                                            delete payload.image;
                                        }

                                        const result = await createCategory(payload);

                                        if (result?.success) {
                                            toast.success("Course created successfully");
                                            setShowAddModal(false);
                                            setAddImagePreview(null);
                                            setAddFormData({
                                                name: "",
                                                category_id: "",
                                                price: 0,
                                                offer_price: 0,
                                                is_paid: 0,
                                                description: "",
                                                image: null,
                                            });
                                            fetchCategories();
                                        } else {
                                            toast.error(result?.message || "Failed to create course");
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        toast.error("Something went wrong");
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Create Category
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
