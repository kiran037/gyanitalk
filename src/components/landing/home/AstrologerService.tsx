"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Users } from "lucide-react";
import { avatar } from "@/lib/images"; // Assuming this helper exists

interface Category {
  id: string;
  name: string;
  image: string | null;
}

export default function AstrologerService() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/landing/home/astrologer-categories");
        const json = await res.json();
        if (json.success) {
          setCategories(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <ServiceSkeleton />;
  if (!categories.length) return null;

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black overflow-hidden">
      
      {/* --- Background Decor --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]" 
             style={{ backgroundImage: "radial-gradient(#FF6B35 1px, transparent 1px)", backgroundSize: "32px 32px" }} 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/30 dark:bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold tracking-widest uppercase mb-4"
          >
            <Users className="w-3 h-3" />
            Expert Guidance
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white"
          >
            Consult by <span className="text-purple-600 dark:text-purple-400">Category</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-400"
          >
            Connect with specialists in various fields of Vedic science to find the perfect solution for your life's questions.
          </motion.p>
        </div>

        {/* --- Grid Layout --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href="/talk-to-astrologers" className="group block h-full">
                <div className="relative h-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900/50 transition-all duration-300 group-hover:-translate-y-1">
                  
                  {/* Icon Container */}
                  <div className="relative mb-4 w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
                    {cat.image ? (
                      <Image
                        src={avatar(cat.image)}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white text-center group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {cat.name}
                  </h3>
                  
                  <div className="mt-2 h-0.5 w-0 bg-purple-500 transition-all duration-300 group-hover:w-8 rounded-full" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

// --- Skeleton Loading ---
function ServiceSkeleton() {
  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-12">
           <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full mb-4 animate-pulse"/>
           <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"/>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center justify-center animate-pulse">
               <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 mb-4" />
               <div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}