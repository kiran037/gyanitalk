"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Calendar, User, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import { avatar } from "@/lib/images";

// --- Types ---
interface Blog {
  id: string;
  title: string;
  slug: string | null;
  blogImage: string | null;
  previewImage: string | null;
  description: string | null;
  author: string | null;
  postedOn: string | null;
  categoryName?: string;
  viewer?: number;
}

// --- Helpers ---
const stripHtml = (html: string | null) => {
  if (!html) return "";
  if (html.trim().startsWith("{")) {
     try {
       JSON.parse(html);
       return "Read the full article to learn more about this fascinating topic..."; 
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // --- Scroll Logic ---
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -370 : 370; // Card width + gap
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (loading) return <BlogSkeleton />;
  if (!blogs.length) return null;

  return (
    <section className="relative py-16 sm:py-24 bg-gray-50 dark:bg-black overflow-hidden border-t border-gray-200 dark:border-gray-800">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-200/20 dark:bg-orange-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
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
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Explore ancient wisdom, astrological insights, and spiritual guidance.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
             <button 
               onClick={() => scroll('left')}
               aria-label="Scroll left"
               className="p-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all active:scale-95 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
             >
               <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
             </button>
             <button 
               onClick={() => scroll('right')}
               aria-label="Scroll right"
               className="p-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all active:scale-95 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
             >
               <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
             </button>
          </div>
        </div>

        {/* --- Scrollable Container --- */}
        <div className="relative -mx-4 sm:mx-0">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-5 px-4 sm:px-0 pb-8 scrollbar-hide scroll-smooth"
          >
            
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="snap-start shrink-0 w-[85vw] sm:w-[350px] flex flex-col"
              >
                <Link href={`/blog/${blog.slug || blog.id}`} className="group h-full">
                  <article className="h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    
                    {/* Image Area */}
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={avatar(blog.previewImage || blog.blogImage)}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 85vw, 350px"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                      
                      {/* Date Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5 shadow-sm">
                        <Calendar className="w-3 h-3 text-[#FF6B35]" />
                        {formatDate(blog.postedOn)}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex flex-col flex-1">
                      
                      {/* Category Tag (Optional) */}
                      {blog.categoryName && (
                        <span className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#FF6B35]">
                          {blog.categoryName}
                        </span>
                      )}

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-[#FF6B35] transition-colors">
                        {blog.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                        {stripHtml(blog.description)}
                      </p>
                      
                      {/* Footer */}
                      <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                           <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
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

            {/* "See More" Card */}
            <div className="snap-start shrink-0 w-[40vw] sm:w-[200px] flex items-center justify-center">
               <Link href="/blog" className="group flex flex-col items-center gap-3 p-6 text-center w-full h-full justify-center">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-[#FF6B35]">
                     <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#FF6B35]" />
                  </div>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-[#FF6B35] transition-colors">
                    Explore All<br/>Articles
                  </span>
               </Link>
            </div>

          </div>
        </div>

      </div>

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
         <div className="flex justify-between items-end">
            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"/>
            <div className="hidden sm:flex gap-2">
               <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"/>
               <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"/>
            </div>
         </div>
      </div>
      <div className="flex gap-5 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[300px] sm:w-[350px] shrink-0 h-[400px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse flex flex-col">
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 mb-4"/>
            <div className="p-4 flex-1 flex flex-col">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2"/>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2"/>
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded"/>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"/>
                </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}