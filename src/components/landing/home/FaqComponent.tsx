"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Plus, Minus, MessageCircle } from "lucide-react";

// --- Types ---
interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqComponent() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch("/api/landing/home/faq");
        const json = await res.json();
        if (json.success) {
          setFaqs(json.data);
          // Optional: Open the first FAQ by default
          if (json.data.length > 0) setActiveIndex(json.data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleAccordion = (id: string) => {
    setActiveIndex(activeIndex === id ? null : id);
  };

  if (loading) return <FaqSkeleton />;
  if (!faqs.length) return null;

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black overflow-hidden">
      
      {/* --- Background Decorative Elements (Matching KundaliCard) --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]" 
             style={{ backgroundImage: "radial-gradient(#FF6B35 1px, transparent 1px)", backgroundSize: "32px 32px" }} 
        />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-100/40 dark:bg-orange-900/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100/40 dark:bg-blue-900/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        
        {/* --- Header --- */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs font-bold tracking-widest uppercase mb-4"
          >
            <HelpCircle className="w-3 h-3" />
            Common Queries
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white"
          >
            Frequently Asked <span className="text-[#FF6B35]">Questions</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-base text-gray-600 dark:text-gray-400"
          >
            Have questions about your astrological journey? Find answers to the most common queries below.
          </motion.p>
        </div>

        {/* --- Accordion Grid --- */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div 
                className={`group rounded-3xl border transition-all duration-300 overflow-hidden ${
                  activeIndex === faq.id 
                    ? "bg-white dark:bg-gray-900 border-orange-200 dark:border-orange-900/50 shadow-lg shadow-orange-500/5" 
                    : "bg-white/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-orange-100 dark:hover:border-gray-700"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className={`text-base sm:text-lg font-bold transition-colors ${
                    activeIndex === faq.id 
                      ? "text-[#FF6B35]" 
                      : "text-gray-900 dark:text-white group-hover:text-[#FF6B35]"
                  }`}>
                    {faq.question}
                  </span>
                  
                  <div className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    activeIndex === faq.id 
                      ? "bg-[#FF6B35] text-white rotate-180" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-[#FF6B35] group-hover:text-white"
                  }`}>
                    {activeIndex === faq.id ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {activeIndex === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-0">
                        <div className="h-px w-full bg-gray-100 dark:bg-gray-800 mb-4" />
                        <p className="text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300">
                          {stripHtml(faq.answer)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Footer CTA --- */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Still have questions? We're here to help!
          </p>
          <a href="/contact" className="inline-flex items-center gap-2 text-sm font-bold text-[#FF6B35] hover:underline">
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </a>
        </div>

      </div>
    </section>
  );
}

// --- Helper ---
const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
};

// --- Skeleton ---
function FaqSkeleton() {
  return (
    <section className="py-24 px-4 bg-white dark:bg-black">
      <div className="max-w-2xl mx-auto space-y-4">
         <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-10 animate-pulse" />
         {[1, 2, 3, 4].map((i) => (
           <div key={i} className="h-20 w-full bg-gray-100 dark:bg-gray-900 rounded-3xl animate-pulse" />
         ))}
      </div>
    </section>
  );
}