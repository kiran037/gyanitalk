"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { isValidImageUrl } from "../functions";
import { getSkills, deleteSkill, createSkill, updateSkill } from "./fetch";
import { SkillStatusToggle } from "./updateSkillStatus";
import { CheckSquare, Trash2, Plus } from "lucide-react";

interface Skill {
  id: number;
  name: string;
  isActive: boolean;
  isDelete: boolean;
  createdBy?: number;
  modifiedBy?: number;
}

interface SkillAstrologerTableProps {
  skills: Skill[];
  totalPages: number;
  currentPage: number;
  page: number;
  search: string;
}

export default function SkillAstrologerTable({
  totalPages,
  currentPage,
  page,
  search,
}: SkillAstrologerTableProps) {

  // Delete modal
  const [showModal, setShowModal] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null)

  const [loading, setLoading] = useState(false);
  const [Skills, setSkills] = useState<Skill[]>([]);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState<any>({
      name: "",
  });

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<any>({ name: "" });

  const editSkill = (id: number, name: string, active: boolean) => {
    console.log("Edit Skill:", { id, name, active });
    // yaha API call / modal open karna hoga
  };

  // Fetch skills
  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await getSkills({ page: currentPage, limit: 15, search });
      setSkills(res.skills || []);
    } catch (error) {
      console.error("Failed to fetch review", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [currentPage, search]);

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      {/* 🔧 NEW: Add Skill button */}
      <div className="flex justify-end mb-4">
          <button
              onClick={() => {
                  // reset add form each open
                  setAddFormData({
                      name: "",
                  });
                  setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
              <Plus size={16} /> Add Skill
          </button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">NAME</TableHead>
            <TableHead className="text-left">STATUS</TableHead>
            <TableHead className="text-center">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Skills.map((item) => (
            <TableRow key={item.id}>

              {/* Name */}
              <TableCell className="text-left font-medium">
                {item.name}
              </TableCell>

              {/* Toggle Active */}
              <TableCell className="text-center">
                <div className="form-check form-switch justify-center w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0">
                  <SkillStatusToggle
                    className="toggle-class show-code form-check-input"
                    id={item.id}
                    status={item.isActive}  // convert to boolean
                  />
                </div>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-center">
                <div className="flex justify-center items-center">
                  <button
                    onClick={() => {
                      setEditingSkill(item);
                      setFormData({ name: item.name });
                      setShowEditModal(true);
                    }}
                    className="flex items-center mr-3 text-blue-600 hover:text-blue-700"
                  >
                    <CheckSquare className="w-4 h-4 mr-1" />
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSkillId(item.id);
                      setShowModal(true);
                    }}
                    className="flex items-center text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* Empty State */}
          {Skills.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <div className="text-center py-6 text-gray-500">
                  🚫 No Skills found
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="mt-6 flex justify-end gap-2 flex-wrap text-sm">
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNum = i + 1;
          const isLast = pageNum === totalPages;
          const isCurrent = pageNum === currentPage;
          const shouldShow =
            pageNum <= 3 ||
            pageNum === totalPages ||
            pageNum === currentPage ||
            pageNum === currentPage - 1 ||
            pageNum === currentPage + 1;

          if (!shouldShow) {
            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return <span key={i}>...</span>;
            }
            return null;
          }

          return (
            <a
              key={i}
              href={`?page=${pageNum}${search ? `&search=${search}` : ""}`}
              className={cn(
                "px-3 py-1 border rounded",
                isCurrent
                  ? "bg-primary text-white"
                  : "bg-white text-black dark:bg-dark dark:text-white"
              )}
            >
              {isLast ? "Last" : pageNum}
            </a>
          );
        })}
      </div>

      {/* Delete Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Delete Skill
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want to delete this skill? This action cannot be undone.
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
                          if (selectedSkillId) {
                              const result = await deleteSkill(selectedSkillId);
                              if (result.success) {
                                  toast.success(`Skill deleted successfully!`);
                                  fetchSkills();
                              } else {
                                  toast.error("Failed to delete");
                              }
                              setShowModal(false);
                              setSelectedSkillId(null);
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
      {showEditModal && editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3">
                    ✏️ Edit Skill
                </h2>

                <div className="grid grid-cols-1">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => {
                            setShowEditModal(false);
                            setEditingSkill(null);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={async () => {
                          if (!editingSkill) return;
                          const result = await updateSkill(editingSkill.id, formData);

                            if (result.success) {
                                toast.success("Skill updated successfully");
                                fetchSkills();
                                setShowEditModal(false);
                                setEditingSkill(null);
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

      {/* 🔧 NEW: Add Gift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3">
                    ➕ Add Skill
                </h2>

                <div className="grid grid-cols-1">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                            type="text"
                            value={addFormData.name}
                            onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => {
                            setShowAddModal(false);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={async () => {
                          try {
                            const result = await createSkill(addFormData);
                            if (result?.success) {
                              toast.success("Skill created successfully");
                              setShowAddModal(false);
                              setAddFormData({
                                  name: "",
                              });
                              fetchSkills();
                            } else {
                              toast.error(result?.message || "Failed to create skill");
                            }
                          } catch (e) {
                            console.error(e);
                            toast.error("Something went wrong");
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Create Skill
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
