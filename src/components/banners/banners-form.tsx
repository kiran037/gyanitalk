"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, X, Calendar, Video, CheckSquare } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";

import { getBanners, getBannerTypes, addBanner, updateBanner } from "./fetch";
import { uploadImage } from "@/upload";
import { BannersStatusToggle } from "./updateBannersStatus";
import { isValidImageUrl } from "../functions";

// ✅ Fallback banner image
function bannerSrcOf(item: any) {
  const src = item?.bannerImage ?? "";
  if (!isValidImageUrl(src)) {
    return "https://gyanitalk.com/build/assets/images/person.png";
  }
  return /^https?:\/\//i.test(src)
    ? src
    : `${process.env.NEXT_PUBLIC_BASEURL ?? ""}${src}`;
}

export default function BannersForm() {
  const [bannerTypes, setBannerTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);

  // modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    fromDate: "",
    toDate: "",
    bannerTypeId: "",
    bannerImage: null,
    isActive: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ✅ Fetch both banners + types
  async function fetchAll() {
    try {
      setLoading(true);
      const [bRes, tRes] = await Promise.all([getBanners(), getBannerTypes()]);
      setBanners(bRes.data || []);
      setBannerTypes(tRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function openAddModal() {
    setEditingItem(null);
    setFormData({
      fromDate: "",
      toDate: "",
      bannerTypeId: "",
      bannerImage: null,
      isActive: true,
    });
    setImagePreview(null);
    setShowModal(true);
  }

  function openEditModal(item: any) {
    setEditingItem(item);
    setFormData({
      fromDate: item.fromDate?.slice(0, 10) || "",
      toDate: item.toDate?.slice(0, 10) || "",
      bannerTypeId: item.bannerTypeId || "",
      bannerImage: item.bannerImage,
      isActive: item.isActive,
    });
    setImagePreview(bannerSrcOf(item));
    setShowModal(true);
  }

  async function handleSave() {
    try {
      let payload = { ...formData };

      // upload file if needed
      if (formData.bannerImage instanceof File) {
        const uploadRes = await uploadImage(formData.bannerImage, "images");
        if (uploadRes?.success && uploadRes?.path) {
          payload.bannerImage = uploadRes.path;
        } else {
          toast.error("Image upload failed");
          return;
        }
      }

      if (editingItem) {
        await updateBanner(editingItem.id, payload);
        toast.success("Banner updated!");
      } else {
        await addBanner(payload);
        toast.success("Banner created!");
      }

      setShowModal(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  }

  return (
    <div>
      {/* Add button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-12 gap-6 mt-5 grid-table-without-search">
          {banners.map((item: any) => {
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
                        alt="Banner image"
                        src={bannerSrcOf(item)}
                        fill
                        className="rounded-md object-cover"
                      />
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
                    <div className="text-slate-600 dark:text-slate-500 mt-5">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        From:{" "}
                        {item.fromDate
                          ? dayjs(item.fromDate).format("DD-MMM-YYYY")
                          : "-"}
                      </div>
                      <div className="flex items-center mt-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        To:{" "}
                        {item.toDate
                          ? dayjs(item.toDate).format("DD-MMM-YYYY")
                          : "-"}
                      </div>
                      <div className="flex items-center mt-2">
                        <Video className="w-4 h-4 mr-2" />
                        {item.bannerType?.name || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="flex justify-between items-center p-5 border-t border-slate-200/60 dark:border-darkmode-400 relative">
                    {/* Left side (Edit Button) */}
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <CheckSquare className="w-4 h-4 mr-1" /> Edit
                    </button>

                    {/* Right side (Status Toggle) */}
                    <BannersStatusToggle id={item.id} status={item.isActive} />
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
                {editingItem ? "✏️ Edit Banner" : "➕ Add Banner"}
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
              <label className="text-sm font-medium">From Date</label>
              <input
                type="date"
                value={formData.fromDate}
                onChange={(e) =>
                  setFormData({ ...formData, fromDate: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />

              <label className="text-sm font-medium">To Date</label>
              <input
                type="date"
                value={formData.toDate}
                onChange={(e) =>
                  setFormData({ ...formData, toDate: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />

              <label className="text-sm font-medium">Banner Type</label>
              <select
                value={formData.bannerTypeId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bannerTypeId: Number(e.target.value),
                  })
                }
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select type</option>
                {bannerTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-32 h-20 object-cover rounded border"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData({ ...formData, bannerImage: file });
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
                  {editingItem ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}