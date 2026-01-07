"use client";

import { useState } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: "easeOut" },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay },
  }),
};

export default function ContactClient() {
  const [formData, setFormData] = useState({
    contact_name: "",
    contact_email: "",
    contact_message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/landing/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          contact_name: "",
          contact_email: "",
          contact_message: "",
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || "Failed to send message.");
      }
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LandingWrapper>
      <main className="relative min-h-screen overflow-hidden bg-[#FAFAFA] dark:bg-[#050505] text-gray-900 dark:text-gray-100 selection:bg-[#FF6B35] selection:text-white">
        
        {/* --- Background Elements --- */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Gradient Blobs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#FF6B35]/10 via-[#FFB347]/5 to-transparent blur-[100px] rounded-full opacity-60" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#FF6B35]/5 to-transparent blur-[120px] rounded-full opacity-40" />
        </div>

        {/* --- Header Section --- */}
        <section className="relative pt-32 pb-12 sm:pt-40 px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-sm mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B35] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B35]"></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">
                Contact Us
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              Let&apos;s Start a <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Conversation
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              custom={0.2}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed"
            >
              Have a question about your horoscope? Need help with a booking? 
              We are here to help you navigate your cosmic journey.
            </motion.p>
          </div>
        </section>

        {/* --- Main Content Grid --- */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8 z-10 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* --- LEFT COLUMN: Contact Info (Bento Style) --- */}
              <motion.div 
                className="lg:col-span-5 space-y-4"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              >
                
                {/* Card 1: Main Office */}
                <motion.div variants={scaleIn} className="group relative overflow-hidden bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MapPin className="w-24 h-24 text-[#FF6B35] -mr-8 -mt-8" />
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-[#FF6B35]">
                        <MapPin className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold">Headquarters</h3>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed pl-1">
                     <p>OSTWAL PLAZA, 1ST FLOOR</p>
                     <p>SHRI KARNIPRAKASH BUILDING</p>
                     <p>Udaipur, Rajasthan 313001</p>
                  </div>
                </motion.div>

                {/* Card 2: Quick Contacts */}
                <div className="grid sm:grid-cols-2 gap-4">
                   <motion.a 
                     href="mailto:career@gyanitalk.com"
                     variants={scaleIn} 
                     className="bg-white dark:bg-[#111] p-5 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm hover:border-[#FF6B35]/50 transition-colors cursor-pointer"
                   >
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 mb-3">
                         <Mail className="w-5 h-5" />
                      </div>
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Email Us</div>
                      <div className="text-sm font-bold truncate">career@gyanitalk.com</div>
                   </motion.a>

                   <motion.a 
                     href="tel:6375636577"
                     variants={scaleIn} 
                     className="bg-white dark:bg-[#111] p-5 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm hover:border-[#FF6B35]/50 transition-colors cursor-pointer"
                   >
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 mb-3">
                         <Phone className="w-5 h-5" />
                      </div>
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Call Us</div>
                      <div className="text-sm font-bold">6375-636-577</div>
                   </motion.a>
                </div>

                {/* Card 3: Support Hours */}
                <motion.div variants={scaleIn} className="bg-gradient-to-br from-[#111] to-[#222] dark:from-[#1a1a1a] dark:to-[#000] p-6 rounded-3xl text-white relative overflow-hidden">
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                   <div className="relative z-10 flex items-start gap-4">
                      <Clock className="w-6 h-6 text-[#FF6B35] mt-1" />
                      <div>
                         <h3 className="text-lg font-bold mb-1">24/7 Support</h3>
                         <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Our cosmic support team is available around the clock to assist you with any queries.
                         </p>
                         <div className="flex items-center gap-2 text-xs font-semibold text-[#FF6B35]">
                            <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
                            Typical Reply: &lt; 2 Hrs
                         </div>
                      </div>
                   </div>
                </motion.div>
              </motion.div>

              {/* --- RIGHT COLUMN: Form --- */}
              <motion.div 
                className="lg:col-span-7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative rounded-[2.5rem] p-1 overflow-hidden bg-gradient-to-b from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 border border-white/20 shadow-2xl backdrop-blur-xl">
                  {/* Inner Form Container */}
                  <div className="bg-white/50 dark:bg-[#0A0A0A]/50 rounded-[2.3rem] p-6 sm:p-10 relative">
                     
                     <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2">Send us a message</h2>
                        <p className="text-gray-500 text-sm">Fill out the form below and we'll get back to you shortly.</p>
                     </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      <div className="grid sm:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                          <label htmlFor="contact_name" className="text-sm font-semibold ml-1">Full Name</label>
                          <input
                            type="text"
                            id="contact_name"
                            name="contact_name"
                            value={formData.contact_name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                            className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all placeholder:text-gray-400 text-sm font-medium"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label htmlFor="contact_email" className="text-sm font-semibold ml-1">Email Address</label>
                          <input
                            type="email"
                            id="contact_email"
                            name="contact_email"
                            value={formData.contact_email}
                            onChange={handleChange}
                            required
                            placeholder="john@example.com"
                            className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all placeholder:text-gray-400 text-sm font-medium"
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <label htmlFor="contact_message" className="text-sm font-semibold ml-1">How can we help?</label>
                        <textarea
                          id="contact_message"
                          name="contact_message"
                          value={formData.contact_message}
                          onChange={handleChange}
                          required
                          rows={6}
                          placeholder="Tell us a bit about your query..."
                          className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all placeholder:text-gray-400 text-sm font-medium resize-none"
                        />
                      </div>

                      {/* Messages (Success/Error) */}
                      <AnimatePresence mode="wait">
                        {success && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3"
                          >
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-300">Message sent successfully!</span>
                          </motion.div>
                        )}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3"
                          >
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <span className="text-sm font-medium text-red-800 dark:text-red-300">{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={!loading ? { scale: 1.01 } : {}}
                        whileTap={!loading ? { scale: 0.99 } : {}}
                        className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white font-bold text-lg rounded-xl py-4 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                      >
                         {loading ? (
                           <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : (
                           <>
                             Send Message <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                           </>
                         )}
                      </motion.button>
                    </form>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      </main>
    </LandingWrapper>
  );
}