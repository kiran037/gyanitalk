// app/astro/skills/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, GripVertical, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Skill {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  usageCount: number;
  created_at: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
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
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    displayOrder: 0,
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  const addToast = useToast();

  useEffect(() => {
    fetchSkills();
  }, [currentPage, filterActive]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
        ...(filterActive && { isActive: filterActive }),
      });

      const response = await fetch(`/api/astrologers/skills?${params}`);
      const data = await response.json();

      if (data.success) {
        setSkills(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch skills");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSkills();
  };

  const handleCreate = async () => {
    setFormLoading(true);
    try {
      const response = await fetch("/api/astrologers/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          createdBy: 1, // Replace with actual user ID
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Skill created successfully");
        setShowCreateModal(false);
        fetchSkills();
        resetForm();
      } else {
        addToast("error", "Error", data.error);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to create skill");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSkill) return;
    setFormLoading(true);
    try {
      const response = await fetch(`/api/astrologers/skills/${selectedSkill.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          modifiedBy: 1, // Replace with actual user ID
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Skill updated successfully");
        setShowEditModal(false);
        fetchSkills();
        resetForm();
      } else {
        addToast("error", "Error", data.error);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to update skill");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSkill) return;
    setFormLoading(true);
    try {
      const response = await fetch(
        `/api/astrologers/skills/${selectedSkill.id}?modifiedBy=1`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Skill deleted successfully");
        setShowDeleteModal(false);
        fetchSkills();
      } else {
        addToast("error", "Error", data.error);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete skill");
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedSkills.length === 0) {
      addToast("warning", "Warning", "Please select skills first");
      return;
    }

    try {
      const response = await fetch("/api/astrologers/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          skillIds: selectedSkills.map(id => BigInt(id)),
          modifiedBy: 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", data.message);
        setSelectedSkills([]);
        fetchSkills();
      } else {
        addToast("error", "Error", data.error);
      }
    } catch (error) {
      addToast("error", "Error", `Failed to ${action} skills`);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(skills);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update displayOrder
    const reorderedSkills = items.map((skill, index) => ({
      id: skill.id,
      displayOrder: index + 1,
    }));

    setSkills(items);

    try {
      const response = await fetch("/api/astrologers/skills/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: reorderedSkills,
          modifiedBy: 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Skills reordered successfully");
      } else {
        addToast("error", "Error", data.error);
        fetchSkills(); // Revert on error
      }
    } catch (error) {
      addToast("error", "Error", "Failed to reorder skills");
      fetchSkills();
    }
  };

  const openEditModal = (skill: Skill) => {
    setSelectedSkill(skill);
    setFormData({
      name: skill.name,
      displayOrder: skill.displayOrder,
      isActive: skill.isActive,
    });
    setShowEditModal(true);
  };

  const openViewModal = (skill: Skill) => {
    setSelectedSkill(skill);
    setShowViewModal(true);
  };

  const openDeleteModal = (skill: Skill) => {
    setSelectedSkill(skill);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      displayOrder: 0,
      isActive: true,
    });
    setSelectedSkill(null);
  };

  const toggleSelectAll = () => {
    if (selectedSkills.length === skills.length) {
      setSelectedSkills([]);
    } else {
      setSelectedSkills(skills.map((s) => s.id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Skills Management"
          subtitle="Manage astrologer skills and expertise areas"
          badge={{ text: "SKILLS", variant: "purple" }}
          actions={
            <Button onClick={() => setShowCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
              Add Skill
            </Button>
          }
        />

        {/* Filters & Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search skills..."
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
          {selectedSkills.length > 0 && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedSkills.length} selected
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
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Skills</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {skills.filter((s) => s.isActive).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Inactive</div>
            <div className="text-2xl font-bold text-red-600">
              {skills.filter((s) => !s.isActive).length}
            </div>
          </div>
        </div>

        {/* Skills Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : skills.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No skills found</div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="skills">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedSkills.length === skills.length}
                              onChange={toggleSelectAll}
                              className="rounded"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Order
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Skill Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Usage
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
                        {skills.map((skill, index) => (
                          <Draggable key={skill.id} draggableId={skill.id} index={index}>
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                  snapshot.isDragging ? "bg-gray-100 dark:bg-gray-700" : ""
                                }`}
                              >
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedSkills.includes(skill.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedSkills([...selectedSkills, skill.id]);
                                      } else {
                                        setSelectedSkills(
                                          selectedSkills.filter((id) => id !== skill.id)
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
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {skill.name}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {skill.usageCount} astrologers
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {skill.isActive ? (
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
                                      onClick={() => openViewModal(skill)}
                                      ariaLabel="View"
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      icon={<Edit2 className="w-4 h-4" />}
                                      onClick={() => openEditModal(skill)}
                                      ariaLabel="Edit"
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      icon={<Trash2 className="w-4 h-4" />}
                                      onClick={() => openDeleteModal(skill)}
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
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Skill">
        <div className="space-y-4">
          <Input
            label="Skill Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter skill name"
            required
          />
          <Input
            label="Display Order"
            type="number"
            value={formData.displayOrder.toString()}
            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
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
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Skill">
        <div className="space-y-4">
          <Input
            label="Skill Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter skill name"
            required
          />
          <Input
            label="Display Order"
            type="number"
            value={formData.displayOrder.toString()}
            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
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
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Skill Details">
        {selectedSkill && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Name</label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedSkill.name}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Display Order</label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {selectedSkill.displayOrder}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Usage Count</label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {selectedSkill.usageCount} astrologers
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Status</label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {selectedSkill.isActive ? "Active" : "Inactive"}
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
        title="Delete Skill"
        message={`Are you sure you want to delete "${selectedSkill?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={formLoading}
      />
    </div>
  );
}