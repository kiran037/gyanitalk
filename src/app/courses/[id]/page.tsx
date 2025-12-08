// app/courses/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  PlayCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { ChapterModal } from "@/components/courses/ChapterModal";
import { DeleteConfirmModal } from "@/components/courses/DeleteConfirmModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";

interface Chapter {
  id: number;
  title: string;
  description: string | null;
  is_paid: number;
  pdf_type: string | null;
  pdf: string | null;
  image_type: string | null;
  image: string | null;
  video_type: string | null;
  video: string | null;
  video_format: string | null;
  created_at: string;
}

interface Course {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: number | null;
  offer_price: number | null;
  is_paid: number;
  category: {
    id: number;
    name: string;
  } | null;
  chapters: Chapter[];
  _count: {
    chapters: number;
    course_purchase: number;
  };
  totalRevenue?: number;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const addToast = useToast();

  const BackButton = () => (
    <button
      onClick={() => router.back()}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
    </button>
  );

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();

      if (data.success) {
        setCourse(data.data);
      } else {
        addToast("error", "Error", "Failed to fetch course");
        router.push("/courses");
      }
    } catch (error) {
      addToast("error", "Error", "Error fetching course");
      console.error(error);
      router.push("/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setShowChapterModal(true);
  };

  const handleDeleteChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedChapter) return;

    try {
      const response = await fetch(
        `/api/courses/${courseId}/chapters/${selectedChapter.id}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Chapter deleted successfully");
        fetchCourse();
        setShowDeleteModal(false);
        setSelectedChapter(null);
      } else {
        addToast("error", "Error", data.error || "Failed to delete chapter");
      }
    } catch (error) {
      addToast("error", "Error", "Error deleting chapter");
      console.error(error);
    }
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Chapters",
      value: course._count.chapters,
      icon: <BookOpen className="w-5 h-5" />,
      color: "blue",
    },
    {
      label: "Students Enrolled",
      value: course._count.course_purchase,
      icon: <Users className="w-5 h-5" />,
      color: "green",
    },
    {
      label: "Revenue",
      value: `₹${course.totalRevenue || 0}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: "orange",
    },
    {
      label: "Completion Rate",
      value: "78%",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="w-full mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title={course.name}
          subtitle={course.category?.name || "Course"}
          badge={{
            text: course.is_paid === 1 ? "Premium" : "Free",
            variant: course.is_paid === 1 ? "orange" : "green",
          }}
          leftActions={<BackButton />}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                icon={<Edit className="w-4 h-4" />}
                onClick={() => router.push(`/courses/${courseId}/edit`)}
              >
                Edit Course
              </Button>
              <Button
                variant="primary"
                icon={<Eye className="w-4 h-4" />}
                onClick={() => window.open(`/landing/courses/${course.slug}`, "_blank")}
              >
                Preview
              </Button>
            </div>
          }
        />

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-10 h-10 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-lg flex items-center justify-center text-${stat.color}-500`}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Course Info */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            {course.image && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <img
                  src={avatar(course.image)}
                  alt={course.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Description */}
            {course.description && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Description
                </h2>
                <div
                  className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Course Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {course.is_paid === 1 ? "Paid" : "Free"}
                  </span>
                </div>
                {course.is_paid === 1 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Price</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{course.price}
                      </span>
                    </div>
                    {course.offer_price && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Offer Price
                        </span>
                        <span className="font-medium text-green-500">
                          ₹{course.offer_price}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {course.category?.name || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#FF6B35]" />
              Chapters ({course.chapters.length})
            </h2>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setSelectedChapter(null);
                setShowChapterModal(true);
              }}
            >
              Add Chapter
            </Button>
          </div>

          {course.chapters.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Chapters Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building your course by adding chapters
              </p>
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setSelectedChapter(null);
                  setShowChapterModal(true);
                }}
              >
                Add First Chapter
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {course.chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="group flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {chapter.title}
                    </h3>
                    {chapter.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {chapter.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {chapter.video && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded">
                          <PlayCircle className="w-3 h-3" />
                          Video
                        </span>
                      )}
                      {chapter.pdf && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                          <FileText className="w-3 h-3" />
                          PDF
                        </span>
                      )}
                      {chapter.image && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded">
                          <ImageIcon className="w-3 h-3" />
                          Image
                        </span>
                      )}
                      {chapter.is_paid === 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded font-bold">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit className="w-3 h-3" />}
                      onClick={() => handleEditChapter(chapter)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="w-3 h-3" />}
                      onClick={() => handleDeleteChapter(chapter)}
                      ariaLabel="Delete chapter"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showChapterModal && (
        <ChapterModal
          courseId={parseInt(courseId)}
          chapter={selectedChapter}
          onClose={() => {
            setShowChapterModal(false);
            setSelectedChapter(null);
          }}
          onSuccess={() => {
            fetchCourse();
            setShowChapterModal(false);
            setSelectedChapter(null);
          }}
        />
      )}

      {showDeleteModal && selectedChapter && (
        <DeleteConfirmModal
          title="Delete Chapter"
          message={`Are you sure you want to delete "${selectedChapter.title}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedChapter(null);
          }}
        />
      )}
    </div>
  );
}