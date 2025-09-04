"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Edit, Trash2, ExternalLink, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { uploadImage } from "@/upload";
import { isValidImageUrl } from "../functions";
import { getVideos, createVideos, updateVideos, deleteVideos } from "./fetch";
import { VideosStatusToggle } from "./updateVideosStatus";

export default function VideosForm(){
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    youtubeLink: "",
    coverImage: null,
    description: "",
    videoTitle: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function fetchVideos() {
    setLoading(true);
    try {
      const res = await getVideos();
      setData(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch news");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchVideos();
  }, []);

  function openAddModal() {
    setEditingItem(null);
    setFormData({
    youtubeLink: "",
    coverImage: null,
    description: "",
    videoTitle: "",
    });
    setImagePreview(null);
    setShowModal(true);
  }

  function openEditModal(item: any) {
    setEditingItem(item);
    setFormData({
      youtubeLink: item.youtubeLink,
      coverImage: item.coverImage,
      description: item.description,
      videoTitle: item.videoTitle,
    });
    setImagePreview(item.coverImage ? `${process.env.NEXT_PUBLIC_BASEURL}${item.coverImage}` : null);
    setShowModal(true);
  }

  async function handleSave() {
    try {
      let payload = { ...formData };

      // upload file if needed
      if (formData.coverImage instanceof File) {
        const uploadRes = await uploadImage(formData.coverImage, "images");
        if (uploadRes?.success && uploadRes?.path) {
          payload.coverImage = uploadRes.path;
        } else {
          toast.error("Image upload failed");
          return;
        }
      }

      if (editingItem) {
        await updateVideos(editingItem.id, payload);
        toast.success("News updated!");
      } else {
        await createVideos(payload);
        toast.success("News created!");
      }

      setShowModal(false);
      fetchVideos();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteVideos(deleteId);
      toast.success("Deleted successfully");
      fetchVideos();
    } catch {
      toast.error("Delete failed");
    } finally {
      setShowDelete(false);
      setDeleteId(null);
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
          <Plus size={16} /> Add New Video
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="intro-y grid grid-cols-12 gap-6 mt-5 grid-table">
          {data.map((item: any) => {
            const href = typeof item?.youtubeLink === "string" ? item.youtubeLink : "";
            const isActive = !!item.isActive;
            return (
              <div
                className="intro-y col-span-12 md:col-span-6 xl:col-span-4 box fitbox bg-white"
                key={item.id}
              >
                <div className="p-5 break-words">
                  {/* Cover Image */}
                  <div className="h-40 2xl:h-56 image-fit relative">
                    <Image
                      src={
                        isValidImageUrl(item?.coverImage)
                          ? `${process.env.NEXT_PUBLIC_BASEURL}${item.coverImage}`
                          : "https://gyanitalk.com/build/assets/images/person.png"
                      }
                      className="rounded-md object-cover"
                      fill
                      alt="News cover"
                    />
                    <span
                        className={`absolute top-3 left-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                          }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="text-slate-600 dark:text-slate-500 mt-2">
                    {item.videoTitle}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 p-5 border-t border-slate-200">
                  <a
                    href={href || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium ${href
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> Open Link
                  </a>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex items-center mr-3 text-blue-600 hover:underline"
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </button>

                  <button
                    onClick={() => {
                      setDeleteId(item.id);
                      setShowDelete(true);
                    }}
                    className="flex items-center mr-3 text-red-600 hover:underline"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </button>

                  {/* Toggle */}
                  <VideosStatusToggle id={item.id} status={item.isActive} />
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
                {editingItem ? "✏️ Edit Ads Video" : "➕ Add Ads Video"}
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

          {/* YouTube Link */}
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-gray-600">YouTube Link</span>
                <input
                  type="url"
                  placeholder="Enter YouTube link"
                  value={formData.youtubeLink || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, youtubeLink: e.target.value })
                  }
                  className="border rounded px-3 py-2" 
                  required
                />
            </label> 

          {/* Video Title */}
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-gray-600">Video Title</span>
                <input
                  type="text"
                  placeholder="Enter video title"
                  value={formData.videoTitle || ""}
                onChange={(e) =>
                  setFormData({ ...formData, videoTitle: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />
            </label> 

          {/* Cover Image */}
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-gray-600">Cover Image</span>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-32 h-20 object-cover rounded border mb-2"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData({ ...formData, coverImage: file });
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>
            
            {/* Buttons */}
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

    {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Delete Ads Videos</h2>
            <p className="mb-6">Are you sure you want to delete this Ads Video?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
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
