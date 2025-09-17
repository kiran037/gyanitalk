"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckSquare, Edit, Trash2, Plus, Eye, X, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { addSubCategoryAction, editSubCategoryAction, deleteSubCategoryAction } from "@/app/helpSupport/actions";

// ---- DB Category Type ----
interface SubCategory {
  id: number;
  helpSupportId: number;
  helpSupportQuationId: number;
  title: string;
  description: string;
  isChatWithus: number;
}

interface Props {
  subsubCategories: SubCategory[];
}

// ---- Component ----
export default function HelpSupportSubSubCategory({ subsubCategories }: Props) {
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
  const closeEditModal = () => setEditModalOpen(false);
  const closeDeleteModal = () => setDeleteModalOpen(false);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-6 space-y-6 w-full">
        <div className="grid grid-cols-12 gap-6 mt-5">
            <div className="intro-y col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
                <div className="intro-y box mt-5 w-full">
                <div id="boxed-accordion" className="p-5">
                    <div className="preview">
                    {subsubCategories.map((subCategory) => (
                    <div key={subCategory.id} className="card border p-2 mt-5">
                        <div style={{ display: "inline-block" }}>
                            <b>{subCategory.title}</b>
                            <div
                            dangerouslySetInnerHTML={{ __html: subCategory.description }}
                            />
                        </div>
                        <div style={{ float: "right" }}>
                            <button
                            className="items-center mr-3 text-primary actionbtn"
                            onClick={() => handleEdit(subCategory)}
                            >
                            <Edit className="w-4 h-4 mr-1 inline" /> Edit
                            </button>
                            <button
                            className="items-center mr-3 text-danger actionbtn"
                            onClick={() => handleDelete(subCategory.id)}
                            >
                            <Trash2 className="w-4 h-4 mr-1 inline" /> Delete
                            </button>
                        </div>
                    </div>
                    ))}
                    </div>
                </div>
                </div>
            </div>
        </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedSubCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 relative">
            <h2 className="text-lg font-bold mb-4">Edit SubCategory</h2>
            <input
              type="text"
              className="w-full border p-2 rounded mb-3"
              defaultValue={selectedSubCategory.title}
            />
            <textarea
              className="w-full border p-2 rounded mb-3"
              defaultValue={selectedSubCategory.description}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">
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
              <button className="px-4 py-2 bg-red-600 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
