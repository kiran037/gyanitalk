"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Calendar, ArrowRight } from "lucide-react";
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

  if (loading) return <NewsSkeleton />;
  if (!news.length) return null;

  return (
    <section className="relative py-16 sm:py-24 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-black overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-10">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-bold tracking-widest uppercase mb-3"
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
              GyaniTalk in the <span className="text-blue-600 dark:text-blue-400">News</span>
            </motion.h2>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 max-w-xs text-right"
          >
            See what leading media outlets are saying about our astrological services.
          </motion.div>
        </div>

        {/* --- Scrollable Container (Snap Scroll) --- */}
        <div className="relative -mx-4 sm:mx-0">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 px-4 sm:px-0 pb-8 scrollbar-hide">
            
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="snap-center shrink-0 w-[85vw] sm:w-[380px] flex flex-col"
              >
                <a 
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="group h-full"
                >
                  <article className="h-full flex flex-col bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300">
                    
                    {/* Image Area */}
                    <div className="relative h-48 w-full bg-white dark:bg-gray-800  flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
                       {item.bannerImage ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={avatar(item.bannerImage)}
                              alt={item.channel}
                              fill
                              className="object-contain transition-transform duration-500 group-hover:scale-105"
                              sizes="380px"
                            />
                          </div>
                       ) : (
                          <span className="text-2xl font-bold text-gray-300 select-none">
                            {item.channel}
                          </span>
                       )}
                       
                       {/* External Link Icon Overlay */}
                       <div className="absolute top-3 right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg translate-y-2 group-hover:translate-y-0">
                          <ExternalLink className="w-4 h-4 text-white" />
                       </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      
                      {/* Meta Data */}
                      <div className="flex items-center justify-between mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <span className="text-blue-600 dark:text-blue-400">{item.channel}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(item.newsDate)}</span>
                        </div>
                      </div>

                      <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4 flex-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        "{item.description}"
                      </h3>

                      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
                         <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Read Full Story <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
    <section className="py-16 px-4 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto mb-10">
         <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full mb-4 animate-pulse"/>
         <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"/>
      </div>
      <div className="flex gap-6 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-[300px] sm:w-[380px] shrink-0 h-[350px] bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 animate-pulse">
            <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6"/>
            <div className="flex justify-between mb-4">
               <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded"/>
               <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded"/>
            </div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2"/>
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2"/>
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"/>
          </div>
        ))}
      </div>
    </section>
  );
}