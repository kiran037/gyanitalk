"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import { BlogCard } from "./BlogCard";
import { getBlogsData,createBlogs } from "./fetch"; // ✅ use our new functions
import { uploadImage } from "@/upload";
import { isValidImageUrl } from "../functions";
import toast from "react-hot-toast";

type Blog = {
  id: number;
  title: string;
  description: string;
  isActive: number;
  extension?: string;
  blogImage?: string;
  author?: string;
  postedOn?: string;
  viewer?: number;
};

export default function BlogListClient({
  initialData,
  page,
  totalPages,
  search,
}: {
  initialData: Blog[];
  page: number;
  totalPages: number;
  search: string;
}) {
  
const [blogs, setBlogs] = useState<Blog[]>(initialData);
const [loading, setLoading] = useState(false);

 // ✅ Only refetch if page/search change client-side
useEffect(() => {
  async function fetchBlogs() {
    setLoading(true);
    try {
      const { data } = await getBlogsData({ page, search });
      setBlogs(data || []);
    } finally {
      setLoading(false);
    }
  }

  // Sirf tab refetch kare jab query params default se different ho
  if (page !== 1 || search !== "") {
    fetchBlogs();
  }
}, [page, search]);

  // -------------------
  // Add Blog Modal Logic
  // -------------------
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    postedOn: "",
    blogImage: null,
    author: "",
  });
 const [preview, setPreview] = useState<string | null>(null);
 const [fileType, setFileType] = useState<"image" | "video" | null>(null);

  function openAddModal() {
    setFormData({
      title: "",
      author: "",
      postedOn: "",
      description: "",
      blogImage: null,
    });
    setPreview(null);
    setFileType(null);
    setShowModal(true);
  }

  // ✅ Save (Create)
  async function handleSave() {
    try {
      let payload = { ...formData };

      // upload file if needed
      if (formData.blogImage instanceof File) {
        const uploadRes = await uploadImage(formData.blogImage, "images");
        if (uploadRes?.success && uploadRes?.path) {
          payload.blogImage = uploadRes.path;
          // ✅ get extension from File
          payload.extension = getFileExtension(formData.blogImage);
        } else {
          toast.error("Image upload failed");
          return;
        }
      } else if (typeof formData.blogImage === "string") {
        // ✅ fallback if blogImage already has a URL
        payload.extension = getFileExtension(formData.blogImage);
      }

      await createBlogs(payload);
      toast.success("Blog created!");
      setShowModal(false);

      // refresh list
      const { data } = await getBlogsData({ page, limit: 15, search });
      setBlogs(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  }

  // handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    setFormData({ ...formData, blogImage: file });

    const url = URL.createObjectURL(file);
    if (file.type.startsWith("image/")) {
      setFileType("image");
    } else if (file.type.startsWith("video/")) {
      setFileType("video");
    } else {
      setFileType(null);
    }
    setPreview(url);
  };

  function getFileExtension(file: File | string | null): string {
  if (!file) return "";

  if (file instanceof File) {
    return file.name.split(".").pop()?.toLowerCase() || "";
  }

  if (typeof file === "string") {
    return file.split(".").pop()?.toLowerCase() || "";
  }
    return "";
  }

  return (
    <>
      {/* 🔹 Top bar */}
      <div className="flex justify-between items-center" style={{ marginTop: "-35px" }}>
        <h1 className="text-xl font-semibold"></h1>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add Blog
        </button>
      </div>

      {/* 🔹 Blog list */}
      <div className="intro-y grid grid-cols-12 gap-6 mt-5 grid-table">
       {loading ? (
          <p className="col-span-12 text-center text-gray-500">Loading...</p>
        ) : blogs.length > 0 ? (
          blogs.map((item: any) => (
            <BlogCard key={item.id} item={item} />
          ))
          ):(<p className="col-span-12 text-center text-gray-500">No blogs found</p>
        )}
      </div>

      {/* ✅ Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  ➕ Add Blog
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
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                />
                <input
                  type="date"
                  value={formData.postedOn ? String(formData.postedOn).slice(0, 10) : ""} 
                  onChange={(e) =>
                    setFormData({ ...formData, postedOn: e.target.value })
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
                {/* ✅ Preview */}
                  {preview && fileType === "image" && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-40 h-28 object-cover rounded border"
                    />
                  )}
                  {preview && fileType === "video" && (
                    <video
                      controls
                      className="w-40 h-28 object-cover rounded border"
                    >
                      <source src={preview} type="video/mp4" />
                    </video>
                  )}
                  {/* ✅ File Input */}
                  <input
                    type="file"
                    accept="image/*,video/mp4"
                    onChange={handleFileChange}
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
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
