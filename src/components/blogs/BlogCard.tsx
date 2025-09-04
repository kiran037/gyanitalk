// app/pages/PageCard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MoreVertical, X } from "lucide-react";  // icon library (same as data-lucide)
import { getBlogs, updateBlogs,deleteBlogs,} from "./fetch"; // ✅ use our new functions
import { isValidImageUrl } from "../functions";
import { uploadImage } from "@/upload";
import { BlogsStatusToggle } from "./updateBlogsStatus";
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

type BlogCardProps = {
  item: any;
  currentPage?: number;
  totalPages?: number;
  search?: string;
};

function bannerSrcOf(item: any) {
  const src = item?.blogImage ?? "";
  if (!isValidImageUrl(src)) {
    return "https://gyanitalk.com/build/assets/images/person.png";
  }
  return /^https?:\/\//i.test(src)
    ? src
    : `${process.env.NEXT_PUBLIC_BASEURL ?? ""}${src}`;
}

export function BlogCard({item, currentPage, totalPages, search }: BlogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isActive = !!item.isActive;
  const maxLength = 550;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    blogImage: null,
    author: "",
    postedOn: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);

  // delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ✅ Edit Modal
  function openEditModal(blog: Blog) {
    setEditingItem(blog);
    setFormData({
      title: blog.title,
      description: blog.description,
      postedOn: blog.postedOn ? new Date(blog.postedOn).toISOString().slice(0, 10) : "",
      blogImage: blog.blogImage,
      author: blog.author,
    });
    setPreview(bannerSrcOf(blog));
    setFileType(null);
    setShowModal(true);
  }

  async function fetchBlogs() {
      setLoading(true);
      const res = await getBlogs();
      setData(res.data || []);
      setLoading(false);
    }
  
    useEffect(() => {
      fetchBlogs();
    }, []);

  // ✅ Save (Create or Update)
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
      }else if (typeof formData.blogImage === "string") {
        // ✅ fallback if blogImage already has a URL
        payload.extension = getFileExtension(formData.blogImage);
      }

      if (editingItem) {
        await updateBlogs(editingItem.id, payload);
        toast.success("Blogs updated!");
      }

      setShowModal(false);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  }

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

  // ✅ Delete
  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteBlogs(deleteId);
      toast.success("Deleted successfully");
      fetchBlogs();
    } catch {
      toast.error("Delete failed");
    } finally {
      setShowDelete(false);
      setDeleteId(null);
    }
  }

  // ✅ Safe strip HTML for server + client
  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, "");
  };

  const plainText = stripHtml(item.description);
  const truncatedText =
    plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); 

    const ext = item.extension?.toLowerCase() ?? "";

  return (
    <div className="intro-y col-span-12 md:col-span-6 box bg-white">
      {/* Image or Video */}
   
      <div className="relative h-[320px] before:block before:absolute before:w-full before:h-full before:top-0 before:left-0 before:z-10 before:bg-gradient-to-t before:from-black/90 before:to-black/10 image-fit">
          {["jpg", "jpeg", "gif", "png", "webp"].includes(ext) ? (
              <Image
                src={bannerSrcOf(item)}
                alt="Blog image"
                fill
                className="object-cover rounded-t-xl"
              />
            ) : ext === "mp4" ? (
              <video
                controls
                className="absolute top-0 left-0 w-full h-full object-cover z-10 rounded-t-md"
              >
                <source src={bannerSrcOf(item)} type="video/mp4" />
              </video>
            ) : (
              <Image
                src="https://gyanitalk.com/build/assets/images/person.png"
                alt="Fallback image"
                fill
                className="object-cover rounded-t-xl"
              />
            )}

          <span
            className={`absolute top-3 left-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
              }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>

        {/* Top Overlay */}
        <div className="absolute w-full flex items-center px-5 pt-6 z-10">
          <div className="ml-3 text-white mr-auto">
            <span className="font-medium">{item.author}</span>
            <div className="text-xs mt-0.5">
              {item.postedOn && new Date(item.postedOn).toLocaleDateString("en-GB")}
            </div>
          </div>

          {/* Dropdown Actions */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-white/20 w-8 h-8 flex items-center justify-center rounded-full"
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md p-2 z-30">
                <button onClick={() => openEditModal(item)} className="flex items-center w-full px-2 py-1 hover:bg-gray-100">
                  ✏ Edit Blog
                </button>
                <button onClick={() => { setDeleteId(item.id); setShowDelete(true); }} className="flex items-center w-full px-2 py-1 hover:bg-gray-100 text-red-600">
                  🗑 Delete Blog
                </button>
              </div>
              )} 
          </div>
        </div>
      </div>  
      {/* Title */}
      <div className="px-5 pt-5 text-slate-600 dark:text-slate-500">
        <h2 className="font-medium text-xl">{item.title}</h2>
      </div>

      {/* Description */}
      <div className="p-5 text-slate-600 dark:text-slate-500">
        {isExpanded ? (
            <div dangerouslySetInnerHTML={{ __html: item.description }} />
        ) : (
            <p>{truncatedText}</p>
        )}
          {plainText.length > maxLength && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-blue-600 text-sm hover:underline"
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        )}
      </div>  

      {/* Footer */}
      <div className="px-5 pt-3 pb-5 border-t border-slate-200/60 dark:border-darkmode-400 intro-y flex flex-col sm:flex-row items-center">
        <div className="w-full flex text-slate-500 text-xs sm:text-sm">
          <div className="mr-2">
            Views: <span className="font-medium">{item.viewer ?? 0}</span>
          </div>
        </div>

      {/* Toggle Switch */}
      <div className="form-check form-switch flex justify-center w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0">
          <BlogsStatusToggle id={item.id} status={Boolean(item.isActive)} />
      </div>
      
      {/* ✅ Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">✏️ Edit Blog</h2>
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
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ✅ Delete Modal */}
        {showDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-lg font-semibold mb-4">Delete Blog</h2>
              <p className="mb-6">Are you sure you want to delete this blog?</p>
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
    </div>
  );
}