"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui-elements/table";
import { getNotifications, createNotifications, updateNotifications } from "./fetch";
import toast from "react-hot-toast";

export default  function NotificationTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
  });

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await getNotifications();
      setData(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch notifications");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  function openAddModal() {
    setEditingItem(null);
    setFormData({ title: "", description: "" });
    setShowModal(true);
  }

  function openEditModal(item: any) {
    setEditingItem(item);
    setFormData({ title: item.title, description: item.description });
    setShowModal(true);
  }

  async function handleSave() {
    try {
      let payload = { ...formData };

      if (editingItem) {
        await updateNotifications(editingItem.id, payload);
        toast.success("Notification updated!");
      } else {
        await createNotifications(payload);
        toast.success("Notification created!");
      }

      setShowModal(false);
      fetchNotifications();
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
          <Plus size={16} /> Add Notification
        </button>
      </div>

      {/* Table / Loader */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
          <Table className="table table-report -mt-2" aria-label="notification">
            <TableHeader>
              <TableRow className="bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
                <TableHead className="whitespace-nowrap">TITLE</TableHead>
                <TableHead className="whitespace-nowrap">DESCRIPTION</TableHead>
                <TableHead className="text-center whitespace-nowrap">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item: any, index: number) => (
                <TableRow
                  key={index}
                  className="hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors border-[#eee] dark:border-dark-3"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-dark dark:text-white font-medium truncate">
                        {item.title || "-"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-dark dark:text-white text-sm">
                      {item.description || "-"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-center items-center">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex items-center mr-3 text-blue-600 hover:text-blue-800"
                      >
                        ✏️ Edit
                      </button>

                      <button className="flex items-center text-green-600 hover:text-green-800">
                        📤 Send
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingItem ? "✏️ Edit Notification" : "➕ Add Notification"}
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
              {/* Notification Title */}
              <label className="flex flex-col">
                <span className="mb-1 text-sm text-gray-600">Title</span>
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border rounded px-3 py-2"
                  required
                />
              </label>

              {/* Notification Description */}
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
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
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
