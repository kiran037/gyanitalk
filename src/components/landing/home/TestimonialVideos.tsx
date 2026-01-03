"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Video, Quote, X, ChevronLeft, ChevronRight } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
}

export default function TestimonialVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  
  // Ref for the scroll container
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // --- Scroll Logic ---
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Scroll by card width (approx 300px) + gap
      const scrollAmount = direction === 'left' ? -320 : 320;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // --- YouTube Helper ---
  const getEmbedUrl = (url: string) => {
    let videoId = "";
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/);
    
    if (match && match[1]) {
      videoId = match[1];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    }
    return url;
  };

  const handleVideoClick = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  // Keyboard support for opening video
  const handleKeyDown = (e: KeyboardEvent, video: VideoItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleVideoClick(video);
    }
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  if (loading) return <VideoSkeleton />;
  if (!videos.length) return null;

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black overflow-hidden">
      
      {/* --- Background Decor --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]" 
             style={{ backgroundImage: "radial-gradient(#EF4444 1px, transparent 1px)", backgroundSize: "32px 32px" }} 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/40 dark:bg-orange-900/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* --- Header with Navigation --- */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 text-xs font-bold tracking-widest uppercase mb-4"
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
              Real Stories, <span className="text-orange-500">Real Trust</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-gray-600 dark:text-gray-400"
            >
              Watch how GyaniTalk has transformed lives through the power of ancient Vedic wisdom.
            </motion.p>
          </div>

          {/* Scroll Buttons (Visible on Desktop) */}
          <div className="flex items-center gap-3">
             <button 
               onClick={() => scroll('left')}
               aria-label="Scroll left"
               className="p-3 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-orange-300 dark:hover:border-orange-900 transition-all active:scale-95 bg-white dark:bg-gray-950 shadow-sm"
             >
               <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
             </button>
             <button 
               onClick={() => scroll('right')}
               aria-label="Scroll right"
               className="p-3 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-orange-300 dark:hover:border-orange-900 transition-all active:scale-95 bg-white dark:bg-gray-950 shadow-sm"
             >
               <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
             </button>
          </div>
        </div>

        {/* --- Video Scroll Container --- */}
        <div className="relative -mx-4 sm:mx-0">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-5 px-4 sm:px-0 pb-12 scrollbar-hide scroll-smooth"
          >
            
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="snap-center shrink-0 w-[280px] sm:w-[300px]"
              >
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => handleVideoClick(video)}
                  onKeyDown={(e) => handleKeyDown(e, video)}
                  className="group relative h-full flex flex-col bg-white dark:bg-gray-950 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-500/30"
                >
                  
                  {/* Thumbnail Area - 9:16 Aspect Ratio */}
                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-gray-900">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60"
                      loading="lazy"
                    />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#FF0000] group-hover:border-[#FF0000]">
                        <Play className="w-6 h-6 text-white ml-1 fill-white" />
                        <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-75" />
                      </div>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Quote Badge */}
                    <div className="absolute top-4 left-4 pointer-events-none">
                       <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <Quote className="w-4 h-4 text-white fill-white" />
                       </div>
                    </div>

                    {/* Caption */}
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

      {/* --- Video Modal --- */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={closeVideo} 
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
              style={{ maxHeight: '90vh' }}
            >
              {/* Close Button */}
              <button
                onClick={closeVideo}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Video Player Container */}
              <div className="relative pt-[56.25%] sm:pt-[56.25%] h-0 w-full bg-black">
                {selectedVideo.videoUrl.includes("youtu") ? (
                    <iframe
                    src={getEmbedUrl(selectedVideo.videoUrl)}
                    title={selectedVideo.title}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={selectedVideo.videoUrl} 
                    controls 
                    autoPlay 
                    className="absolute top-0 left-0 w-full h-full object-contain"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div key={i} className="w-[280px] shrink-0 h-[500px] bg-gray-100 dark:bg-gray-900 rounded-[2rem] animate-pulse" />
        ))}
      </div>
    </section>
  );
}