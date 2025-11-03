"use client";

import { useEffect, useState, useCallback } from "react";
import { GlassCard } from "../GlassUI/GlassKit";
import AddBlogModal from "./AddBlogModal";
import BlogCard from "./BlogCard";
import type { Blog } from "../../types/blogs";
import { getBlogsData } from "@/app/blogs/fetch";
import { useToast } from "@/components/Toast/ToastProvider";

export default function BlogListClient({
  initialData,
  page,
  totalPages,
  search,
  onRefresh,
}: {
  initialData: Blog[];
  page: number;
  totalPages: number;
  search: string;
  onRefresh: () => Promise<void>;
}) {
  const toast = useToast();
  const [blogs, setBlogs] = useState<Blog[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const { data } = await getBlogsData({ page, limit: 15, search });
        setBlogs(data || []);
      } catch {
        toast("error", "Error", "Failed to load blogs.");
      } finally {
        setLoading(false);
      }
    }
    if (page !== 1 || search !== "") fetchBlogs();
    else setBlogs(initialData || []);
  }, [page, search, initialData, toast]);

  const afterAnyChange = useCallback(async () => {
    await onRefresh();
    const { data } = await getBlogsData({ page, limit: 15, search });
    setBlogs(data || []);
  }, [onRefresh, page, search]);

  return (
    <>
      {/* Toolbar */}
      <div className="relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Blogs</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Create, edit and manage blog posts</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)] transition hover:from-blue-700 hover:to-purple-700 active:scale-[0.98]">
              + Add Blog
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <GlassCard hover={false} key={i} className="overflow-hidden">
              <div className="h-64 w-full animate-pulse bg-slate-200/70 dark:bg-white/[0.06]" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/[0.06]" />
                <div className="h-4 w-2/3 animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/[0.06]" />
              </div>
            </GlassCard>
          ))
        ) : blogs.length ? (
          blogs.map((b) => <BlogCard key={b.id} item={b} onRefresh={afterAnyChange} />)
        ) : (
          <GlassCard hover={false} className="p-10 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">No blogs found</p>
          </GlassCard>
        )}
      </div>

      {/* Add Modal */}
      <AddBlogModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={afterAnyChange} page={page} search={search} />
    </>
  );
}
