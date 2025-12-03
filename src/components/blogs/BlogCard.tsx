// components/blogs/BlogCard.tsx
"use client";

import { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Power,
  Calendar,
  User,
  ExternalLink
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
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300 ${isSelected
        ? 'border-orange-500 shadow-lg shadow-orange-500/20 scale-[0.98]'
        : 'border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl'
        }`}
    >

      {/* Image Section */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">

        <img
          src={avatar(blog.blogImage)}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Selection Checkbox - Top Left (only show when selectionMode is true) */}
        {selectionMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(blog.id);
            }}
            className={`absolute top-3 left-3 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isSelected
              ? 'bg-orange-500 border-orange-500 scale-110'
              : 'bg-white/90 border-white hover:bg-orange-500 hover:border-orange-500'
              }`}
          >
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </button>
        )}


        {/* Status Badge - Top Right */}
        {/* Status Badge - Top Right (click to toggle active/inactive) */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();               // prevent card click
              onToggleStatus(blog.id);           // call handler passed from parent
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full backdrop-blur-sm transition-transform active:scale-95 ${blog.isActive ? "bg-emerald-500/90 text-white" : "bg-slate-500/90 text-white"
              }`}
            aria-pressed={blog.isActive}
            title={blog.isActive ? "Click to deactivate" : "Click to activate"}
          >
            {blog.isActive ? "Active" : "Inactive"}
          </button>
        </div>


        {/* Quick View Link - Bottom Right (on hover) */}
        <a
          href={`/landing/blog/${blog.slug || blog.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-10 p-2 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4 text-gray-700" />
        </a>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-[3rem] leading-snug">
          {blog.title}
        </h3>

        {/* Meta Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="truncate font-medium">{blog.author}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{formatDate(blog.postedOn)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
              <Eye className="w-3.5 h-3.5" />
              <span className="font-semibold">{blog.viewer}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            title="Delete blog"
            aria-label="Delete blog"
          >
            <Trash2 className="w-5 h-5" />
          </button>

        </div>
      </div>
    </div>
  );
}