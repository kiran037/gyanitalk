"use client";

import { useEffect, useState } from "react";
import { Plus, Eye, CheckSquare, Trash2, X } from "lucide-react";
import { getHelpSupport, addHelpSupport, getHelpSupportSubCategories, 
  addHelpSupportSubCategory, editHelpSupport, deleteHelpSupport } from "./fetch";
import toast from "react-hot-toast";

type Support = {
  id: number;
  name: string;
};

type Props = { data: any[] };

export default function HelpSupportForm({ data }: Props) {

  if (!data || data.length === 0) {
    return <p>No records found</p>; // ya loader dikhana hai to wo
  }

  // ✅ Local state for supports
  const [supports, setSupports] = useState<Support[]>(data);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [isChatWithUs, setIsChatWithUs] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
  });

  // ----------------- Modal Handling -----------------
  const openAddModal = (support?: Support) => {
    setSelectedSupport(support || null);
    setNewSubcategoryName("");
    setDescription("");
    setIsChatWithUs(false);
    setAddModalOpen(true);
  };

  const openEditModal = (support: Support) => {
    setSelectedSupport(support);
    setEditedName(support.name);
    setEditModalOpen(true);
  };

  const openDeleteModal = (support: Support) => {
    setSelectedSupport(support);
    setDeleteModalOpen(true);
  };

  const closeModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedSupport(null);
  };

  // ----------------- Edit Handlers -----------------

  const handleEditSupport = async () => {
    if (selectedSupport) {
      const res = await editHelpSupport(selectedSupport.id, {
        name: editedName,
      });

      if (res?.success) {
        toast.success("Help Support Updated ✅");
      } else {
        toast.error(res.message ?? "Failed to update ❌");
      }
    }
    closeModals();
    window.location.reload();
  };

  // ----------------- Delete Handlers -----------------

  const handleDeleteSupport = async () => {
    if (selectedSupport) {
      try {
        const res = await deleteHelpSupport(selectedSupport.id);

        if (res?.success) {
          toast.success("Deleted successfully ✅");
        } else {
          toast.error("Failed to delete ❌");
        }
      }catch (error){
        console.error(error);
        toast.error("Something went wrong!");
      } 
    }
    closeModals();
    window.location.reload();
  };

  // ---------------- API Submit ----------------

  // Add SubCategory
  async function handleAddSubCategorySubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedSupport) {
      toast.error("No support selected ❌");
      return;
    }

    try {
      const payload = {
        supportId: selectedSupport.id,
        subCategory: newSubcategoryName,
        description,
        isChatWithUs,
      };

      const res = await addHelpSupportSubCategory(payload);

      if (res?.success) {
        // ✅ Data fresh fetch
        await getHelpSupportSubCategories(selectedSupport.id);
        setNewSubcategoryName(""); // reset input
        setDescription("");
        setIsChatWithUs(false);

        toast.success("SubCategory Added ✅");
        closeModals();
        window.location.reload();
      } else {
        toast.error("Error adding SubCategory ❌");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  }

  // Add Handler
  async function handleSave() {
    try {
      const payload = { ...formData };
      const res = await addHelpSupport(payload);

      if (res?.success) {
        const fresh = await getHelpSupport();
        setSupports(fresh.data);

        toast.success("Help Support Added ✅");
        window.location.reload();
        setIsOpen(false);
        setFormData({ name: "", isActive: true }); // reset form
      } else {
        toast.error("Error adding Help Support ❌");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  }  

  return (
    <div>
      {/* Add New Button */}
      <div className="flex justify-left mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add Help Support
        </button>
      </div>

      <div className="intro-y col-span-12 overflow-auto lg:overflow-visible mt-8">
        <table className="table table-report -mt-2 w-full border-separate border-spacing-y-2" aria-label="help-support">
          <thead className="hidden">
            <tr>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((support) => (
            <tr key={support.id} className="intro-x bg-white shadow-md rounded-lg my-2">
              <td colSpan={3} className="p-4">
                <div className="flex justify-between items-center">
                  {/* Left Side - Name */}
                  <span className="font-medium text-gray-800">{support.name}</span>

                  {/* Right Side - Actions */}
                  <div className="flex items-center space-x-4">
                    <button
                      className="flex items-center text-blue-600 hover:text-blue-800"
                      onClick={() => openAddModal(support)}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </button>

                    <a
                      className="flex items-center text-green-600 hover:text-green-800"
                      href={`/helpSupport/help-support-sub-category/${support.id}`}
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </a>

                    <button
                      className="flex items-center text-yellow-600 hover:text-yellow-800"
                      onClick={() => openEditModal(support)}
                    >
                      <CheckSquare className="w-4 h-4 mr-1" /> Edit
                    </button>

                    <button
                      className="flex items-center text-red-600 hover:text-red-800"
                      onClick={() => openDeleteModal(support)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Help Support Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-medium">Add Help Support</h2>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="grid gap-4 p-4"
            >
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1"
              >
                Title
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input w-full border rounded-md p-2"
                placeholder="Title"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                Add Subcategory {selectedSupport ? `for ${selectedSupport.name}` : ""}
              </h2>
              <button onClick={closeModals}><X /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubCategorySubmit} >  
            <div className="p-5 space-y-4">
              {/* SubCategory Input */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  SubCategory
                </label>
                <input
                  type="text"
                  name="subCategory"
                  className="w-full border rounded-md p-2"
                  placeholder="SubCategory"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  className="w-full border rounded-md p-2"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isChatWithUs}
                  onChange={(e) => setIsChatWithUs(e.target.checked)}
                  className="form-checkbox"
                />
                <label className="text-sm">IS Chat With Us!</label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-3 p-4 border-t">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
              <button
                type="button"
                onClick={closeModals}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedSupport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Edit Help Support</h2>
              <button onClick={closeModals}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleEditSupport();
              }}
              className="p-5"
            >
              {/* Hidden ID */}
              <input type="hidden" value={selectedSupport.id} />

              {/* Title Input */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1" >
                  Title
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  required
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-gray-300 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedSupport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <div className="p-5 text-center w-full">
                <div className="text-2xl mt-4 font-semibold">Are you sure?</div>
                  <p className="text-slate-500 mt-2">Do you want to delete these records? </p>
                  <h4 className="text-sm text-slate-400">It also delete subcategory</h4>
              </div>  
                <button onClick={closeModals}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModals}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSupport}
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
