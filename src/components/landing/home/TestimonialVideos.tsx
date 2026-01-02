"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Video, Quote } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
}

export default function TestimonialVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/landing/home/reels");
        const json = await res.json();
        if (json.success) {
          setVideos(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) return <VideoSkeleton />;
  if (!videos.length) return null;

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black overflow-hidden">
      
      {/* --- Background Decor --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]" 
             style={{ backgroundImage: "radial-gradient(#EF4444 1px, transparent 1px)", backgroundSize: "32px 32px" }} 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-100/40 dark:bg-red-900/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs font-bold tracking-widest uppercase mb-4"
          >
            <Video className="w-3 h-3" />
            Customer Stories
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white"
          >
            Real Stories, <span className="text-red-500">Real Trust</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-400"
          >
            Watch how GyaniTalk has transformed lives through the power of ancient Vedic wisdom.
          </motion.p>
        </div>

        {/* --- Video Scroll Container --- */}
        <div className="relative -mx-4 sm:mx-0">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 px-4 sm:px-0 pb-12 scrollbar-hide">
            
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="snap-center shrink-0 w-[280px] sm:w-[300px]" // Width optimized for vertical cards
              >
                <div className="group relative h-full flex flex-col bg-white dark:bg-gray-950 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-300">
                  
                  {/* Thumbnail Area - Now 9:16 Aspect Ratio */}
                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-gray-900">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60"
                      loading="lazy"
                    />
                    
                    {/* Play Button Overlay */}
                    <a 
                      href={video.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center z-10"
                    >
                      <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#FF0000] group-hover:border-[#FF0000]">
                        <Play className="w-6 h-6 text-white ml-1 fill-white" />
                        <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-75" />
                      </div>
                    </a>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Quote Badge */}
                    <div className="absolute top-4 left-4 pointer-events-none">
                       <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <Quote className="w-4 h-4 text-white fill-white" />
                       </div>
                    </div>

                    {/* Caption inside the video area for Shorts style */}
                    <div className="absolute bottom-0 left-0 w-full p-5 text-white pointer-events-none">
                      <p className="text-sm font-bold text-white leading-snug line-clamp-3 drop-shadow-md">
                        {video.title}
                      </p>
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}

          </div>
        </div>

      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}

// --- Loading Skeleton ---
function VideoSkeleton() {
  return (
    <section className="py-24 px-4 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto mb-10 text-center">
         <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full mb-4 mx-auto animate-pulse"/>
         <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto animate-pulse"/>
      </div>
      <div className="flex gap-6 overflow-hidden px-4">
        {[1, 2, 3, 4].map((i) => (
          // Adjusted skeleton height for 9:16 ratio
          <div key={i} className="w-[280px] shrink-0 h-[500px] bg-gray-100 dark:bg-gray-900 rounded-[2rem] animate-pulse" />
        ))}
      </div>
    </section>
  );
}