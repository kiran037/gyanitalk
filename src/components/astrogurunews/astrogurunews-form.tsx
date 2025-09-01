"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Edit, Trash2, ExternalLink, Plus, X } from "lucide-react";
import {
  getAstroguruNews,
  createAstroguruNews,
  updateAstroguruNews,
  deleteAstroguruNews,
} from "./fetch";
import { formatDatetoReadable, isValidImageUrl } from "../functions";
import { uploadImage } from "@/upload";
import { NewsStatusToggle } from "./updateNewsStatus";
import toast from "react-hot-toast";

function bannerSrcOf(item: any) {
  const src = item?.bannerImage ?? "";
  if (!isValidImageUrl(src)) {
    return "https://gyanitalk.com/build/assets/images/person.png";
  }
  return /^https?:\/\//i.test(src)
    ? src
    : `${process.env.NEXT_PUBLIC_BASEURL ?? ""}${src}`;
}

export default function AstroguruNewsForm() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    channel: "",
    link: "",
    newsDate: "",
    description: "",
    bannerImage: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function fetchNews() {
    setLoading(true);
    const res = await getAstroguruNews();
    setData(res.data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchNews();
  }, []);

  function openAddModal() {
    setEditingItem(null);
    setFormData({
      channel: "",
      link: "",
      newsDate: "",
      description: "",
      bannerImage: null,
    });
    setImagePreview(null);
    setShowModal(true);
  }

  function openEditModal(item: any) {
    setEditingItem(item);
    setFormData({
      channel: item.channel,
      link: item.link,
      newsDate: item.newsDate?.slice(0, 10) || "",
      description: item.description,
      bannerImage: item.bannerImage,
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
        await updateAstroguruNews(editingItem.id, payload);
        toast.success("News updated!");
      } else {
        await createAstroguruNews(payload);
        toast.success("News created!");
      }

      setShowModal(false);
      fetchNews();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteAstroguruNews(deleteId);
      toast.success("Deleted successfully");
      fetchNews();
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
          <Plus size={16} /> Add News
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="intro-y grid grid-cols-12 gap-6 mt-5 grid-table">
          {data.map((item) => {
            const href = typeof item?.link === "string" ? item.link : "";
            const isActive = !!item.isActive;

            return (
              <div
                key={item.id}
                className="intro-y col-span-12 md:col-span-6 xl:col-span-4 bg-white rounded-xl shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="relative h-44 2xl:h-56">
                  <Image
                    src={bannerSrcOf(item)}
                    alt="News cover"
                    fill
                    className="object-cover rounded-t-xl"
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

                <div className="p-5 space-y-3">
                  <div className="text-sm text-slate-600">
                    <p>
                      <span className="font-semibold">Channel:</span>{" "}
                      {item.channel}
                    </p>
                    <p>
                      <span className="font-semibold">News Date:</span>{" "}
                      {formatDatetoReadable(item.newsDate)}
                    </p>
                  </div>
                  <p className="text-slate-700 text-sm line-clamp-4">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 p-5 border-t border-slate-200">
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

                  <div className="ml-auto flex items-center gap-3">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-blue-600 hover:underline text-sm flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(item.id);
                        setShowDelete(true);
                      }}
                      className="text-red-600 hover:underline text-sm flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>
                    <NewsStatusToggle id={item.id} status={item.isActive} />
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
                {editingItem ? "✏️ Edit News" : "➕ Add News"}
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
              <input
                type="text"
                placeholder="Channel name"
                value={formData.channel}
                onChange={(e) =>
                  setFormData({ ...formData, channel: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="url"
                placeholder="News link"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="date"
                value={formData.newsDate}
                onChange={(e) =>
                  setFormData({ ...formData, newsDate: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="border rounded px-3 py-2"
                rows={4}
                required
              />
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

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Delete News</h2>
            <p className="mb-6">Are you sure you want to delete this news?</p>
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
