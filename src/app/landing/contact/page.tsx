"use client";

import { useState, useMemo } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  MessageSquare,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    contact_name: "",
    contact_email: "",
    contact_message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const shouldReduceMotion = useReducedMotion();

  // Pre-generate deterministic offsets once
  const particleOffsets = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        x: (Math.sin(i + 1) * 40) - 20,
        y: (Math.cos(i + 2) * 40) - 20,
      })),
    []
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/landing/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        setError(data.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LandingWrapper>
      {/* Hero Section */}
      <section className="relative min-h-[45vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-24 sm:pt-28">
        {/* Subtle grid background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating Particles – hidden on very small screens & disabled when user prefers reduced motion */}
        {!shouldReduceMotion && (
          <div className="hidden sm:block">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.15, 0.4, 0.15],
                  scale: [1, 1.6, 1],
                  x: [0, particleOffsets[i].x, 0],
                  y: [0, particleOffsets[i].y, 0],
                }}
                transition={{
                  duration: 12 + i * 1.2,
                  repeat: Infinity,
                  delay: i * 0.35,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${5 + (i % 5) * 18}%`,
                  top: `${10 + Math.floor(i / 5) * 30}%`,
                }}
              >
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full blur-[2px] opacity-60" />
                  <div className="absolute inset-0 w-3 h-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full animate-ping opacity-30" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Gradient Orbs – desktop/tablet only for performance */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              className="hidden md:block absolute top-1/4 -left-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
              animate={{
                scale: [1, 1.15, 1],
                x: [0, 40, 0],
                y: [0, 25, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="hidden md:block absolute top-1/3 -right-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-[#FFB347] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, -30, 0],
                y: [0, 40, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </>
        )}

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 sm:space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-full backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                GET IN TOUCH
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
              Have any questions? Tell us your issue and we&apos;ll get back to
              you as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
            {/* Left Side - Contact Information */}
            <motion.div
              className="space-y-6 sm:space-y-7"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              {/* Company Info */}
              <motion.div
                className="bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/70 rounded-2xl p-6 sm:p-8 shadow-md"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Gyani Talk
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Consult online astrologers any time, from anywhere.
                </p>

                <div className="space-y-5 sm:space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Our Office
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        OSTWAL PLAZA, 1ST FLOOR
                        <br />
                        SHRI KARNIPRAKASH BUILDING
                        <br />
                        ABOVE CENTRAL BANK OF INDIA
                        <br />
                        OPP, Airport Rd, Sundarwas
                        <br />
                        Udaipur, Rajasthan 313001
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FFB347] to-[#FFCC80] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Customer Support
                      </h3>
                      <a
                        href="tel:6375636577"
                        className="text-sm sm:text-base text-[#FF6B35] dark:text-[#FF8C61] hover:underline font-medium"
                      >
                        6375636577
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF8C61] to-[#FFB347] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Email Us
                      </h3>
                      <a
                        href="mailto:career@gyanitalk.com"
                        className="text-sm sm:text-base text-[#FF6B35] dark:text-[#FF8C61] hover:underline font-medium break-all"
                      >
                        career@gyanitalk.com
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Info Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: MessageSquare,
                    title: "24/7 Support",
                    desc: "We're always here to help you.",
                  },
                  {
                    icon: CheckCircle,
                    title: "Quick Response",
                    desc: "Most queries answered within 24 hours.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/70 rounded-2xl p-5 shadow-sm cursor-pointer"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    whileHover={{
                      scale: 1.03,
                      borderColor: "rgba(255, 107, 53, 0.6)",
                    }}
                  >
                    <item.icon className="w-8 h-8 text-[#FF6B35] mb-2" />
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Side - Contact Form */}
            <motion.div
              className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/70 rounded-2xl p-6 sm:p-8 shadow-md"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Send us a message
              </h2>

              {success && (
                <motion.div
                  className="mb-5 sm:mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-xl flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-green-800 dark:text-green-300">
                    Thank you for contacting us! We&apos;ll get back to you
                    soon.
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  className="mb-5 sm:mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-xs sm:text-sm text-red-800 dark:text-red-300">
                    {error}
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="contact_name"
                    className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="contact_name"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/70 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="contact_email"
                    className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/70 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="contact_message"
                    className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="contact_message"
                    name="contact_message"
                    value={formData.contact_message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg白/80 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/70 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all resize-none text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-sm sm:text-base font-semibold rounded-xl shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </LandingWrapper>
  );
}