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
import { uploadImage } from "@/upload";
import toast from "react-hot-toast";
import { isValidImageUrl } from "../functions";
import { createGift, deleteGift, getGifts, updateGift } from "./fetch";
import { Plus,CheckSquare,Trash2 } from "lucide-react";
import { GiftStatusToggle } from "./updateGiftStatus";

interface Gift {
  id: number;
  name: string;
  image: string;
  amount: number;
  isActive: boolean;
  isDelete: boolean;
  createdBy?: number;
  modifiedBy?: number;
}

type Props = {
  gifts: Gift[];
  page: number;
  search: string;
  totalPages: number;
  currentPage: number;
}

export default function GiftAstrologerTable({ 
  gifts,
  page,
  totalPages,
  currentPage,
  search }: Props) {

  const [loading, setLoading] = useState(false);
  const [Gifts, setGifts] = useState<Gift[]>(gifts || []);

  // Delete modal
  const [showModal, setShowModal] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState<number | null>(null);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
 
  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState<any>({
      name: "",
      image: null as File | null,
      amount: "",
  });
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);

  // Fetch gifts
  const fetchGifts = async () => {
    try {
      setLoading(true);
      const res = await getGifts({ search, page }); // 👈 pass filters
      setGifts(res.gifts || []);
    } catch (error) {
      console.error("Failed to fetch gifts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, [search, page]);
  
  // Open edit modal
  const editbtn = (id: number, name: string, image: string, amount: number) => {
    setEditingGift({ id, name, image, amount, isActive: true ,isDelete: false});
    setFormData({ name, image, amount });
    setImagePreview(image ? `${process.env.NEXT_PUBLIC_BASEURL}${image}` : null);
    setShowEditModal(true);
  };

  // Open delete modal
  const delbtn = (id: number) => {
    setSelectedGiftId(id);
    setShowModal(true);
  };

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      {/* 🔧 NEW: Add Gift button */}
      <div className="flex justify-end mb-4">
          <button
              onClick={() => {
                  // reset add form each open
                  setAddFormData({
                      name: "",
                      image: null,
                      amount: ""
                  });
                  setAddImagePreview(null);
                  setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
              <Plus size={16} /> Add Gift
          </button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">NAME</TableHead>
            <TableHead className="text-center">IMAGE</TableHead>
            <TableHead className="text-center">AMOUNT</TableHead>
            <TableHead className="text-center">STATUS</TableHead>
            <TableHead className="text-center">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Gifts.map((item) => (
            <TableRow key={item.id}>

              {/* Name */}
              <TableCell className="text-center font-medium">{item.name || "-"}</TableCell>

              {/* Profile Image */}
              <TableCell>
                <div className="flex items-center justify-center gap-3">
                  <Image
                    src={
                      isValidImageUrl(item?.image)
                        ? `${process.env.NEXT_PUBLIC_BASEURL}${item.image}`
                        : "https://gyanitalk.com/build/assets/images/person.png"
                    }
                    className="rounded-full object-cover"
                    width={40}
                    height={40}
                    alt="Gift Image"
                  />
                  {/* <span className="text-dark dark:text-white font-medium truncate">
                    {item.name || "-"}
                  </span> */}
                </div>
              </TableCell>

              {/* Amount */}
              <TableCell className="text-center">INR{item.amount}</TableCell>

              {/* Status Toggle */}
              <TableCell className="text-center">
                <div className="flex justify-center items-center w-full">
                  <GiftStatusToggle
                    className="toggle-class show-code form-check-input"
                    id={item.id}
                   status={item.isActive}  // convert to boolean
                  />
                </div>
              </TableCell>

              {/* Status */}
              <TableCell className="text-center">
                <div className="flex justify-center items-center">
                 <button
                    onClick={() => editbtn(item.id, item.name, item.image, item.amount)}
                    className="flex items-center mr-3 text-blue-600 hover:text-blue-700"
                  >
                    <CheckSquare className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => delbtn(item.id)}
                    className="flex items-center text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="editbtn w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* Empty State */}
          {Gifts.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <div className="text-center py-6 text-gray-500">
                  🚫 No Gifts found
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
                    Delete Gift
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want to delete this gift? This action cannot be undone.
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
                            if (selectedGiftId) {
                                const result = await deleteGift(selectedGiftId);
                                if (result.success) {
                                    toast.success(`Gift deleted successfully!`);
                                    fetchGifts();
                                } else {
                                    toast.error("Failed to delete");
                                }
                                setShowModal(false);
                                setSelectedGiftId(null);
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
      {showEditModal && editingGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3">
                    ✏️ Edit Gift
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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


                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Image
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

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Amount
                        </label>
                        <input
                            type="text"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => {
                            setShowEditModal(false);
                            setEditingGift(null);
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

                            // 🔧 FIX: use editingGift.id instead of 12
                            const result = await updateGift(editingGift.id, updatedFormData);

                            if (result.success) {
                                toast.success("Gift updated successfully");
                                fetchGifts();
                                setShowEditModal(false);
                                setEditingGift(null);
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

      {/* 🔧 NEW: Add Gift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3">
                    ➕ Add Gift
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Image
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

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Amount
                        </label>
                        <input
                            type="text"
                            value={addFormData.amount}
                            onChange={(e) => setAddFormData({ ...addFormData, amount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
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

                                const result = await createGift(payload);

                                if (result?.success) {
                                    toast.success("Gift  created successfully");
                                    setShowAddModal(false);
                                    setAddImagePreview(null);
                                    setAddFormData({
                                        name: "",
                                        amount: "",
                                        image: null,
                                    });
                                    fetchGifts();
                                } else {
                                    toast.error(result?.message || "Failed to create gift");
                                }
                            } catch (e) {
                                console.error(e);
                                toast.error("Something went wrong");
                            }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Create Gift
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
