"use client";

import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  ExternalLink,
  CheckCircle,
  XCircle,
  TrendingUp
} from "lucide-react";
import { avatar } from "@/lib/images";

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    slug?: string;
    blogImage: string;
    author: string;
    postedOn: string;
    viewer: string;
    isActive: boolean;
  };
  isSelected: boolean;
  selectionMode: boolean;
  onSelect: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: (id: string) => void;
}

export function BlogCard({
  blog,
  isSelected,
  selectionMode,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
}: BlogCardProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={(e) => {
        if (selectionMode) {
          e.stopPropagation();
          onSelect(blog.id);
        }
      }}
      className={`group relative flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? "ring-2 ring-orange-500 shadow-lg shadow-orange-500/10 scale-[0.99]"
          : "border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700"
      } ${selectionMode ? "cursor-pointer" : ""}`}
    >
      {/* === Image Section === */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={avatar(blog.blogImage)}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Top Bar: Selection & Status */}
        <div className="absolute top-3 inset-x-3 flex items-start justify-between z-10">
          {/* Selection Checkbox (Visible in selection mode or on hover) */}
          <div className={`${selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
             <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(blog.id);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border shadow-sm transition-all ${
                isSelected
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "bg-white/30 hover:bg-white border-white/50 text-gray-600"
              }`}
            >
              {isSelected ? (
                <CheckCircle className="w-5 h-5 fill-current" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-current" />
              )}
            </button>
          </div>

          {/* Status Toggle Pill */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(blog.id);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-bold shadow-sm transition-all ${
              blog.isActive
                ? "bg-emerald-500/90 border-emerald-400 text-white hover:bg-emerald-600"
                : "bg-gray-900/60 border-gray-700 text-gray-300 hover:bg-gray-900"
            }`}
          >
            {blog.isActive ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Active
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Inactive
              </>
            )}
          </button>
        </div>

        {/* Bottom Bar: Views & Preview */}
        <div className="absolute bottom-3 inset-x-3 flex items-end justify-between z-10">
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/90 bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
            <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
            {blog.viewer} Views
          </div>

          <a
            href={`/landing/blog/${blog.slug || blog.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-orange-500 hover:text-white"
            title="View Live Blog"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* === Content Section === */}
      <div className="flex flex-col flex-1 p-5">
        {/* Date */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(blog.postedOn)}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {blog.title}
        </h3>

        <div className="mt-auto pt-4 flex flex-col gap-4">
          {/* Author Info */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Written by</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate max-w-[150px]">
                {blog.author}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:hover:border-orange-900/30 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 transition-all active:scale-[0.98]"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-900/30 transition-all active:scale-[0.98]"
              title="Delete Blog"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}