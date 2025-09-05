// app/pages/PageCard.tsx
"use client";

import { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { getPages, updatePages } from "./fetch";
import toast from "react-hot-toast";
import { PagesStatusToggle } from "./updatePagesStatus";

type PageProps = {
  item: {
    id: number;
    title: string;
    type: string;
    description: string;
    isActive: number;
  };
  onUpdate?: () => void; // ✅
};

export default function PageCard({ item, onUpdate }: PageProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 550;

  // add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    title: "",
    type: "",
    description: "",
  });

  function openEditModal(item: any) {
    setEditingItem(item);
    setFormData({ title: item.title, type: item.type, description: item.description });
    setShowModal(true);
  }

const [saving, setSaving] = useState(false);
async function handleSave() {
  try {
    let payload = { ...formData };

    if (editingItem) {
      await updatePages(editingItem.id, payload);
      toast.success("Page updated!");
    }
    setShowModal(false);
    onUpdate?.(); // ✅ refresh parent
  } catch (err) {
    console.error(err);
    toast.error("Failed to save");
  }
}

  // Strip HTML safely → plain text (for truncation only)
  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const plainText = stripHtml(item.description);
  const truncatedText =
    plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;

  const isActive = !!item.isActive;

  return (
    <div className="intro-y col-span-12 md:col-span-6 box bg-white">
      <CardContent>
        {/* Title */}
        <div className="px-5 pt-5 text-slate-600 dark:text-slate-500 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{item.title}</h2>
        </div>

        {/* Description + Read More */}
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
        <div className="px-5 pt-3 pb-5 border-t border-slate-200/60 dark:border-darkmode-400 flex items-center justify-between">
          {/* Left side (Edit button) */}
          <div className="flex items-center text-slate-500 text-xs sm:text-sm">
            <button
              onClick={() => openEditModal(item)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <i className="w-4 h-4 mr-2">✏️</i>
              <span>Edit</span>
            </button>
          </div>

          {/* Right side (Status + Toggle) */}
          <div className="flex items-center">
            <span
              className={`mr-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>

            <PagesStatusToggle id={item.id} status={Boolean(item.isActive)} />
          </div>
        </div>
      </CardContent>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">
                ✏️ Edit Page
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

          {/* Page Title */}
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-gray-600">Title</span>
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />
            </label>

          {/* Page Type */}
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-gray-600">Page Type</span>
              <select
                name="type"
                value={formData.type || ""}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="border rounded px-3 py-2"
                required
              >
                <option value="" disabled>
                  -- Select Type --
                </option>
                <option value="privacy">Privacy Policy</option>
                <option value="terms">Terms & Conditions</option>
                <option value="aboutus">About Us</option>
              </select>
            </label>

          {/* Page Description */}
            <label className="flex flex-col">
              <span className="mb-1 text-sm text-gray-600">Description</span>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border rounded px-3 py-2"
                rows={4}
                required
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
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
