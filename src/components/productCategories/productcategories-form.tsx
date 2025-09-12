"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, X, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx"; // ✅ use clsx instead of cn

import {
  getProductCategory,
  addProductCategory,
  updateProductCategory,
} from "./fetch";
import { uploadImage } from "@/upload";
import { ProductCategoriesStatusToggle } from "./updateProductCategoryStatus";
import { isValidImageUrl } from "../functions";

// ✅ Fallback image
function categorySrcOf(item: any) {
  const src = item?.categoryImage ?? "";
  if (!isValidImageUrl(src)) {
    return "https://gyanitalk.com/build/assets/images/person.png";
  }
  return /^https?:\/\//i.test(src)
    ? src
    : `${process.env.NEXT_PUBLIC_BASEURL ?? ""}${src}`;
}

export default function ProductCategoriesForm({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // pagination states
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);

  // modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    categoryImage: null,
    isActive: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ✅ Fetch categories
  async function fetchCategories() {
    try {
      setLoading(true);
      const { data, totalPages, currentPage } = await getProductCategory({
        page,
        limit,
        search,
      });

      setCategories(data || []);
      setTotalPages(totalPages || 1);
      setCurrentPage(currentPage || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, [page, limit, search]);

  function openAddModal() {
    setEditingItem(null);
    setFormData({
      name: "",
      categoryImage: null,
      isActive: true,
    });
    setImagePreview(null);
    setShowModal(true);
  }

  function openEditModal(item: any) {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      categoryImage: item.categoryImage,
      isActive: item.isActive,
    });
    setImagePreview(categorySrcOf(item));
    setShowModal(true);
  }

  async function handleSave() {
    try {
      let payload = { ...formData };

      // upload file if needed
      if (formData.categoryImage instanceof File) {
        const uploadRes = await uploadImage(formData.categoryImage, "images");
        if (uploadRes?.success && uploadRes?.path) {
          payload.categoryImage = uploadRes.path;
        } else {
          toast.error("Image upload failed");
          return;
        }
      }

      if (editingItem) {
        await updateProductCategory(editingItem.id, payload);
        toast.success("Category updated!");
      } else {
        await addProductCategory(payload);
        toast.success("Category created!");
      }

      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  }

  return (
    <div style={{ marginTop: "-30px" }}>
      {/* Add button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add Product Category
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-12 gap-6 mt-5">
          {categories.map((item: any) => {
            const isActive = !!item.isActive;

            return (
              <div
                key={item.id}
                className="intro-y col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 bg-white"
              >
                <div className="box">
                  <div className="p-5">
                    <div className="relative h-40 2xl:h-56 image-fit rounded-md overflow-hidden before:block before:absolute before:w-full before:h-full before:top-0 before:left-0 before:z-10 before:bg-gradient-to-t before:from-black before:to-black/10">
                      <Image
                        alt="Category image"
                        src={categorySrcOf(item)}
                        sizes="100vw"
                        fill
                        className="rounded-md object-cover"
                      />
                      <div className="absolute bottom-0 text-white px-5 pb-6 z-10">
                        <span className="block font-medium text-base">
                          {item.name}
                        </span>
                      </div>
                      <span
                        className={`absolute top-3 left-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="flex justify-between items-center p-5 border-t border-slate-200/60">
                    {/* Left side (Edit Button) */}
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <CheckSquare className="w-4 h-4 mr-1" /> Edit
                    </button>
                    {/* Right side (Status Toggle) */}
                    <ProductCategoriesStatusToggle
                      className="toggle-class show-code form-check-input mr-0 ml-3"
                      id={item.id}
                      status={item.isActive}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingItem ? "✏️ Edit Category" : "➕ Add Category"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="grid gap-4"
            >
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                required
              />

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Category preview"
                  className="w-32 h-20 object-cover rounded border"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData({ ...formData, categoryImage: file });
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {editingItem ? "Save Changes" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pagination */}
      {/* <div className="mt-6 flex justify-end gap-2 flex-wrap text-sm">
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
            if (
              pageNum === currentPage - 2 ||
              pageNum === currentPage + 2
            ) {
              return <span key={i}>...</span>;
            }
            return null;
          }

          return (
            <a
              key={i}
              href={`?page=${pageNum}${search ? `&search=${search}` : ""}`}
              className={clsx(
                "px-3 py-1 border rounded",
                isCurrent
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black dark:bg-dark dark:text-white"
              )}
            >
              {isLast ? "Last" : pageNum}
            </a>
          );
        })}
      </div> */}
    </div>
  );
}
