"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckSquare, Edit, Trash2, Plus, Eye, X, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { editSubSubCategoryAction, deleteSubSubCategoryAction } from "@/app/helpSupport/actions";

// ---- DB Category Type ----
type SubCategory = {
  id: number;
  title: string;
  description: string;
  isChatWithus: number;
  helpSupportId: number;
  helpSupportQuationId: number;
};

// ---- Component ----
export default function HelpSupportSubSubCategory({ subsubCategories }: { subsubCategories: SubCategory[]}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // Edit button click
  const handleEdit = (sub: SubCategory) => {
    setSelectedSubCategory(sub);
    setEditModalOpen(true);
  };

  // Delete button click
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  // Close modals
  const closeEditModal = () => {
    setSelectedSubCategory(null);
    setEditModalOpen(false);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
    setDeleteModalOpen(false);
  };


  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

    // ---- Submit Edit ----
  const saveEdit = async () => {
    if (!selectedSubCategory) return;

    await editSubSubCategoryAction({
      id: selectedSubCategory.id,
      supportId: selectedSubCategory.helpSupportId,
      helpSupportQuationId: selectedSubCategory.helpSupportQuationId,
      title: selectedSubCategory.title,
      description: selectedSubCategory.description,
      isChatWithus: selectedSubCategory.isChatWithus,
    });

    closeEditModal();
    window.location.reload();
  };

  // ---- Confirm Delete ----
  const confirmDelete = async () => {
    if (!deleteId) return;

    await deleteSubSubCategoryAction(deleteId);
    
    closeDeleteModal();
    window.location.reload();
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-6 space-y-6 w-full">
        <div className="space-y-4">
            {subsubCategories.map((subCategory) => (
            <div key={subCategory.id} className="border rounded-lg">
                 {/* Header */}
                <div
                className="flex justify-between items-center p-4 cursor-pointer bg-gray-100 rounded-t-lg"
                onClick={() => toggleAccordion(subCategory.id)}
                >
                    <span className="font-semibold">{subCategory.title}</span>

                    <div className="flex gap-3">

                        {/* ✅ Edit */}
                        <button
                            className="flex items-center text-blue-500"
                            onClick={() => handleEdit(subCategory)}
                            >
                            <Edit className="w-4 h-4 mr-1 inline" /> Edit
                        </button>

                        {/* ✅ Delete */}
                        <button
                            className="flex items-center text-red-600"
                            onClick={() => handleDelete(subCategory.id)}
                            >
                            <Trash2 className="w-4 h-4 mr-1 inline" /> Delete
                        </button>
                    </div>
                </div>
                {/* Body */}
                {openId === subCategory.id && (
                <div className="p-4 text-gray-600">
                    <div dangerouslySetInnerHTML={{ __html: subCategory.description ?? "" }} />
                </div>
                )}
            </div>
            ))}
        </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedSubCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 relative">
            <h2 className="text-lg font-bold mb-4">Edit SubCategory</h2>
            <input
              type="text"
              className="w-full border p-2 rounded mb-3"
              value={selectedSubCategory.title}
              onChange={(e) =>
                setSelectedSubCategory({ ...selectedSubCategory, title: e.target.value })
              }
            />
            <textarea
              className="w-full border p-2 rounded mb-3"
              value={selectedSubCategory.description ?? ""}
              onChange={(e) =>
                setSelectedSubCategory({ ...selectedSubCategory, description: e.target.value })
              }
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && deleteId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this subcategory?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
