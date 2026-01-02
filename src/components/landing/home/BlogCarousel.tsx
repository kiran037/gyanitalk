"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Calendar, User, ArrowRight, Eye, ChevronRight } from "lucide-react";
import { avatar } from "@/lib/images";

// --- Types ---
interface Blog {
  id: string;
  title: string;
  slug: string | null;
  blogImage: string | null;
  previewImage: string | null; // API might return this
  description: string | null;
  author: string | null;
  postedOn: string | null;
  categoryName?: string; // Optional if your API sends it
  viewer?: number;
}

// --- Helpers ---
const stripHtml = (html: string | null) => {
  if (!html) return "";
  // Check if it's Tiptap JSON
  if (html.trim().startsWith("{")) {
     try {
       const parsed = JSON.parse(html);
       // Simple extraction logic for Tiptap/ProseMirror JSON
       // You might need a more robust recursive function depending on your data structure
       return "Read the full article to learn more..."; 
     } catch(e) { return html; }
  }
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function BlogCarousel() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/landing/home/blog");
        const json = await res.json();
        if (json.success) {
          setBlogs(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <BlogSkeleton />;
  if (!blogs.length) return null;

  return (
    <section className="relative py-16 sm:py-24 bg-gray-50 dark:bg-black overflow-hidden">
      
      {/* Background Decor (Cosmic Theme) */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-200/20 dark:bg-orange-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-10">
          <div className="text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs font-bold tracking-widest uppercase mb-3"
            >
              <BookOpen className="w-3 h-3" />
              Cosmic Wisdom
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white"
            >
              Latest from the <span className="text-[#FF6B35]">Blog</span>
            </motion.h2>
          </div>

          <motion.div
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
          >
            <Link 
              href="/blog" 
              className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] transition-colors"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* --- Scrollable Container (Mobile Friendly Snap-Scroll) --- */}
        <div className="relative -mx-4 sm:mx-0">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 px-4 sm:px-0 pb-8 scrollbar-hide">
            
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="snap-center shrink-0 w-[85vw] sm:w-[350px] flex flex-col"
              >
                <Link href={`/blog/${blog.slug || blog.id}`} className="group h-full">
                  <article className="h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-300">
                    
                    {/* Image */}
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={avatar(blog.previewImage || blog.blogImage)}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 85vw, 350px"
                      />
                      {/* Date Badge */}
                      <div className="absolute top-3 left-3 bg-white/95 dark:bg-black/80 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5 shadow-sm">
                        <Calendar className="w-3 h-3 text-[#FF6B35]" />
                        {formatDate(blog.postedOn)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Category (Optional Placeholder if you want to add it later) */}
                      {blog.categoryName && (
                        <span className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#FF6B35]">
                          {blog.categoryName}
                        </span>
                      )}

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-[#FF6B35] transition-colors">
                        {blog.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                        {stripHtml(blog.description)}
                      </p>
                      
                      {/* Footer */}
                      <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                           <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <User className="w-3 h-3" />
                           </div>
                           <span className="truncate max-w-[100px]">{blog.author || "GyaniTalk"}</span>
                        </div>
                        
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B35] group-hover:translate-x-1 transition-transform">
                          Read More <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}

            {/* "See More" Card - Only shows at the end of scroll */}
            <div className="snap-center shrink-0 w-[40vw] sm:w-[200px] flex items-center justify-center">
               <Link href="/blog" className="group flex flex-col items-center gap-3 p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-[#FF6B35]">
                     <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#FF6B35]" />
                  </div>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-[#FF6B35]">View All<br/>Articles</span>
               </Link>
            </div>

          </div>
        </div>

        {/* Mobile View All Button (Visible only on mobile) */}
        <div className="mt-8 text-center sm:hidden">
           <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 transition-colors"
            >
              Explore All Articles
              <ArrowRight className="w-4 h-4" />
           </Link>
        </div>

      </div>

      {/* CSS to hide scrollbar but keep functionality */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

// --- Skeleton Loader ---
function BlogSkeleton() {
  return (
    <section className="py-24 px-4 bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto mb-10">
         <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full mb-4 animate-pulse"/>
         <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"/>
      </div>
      <div className="flex gap-6 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[300px] sm:w-[350px] shrink-0 h-[400px] bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse">
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"/>
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2"/>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2"/>
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded"/>
          </div>
        ))}
      </div>
    </section>
  );
}