"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { TrashIcon } from "@/assets/icons";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui-elements/table";
import { cn } from "@/lib/utils";
import { isValidImageUrl } from "../functions";
import {
    createChapter,
    deleteChapters,
    getChapters,
    updateChapter,
    getCourses,
} from "@/app/(courses)/fetch";
import { uploadImage } from "@/upload";
import toast from "react-hot-toast";
import { Pencil, Plus } from "lucide-react";

type Course = { id: number; name: string };

export function ChapterTable() {
    const [chapters, setChapters] = useState<any[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingChapter, setEditingChapter] = useState<any>(null);

    // ---- Edit form state ----
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({
        course_id: null as number | null,
        title: "",
        description: "",
        pdf_type: "file",
        pdf: null as File | string | null,
        image_type: "file",
        image: null as File | string | null,
        video_type: "link",
        video: null as File | string | null,
        video_format: "",
        is_paid: 0,
    });

    // ---- Add modal state ----
    const [showAddModal, setShowAddModal] = useState(false);
    const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
    const [addFormData, setAddFormData] = useState<any>({
        course_id: null as number | null,
        title: "",
        description: "",
        pdf_type: "file",
        pdf: null as File | null,
        image_type: "file",
        image: null as File | null,
        video_type: "link",
        video: null as File | null,
        video_format: "",
        is_paid: 0,
    });

    // ------- Fetchers -------
    const fetchChapters = async () => {
        try {
            setLoading(true);
            const res = await getChapters();
            setChapters(res.chapters || []);
        } catch (error) {
            console.error("Failed to fetch Chapters", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await getCourses();
            setCourses(res.courses || []);
        } catch (e) {
            console.error("Failed to fetch courses", e);
        }
    };

    useEffect(() => {
        fetchChapters();
        fetchCourses();
    }, []);

    // small helper to upload file if it's a File object
    const uploadIfFile = async (maybeFile: any, folder: "image" | "pdf") => {
        if (maybeFile instanceof File) {
            const uploaded = await uploadImage(maybeFile, folder, process.env.NEXT_PUBLIC_CHAPTER_UPLOAD_PATH);
            if (uploaded?.success && uploaded?.path) {
                return uploaded.path.replace("public", "");
            }
            throw new Error(`Failed to upload ${folder}`);
        }
        return maybeFile || null;
    };

    return (
        <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">

            {/* Add Chapter button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => {
                        setAddFormData({
                            course_id: null,
                            title: "",
                            description: "",
                            pdf_type: "file",
                            pdf: null,
                            image_type: "file",
                            image: null,
                            video_type: "link",
                            video: null,
                            video_format: "",
                            is_paid: 0,
                        });
                        setAddImagePreview(null);
                        setShowAddModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                    <Plus size={16} /> Add Chapter
                </button>
            </div>

            {loading ? (
                <p className="text-center py-4">Loading Chapters...</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
                            <TableHead className="min-w-[260px]">CHAPTER</TableHead>
                            <TableHead className="min-w-[150px]">Course</TableHead>
                            <TableHead className="min-w-[100px]">Paid</TableHead>
                            <TableHead className="min-w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {chapters.map((item: any, index: number) => (
                            <TableRow
                                key={index}
                                className="hover:bg-muted/40 dark:hover:bg-muted/10 transition-colors border-[#eee] dark:border-dark-3"
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={
                                                isValidImageUrl(item?.image)
                                                    ? `${process.env.NEXT_PUBLIC_BASEURL}/public${item?.image}`
                                                    : "https://gyanitalk.com/build/assets/images/person.png"
                                            }
                                            className="object-cover rounded-md border border-gray-300 dark:border-dark-3"
                                            width={42}
                                            height={42}
                                            alt={item?.title || "Chapter"}
                                        />
                                        <span className="text-dark dark:text-white font-medium line-clamp-1">
                                            {item?.title || "-"}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <span className={cn("font-medium px-2 py-1 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400")}>
                                        {item.course?.name ?? "-"}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <span
                                        className={cn(
                                            "text-xs font-semibold px-2 py-1 rounded-full",
                                            Number(item.is_paid) === 1
                                                ? "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300"
                                                : "bg-red-100 text-red-600 dark:bg-red-700/20 dark:text-red-400"
                                        )}
                                    >
                                        {Number(item.is_paid) === 1 ? "Paid" : "Free"}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingChapter(item);
                                                // seed edit form with current values
                                                setFormData({
                                                    course_id: item.course_id ?? null,
                                                    title: item.title ?? "",
                                                    description: item.description ?? "",
                                                    pdf_type: item.pdf_type ?? "",
                                                    pdf: item.pdf ?? null,
                                                    image_type: item.image_type ?? "",
                                                    image: item.image ?? null,
                                                    video_type: item.video_type ?? "",
                                                    video: item.video ?? null,
                                                    video_format: item.video_format ?? "",
                                                    is_paid: Number(item.is_paid ?? 0),
                                                });
                                                setImagePreview(
                                                    isValidImageUrl(item?.image)
                                                        ? `${process.env.NEXT_PUBLIC_BASEURL}/public${item.image}`
                                                        : null
                                                );
                                                setShowEditModal(true);
                                            }}
                                            className="text-blue-500 hover:text-blue-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedChapterId(item.id);
                                                setShowModal(true);
                                            }}
                                            className="text-red-500 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <span className="sr-only">Delete</span>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Delete Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Delete Chapter
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete this chapter? This action cannot be undone.
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
                                    if (selectedChapterId) {
                                        const result = await deleteChapters(selectedChapterId);
                                        if (result?.success) {
                                            toast.success(`Chapter deleted successfully!`);
                                            fetchChapters();
                                        } else {
                                            toast.error("Failed to delete");
                                        }
                                        setShowModal(false);
                                        setSelectedChapterId(null);
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
            {showEditModal && editingChapter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3">
                            ✏️ Edit Chapter
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Course */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Course
                                </label>
                                <select
                                    value={formData.course_id ?? ""}
                                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value ? Number(e.target.value) : null })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                >
                                    <option value="">Select course</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Chapter Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                />
                            </div>

                            {/* Paid */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Chapter Type
                                </label>
                                <select
                                    value={formData.is_paid}
                                    onChange={(e) => setFormData({ ...formData, is_paid: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                >
                                    <option value={0}>Free</option>
                                    <option value={1}>Paid</option>
                                </select>
                            </div>

                            {/* Image + type */}
                            <div>
                                <div className="mt-2">
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
                                            const file = e.target.files?.[0] || null;
                                            setFormData({ ...formData, image: file });
                                            setImagePreview(file ? URL.createObjectURL(file) : null);
                                        }}
                                        className="w-full text-sm text-gray-700 dark:text-gray-300"
                                    />
                                </div>
                            </div>

                            {/* PDF + type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    PDF Type (e.g., pdf)
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setFormData({ ...formData, pdf: e.target.files?.[0] || null })}
                                        className="w-full text-sm text-gray-700 dark:text-gray-300"
                                    />
                                    {typeof formData.pdf === "string" && formData.pdf && (
                                        <p className="text-xs mt-1 break-all text-gray-600 dark:text-gray-300">
                                            Current: {formData.pdf}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Video + type + format */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Video Format</label>
                                        <select
                                            value={addFormData.video_format || ""}
                                            onChange={(e) => setAddFormData({ ...addFormData, video_format: e.target.value })}
                                            className="w-full border rounded px-2 py-1"
                                        >
                                            <option value="">Select</option>
                                            <option value="youtube">YouTube</option>
                                            <option value="vimeo">Vimeo</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">Video Link</label>
                                        <input
                                            type="text"
                                            placeholder="Paste YouTube/Vimeo link"
                                            value={addFormData.video || ""}
                                            onChange={(e) => setAddFormData({ ...addFormData, video: e.target.value })}
                                            className="w-full border rounded px-2 py-1"
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                rows={4}
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingChapter(null);
                                    setImagePreview(null);
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        const payload: any = { ...formData };

                                        // Upload files if new
                                        payload.image = await uploadIfFile(payload.image, "image");
                                        payload.pdf = await uploadIfFile(payload.pdf, "pdf");

                                        // coerce types
                                        payload.course_id = payload.course_id ? Number(payload.course_id) : null;
                                        payload.is_paid = Number(payload.is_paid || 0);

                                        const result = await updateChapter(editingChapter.id, payload);
                                        if (result?.success) {
                                            toast.success("Chapter updated successfully");
                                            fetchChapters();
                                            setShowEditModal(false);
                                            setEditingChapter(null);
                                            setImagePreview(null);
                                        } else {
                                            toast.error("Update failed");
                                        }
                                    } catch (e: any) {
                                        console.error(e);
                                        toast.error(e?.message || "Something went wrong");
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


            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3">
                            ➕ Add Chapter
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Course */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Course
                                </label>
                                <select
                                    value={addFormData.course_id ?? ""}
                                    onChange={(e) => setAddFormData({ ...addFormData, course_id: e.target.value ? Number(e.target.value) : null })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                >
                                    <option value="">Select course</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Chapter Title
                                </label>
                                <input
                                    type="text"
                                    value={addFormData.title}
                                    onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                />
                            </div>

                            {/* Paid */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Chapter Type
                                </label>
                                <select
                                    value={addFormData.is_paid}
                                    onChange={(e) => setAddFormData({ ...addFormData, is_paid: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                >
                                    <option value={0}>Free</option>
                                    <option value={1}>Paid</option>
                                </select>
                            </div>

                            {/* Image + type */}
                            <div>
                                <div className="mt-2">
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
                            </div>

                            {/* PDF + type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    PDF Type (e.g., pdf)
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setAddFormData({ ...addFormData, pdf: e.target.files?.[0] || null })}
                                        className="w-full text-sm text-gray-700 dark:text-gray-300"
                                    />
                                </div>
                            </div>

                            {/* Video + type + format */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Video Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Video Format</label>
                                        <select
                                            value={addFormData.video_format || ""}
                                            onChange={(e) => setAddFormData({ ...addFormData, video_format: e.target.value })}
                                            className="w-full border rounded px-2 py-1"
                                        >
                                            <option value="">Select</option>
                                            <option value="youtube">YouTube</option>
                                            <option value="vimeo">Vimeo</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">Video Link</label>
                                        <input
                                            type="text"
                                            placeholder="Paste YouTube/Vimeo link"
                                            value={addFormData.video || ""}
                                            onChange={(e) => setAddFormData({ ...addFormData, video: e.target.value })}
                                            className="w-full border rounded px-2 py-1"
                                        />
                                    </div>
                                </div>


                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                rows={4}
                                value={addFormData.description || ""}
                                onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            />
                        </div>

                        {/* Actions */}
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
                                        const payload: any = { ...addFormData };

                                        // Upload new files if chosen
                                        payload.image = await uploadIfFile(payload.image, "image");
                                        payload.pdf = await uploadIfFile(payload.pdf, "pdf");

                                        // coerce types
                                        payload.course_id = payload.course_id ? Number(payload.course_id) : null;
                                        payload.is_paid = Number(payload.is_paid || 0);

                                        const result = await createChapter(payload);
                                        if (result?.success) {
                                            toast.success("Chapter created successfully");
                                            setShowAddModal(false);
                                            setAddImagePreview(null);
                                            setAddFormData({
                                                course_id: null,
                                                title: "",
                                                description: "",
                                                pdf_type: "file",
                                                pdf: null,
                                                image_type: "file",
                                                image: null,
                                                video_type: "link",
                                                video: null,
                                                video_format: "",
                                                is_paid: 0,
                                            });
                                            fetchChapters();
                                        } else {
                                            toast.error("Failed to create Chapter");
                                        }
                                    } catch (e: any) {
                                        console.error(e);
                                        toast.error(e?.message || "Something went wrong");
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Create Chapter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
