"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckSquare, Trash2, Plus, Eye, X, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { addSubCategoryAction, editSubCategoryAction, deleteSubCategoryAction } from "@/app/helpSupport/actions";

// ---- DB Category Type ----
export interface HelpSupportCategory {
  id: number;
  helpSupportId: number;
  helpSupportQuationId?: number;
  title?: string;        // Add ke liye
  description?: string;  // Add ke liye
  question?: string;     // Edit ke liye
  answer?: string;       // Edit ke liye
  isChatWithus: boolean;
}

// ---- FormData Type ----
type FormDataType = {
  id: number;
  supportId: number;
  helpSupportQuationId: number;
  title: string;
  description: string;
  question: string;
  answer: string;
  isChatWithus: boolean;
};

// ---- Component ----
export default function HelpSupportAccordion({ categories }: { categories: HelpSupportCategory[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ✅ single formData type with all fields
  const [formData, setFormData] = useState<FormDataType>({
    id: 0,
    supportId: 0,
    helpSupportQuationId: 0,
    title: "",
    description: "",
    question: "",
    answer: "",
    isChatWithus: false,
  });

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  // ---- Open Add Modal ----
  const openAddModal = (category: HelpSupportCategory) => {
    setModalMode("add");
    setFormData({
      id: 0,
      supportId: category.helpSupportId,
      helpSupportQuationId: category.id,
      title: "",
      description: "",
      question: "",
      answer: "",
      isChatWithus: false,
    });
    setIsModalOpen(true);
  };

  // ---- Open Edit Modal ----
  const openEditModal = (category: HelpSupportCategory) => {
    setModalMode("edit");
    setFormData({
      id: category.id,
      supportId: category.helpSupportId,
      helpSupportQuationId: 0, // 👈 edit me use nahi hoga
      title: "",
      description: "",
      question: category.question ?? "",
      answer: category.answer ?? "",
      isChatWithus: category.isChatWithus,
    });
    setIsModalOpen(true);
  };

  // ---- Open Delete Modal ----
  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
    setIsDeleteModalOpen(false);
  };

  // ---- Delete ----
  async function handleDelete() {
    if (deleteId) {
      try {
        const res = await deleteSubCategoryAction(deleteId);
        if (res.success) {
          toast.success("Deleted successfully!");
        } else {
          toast.error("Failed to delete.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong!");
      }
    }
    closeDeleteModal();
  }

  // ---- Save ----
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;

    if (modalMode === "add") {
      res = await addSubCategoryAction({
        supportId: formData.supportId,
        helpSupportQuationId: formData.helpSupportQuationId,
        title: formData.title,
        description: formData.description,
        isChatWithus: formData.isChatWithus ? 1 : 0,
      });
    } else {
      res = await editSubCategoryAction({
        id: formData.id,
        supportId: formData.supportId,
        question: formData.question,
        answer: formData.answer,
        isChatWithus: formData.isChatWithus ? 1 : 0,
      });
    }

    if (res.success) {
      toast.success(`${modalMode === "add" ? "Added" : "Updated"} successfully!`);
      setIsModalOpen(false);
    } else {
      toast.error("Failed to save.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-6 space-y-6 w-full">
      {/* <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Help Support SubCategory
      </h2> */}

       {/* Accordion List */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="border rounded-lg">
            {/* Header */}
            <div
              className="flex justify-between items-center p-4 cursor-pointer bg-gray-100 rounded-t-lg"
              onClick={() => toggleAccordion(category.id)}
            >
              <span className="font-semibold">{category.question}</span>

              <div className="flex gap-3">
                {/* ✅ Add */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openAddModal(category);
                  }}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </button>

                {/* ✅ View */}
                <Link
                  href={`/helpSupport/sub-sub-category/${category.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center text-green-600"
                >
                  <Eye className="w-4 h-4 mr-1" /> View
                </Link>

                {/* ✅ Edit */}
                <button onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(category);
                  }} 
                  className="flex items-center text-blue-500">
                  <CheckSquare className="w-4 h-4 mr-1" /> Edit
                </button>

                {/* ✅ Delete */}
                <button onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(category.id);
                  }}
                  className="flex items-center text-red-600">
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </button>
              </div>
            </div>

            {/* Body */}
            {openId === category.id && (
              <div className="p-4 text-gray-600">
                <div dangerouslySetInnerHTML={{ __html: category.answer ?? "" }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Add and Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-medium">
                {modalMode === "add" ? "Add SubCategory" : "Edit SubCategory"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="grid gap-4 p-4">
              {modalMode === "add" && (
              <>
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  className="form-input w-full border rounded-md p-2"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />

                <label className="block text-sm font-medium">Description</label>
                <textarea
                  className="form-input w-full border rounded-md p-2"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </>
              )}{modalMode === "edit" && (
                <>
                  <label className="block text-sm font-medium">Question</label>
                  <input
                    type="text"
                    className="form-input w-full border rounded-md p-2"
                    placeholder="Question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    required
                  />

                  <label className="block text-sm font-medium">Answer</label>
                  <textarea
                    className="form-input w-full border rounded-md p-2"
                    placeholder="Answer"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  />
              </>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isChatWithus}
                  onChange={(e) =>
                    setFormData({ ...formData, isChatWithus: e.target.checked })
                  }
                />
                <span className="text-sm">Is Chat With Us</span>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  {modalMode === "add" ? "Save" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-start mb-4">
              <div className="p-5 text-center w-full">
                <XCircle className="w-10 h-10 text-red-500 mx-auto" />
                <div className="text-2xl mt-4 font-semibold">Are you sure?</div>
                <p className="text-slate-500 mt-2">
                  Do you want to delete this record?
                </p>
                <h4 className="text-sm text-slate-400">
                  It will also delete subcategories.
                </h4>
              </div>
              <button onClick={closeDeleteModal}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
