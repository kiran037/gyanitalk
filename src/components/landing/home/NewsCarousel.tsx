"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Calendar, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { avatar } from "@/lib/images";

// --- Types ---
interface NewsItem {
  id: string;
  channel: string;
  link: string;
  bannerImage: string | null;
  description: string;
  newsDate: string;
}

// --- Helpers ---
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function NewsCarousel() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ref for the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/landing/home/news");
        const json = await res.json();
        if (json.success) {
          setNews(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // --- Scroll Logic ---
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Scroll by card width (380px) + gap (20px)
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (loading) return <NewsSkeleton />;
  if (!news.length) return null;

  return (
    <section className="relative py-16 sm:py-24 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-black overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-10 right-10 w-64 h-64 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Header with Navigation --- */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 text-xs font-bold tracking-widest uppercase mb-3"
            >
              <Newspaper className="w-3 h-3" />
              Media Coverage
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white"
            >
              GyaniTalk in the <span className="text-orange-600 dark:text-orange-400">News</span>
            </motion.h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              See what leading media outlets are saying about our astrological services.
            </p>
          </div>
          
          {/* Scroll Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className="p-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button 
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="p-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* --- Scrollable Container (Snap Scroll) --- */}
        <div className="relative -mx-4 sm:mx-0 group">
          
          {/* 
            ref={scrollRef} added here for button control.
            'scroll-smooth' ensures native smoothness.
          */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-5 px-4 sm:px-0 pb-8 scrollbar-hide scroll-smooth"
          >
            
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="snap-start shrink-0 w-[85vw] sm:w-[380px] flex flex-col"
              >
                <a 
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="group/card h-full"
                >
                  <article className="h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    
                    {/* Image Area - Fixed Height & Centered Logo */}
                    <div className="relative h-48 w-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center p-6 border-b border-gray-100 dark:border-gray-800">
                       {item.bannerImage ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={avatar(item.bannerImage)}
                              alt={item.channel}
                              fill
                              className="object-contain transition-transform duration-500 group-hover/card:scale-105"
                              sizes="(max-width: 768px) 85vw, 380px"
                            />
                          </div>
                       ) : (
                          <span className="text-2xl font-bold text-gray-400 select-none">
                            {item.channel}
                          </span>
                       )}
                       
                       {/* External Link Icon */}
                       <div className="absolute top-4 right-4 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0 transition-all duration-300 shadow-lg">
                          <ExternalLink className="w-4 h-4 text-white" />
                       </div>
                    </div>

                    {/* Content Area - Flex Grow to push footer down */}
                    <div className="p-6 flex flex-col flex-1">
                      
                      {/* Meta Data */}
                      <div className="flex items-center justify-between mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <span className="text-orange-600 dark:text-orange-400">{item.channel}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(item.newsDate)}</span>
                        </div>
                      </div>

                      <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed mb-6 group-hover/card:text-gray-900 dark:group-hover/card:text-white transition-colors">
                        "{item.description}"
                      </h3>

                      {/* Footer - Pushed to bottom via mt-auto */}
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                         <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white group-hover/card:text-orange-600 dark:group-hover/card:text-orange-400 transition-colors">
                            Read Full Story <ArrowRight className="w-4 h-4 transition-transform group-hover/card:translate-x-1" />
                         </span>
                      </div>
                    </div>
                  </article>
                </a>
              </motion.div>
            ))}

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
function NewsSkeleton() {
  return (
    <section className="py-24 px-4 bg-white dark:bg-black">
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
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-[300px] sm:w-[380px] shrink-0 h-[400px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse flex flex-col">
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800"/>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between mb-4">
                 <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded"/>
                 <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded"/>
              </div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2"/>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2"/>
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"/>
              
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                 <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}