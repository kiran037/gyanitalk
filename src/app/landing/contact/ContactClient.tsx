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

export default function ContactClient() {
  const [formData, setFormData] = useState({
    contact_name: "",
    contact_email: "",
    contact_message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const prefersReducedMotion = useReducedMotion();

  const particleOffsets = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        x: Math.sin(i + 1) * 40 - 20,
        y: Math.cos(i + 2) * 40 - 20,
      })),
    [],
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      {/* Hero Section */}
      <section className="relative flex min-h-[45vh] items-center justify-center overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8">
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
        {!prefersReducedMotion && (
          <div className="hidden sm:block">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="pointer-events-none absolute"
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
                  <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] opacity-60 blur-[2px]" />
                  <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] opacity-30" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Gradient Orbs – desktop/tablet only for performance */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute -left-1/4 top-1/4 hidden h-72 w-72 rounded-full bg-[#FF6B35] opacity-20 mix-blend-multiply blur-3xl filter dark:opacity-10 md:block lg:h-96 lg:w-96"
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
              className="absolute -right-1/4 top-1/3 hidden h-72 w-72 rounded-full bg-[#FFB347] opacity-20 mix-blend-multiply blur-3xl filter dark:opacity-10 md:block lg:h-96 lg:w-96"
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

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 sm:space-y-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:py-2">
              <Sparkles className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                GET IN TOUCH
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base lg:text-lg">
              Have any questions? Tell us your issue and we&apos;ll get back to
              you as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
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
                className="rounded-2xl border border-gray-200/70 bg-white/70 p-6 shadow-md backdrop-blur-sm dark:border-gray-700/70 dark:bg-white/5 sm:p-8"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
              >
                <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Gyani Talk
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
                  Consult online astrologers any time, from anywhere.
                </p>

                <div className="space-y-5 sm:space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] shadow-md sm:h-12 sm:w-12">
                      <MapPin className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                        Our Office
                      </h3>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 sm:text-sm">
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
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFB347] to-[#FFCC80] shadow-md sm:h-12 sm:w-12">
                      <Phone className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                        Customer Support
                      </h3>
                      <a
                        href="tel:6375636577"
                        className="text-sm font-medium text-[#FF6B35] hover:underline dark:text-[#FF8C61] sm:text-base"
                      >
                        6375636577
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8C61] to-[#FFB347] shadow-md sm:h-12 sm:w-12">
                      <Mail className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                        Email Us
                      </h3>
                      <a
                        href="mailto:career@gyanitalk.com"
                        className="break-all text-sm font-medium text-[#FF6B35] hover:underline dark:text-[#FF8C61] sm:text-base"
                      >
                        career@gyanitalk.com
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Info Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
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
                    className="cursor-pointer rounded-2xl border border-gray-200/70 bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:border-gray-700/70 dark:bg-white/5"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    whileHover={{
                      scale: 1.03,
                      borderColor: "rgba(255, 107, 53, 0.6)",
                    }}
                  >
                    <item.icon className="mb-2 h-8 w-8 text-[#FF6B35]" />
                    <h4 className="mb-1 text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Side - Contact Form */}
            <motion.div
              className="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-md backdrop-blur-sm dark:border-gray-700/70 dark:bg-white/5 sm:p-8"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-3xl">
                Send us a message
              </h2>

              {success && (
                <motion.div
                  aria-live="polite"
                  role="status"
                  className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-700/50 dark:bg-green-900/20 sm:mb-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <p className="text-xs text-green-800 dark:text-green-300 sm:text-sm">
                    Thank you for contacting us! We&apos;ll get back to you
                    soon.
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-700/50 dark:bg-red-900/20 sm:mb-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-xs text-red-800 dark:text-red-300 sm:text-sm">
                    {error}
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="contact_name"
                    className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm"
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
                    className="w-full rounded-xl border border-gray-200/70 bg-white/80 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#FF6B35] dark:border-gray-700/70 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 sm:px-4 sm:py-3 sm:text-base"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="contact_email"
                    className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm"
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
                    className="w-full rounded-xl border border-gray-200/70 bg-white/80 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#FF6B35] dark:border-gray-700/70 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 sm:px-4 sm:py-3 sm:text-base"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="contact_message"
                    className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm"
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
                    className="w-full resize-none rounded-xl border border-gray-200/70 bg-white/80 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#FF6B35] dark:border-gray-700/70 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 sm:px-4 sm:py-3 sm:text-base"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-5 py-3.5 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-4 sm:text-base"
                  whileHover={
                    prefersReducedMotion || loading ? {} : { scale: 1.02 }
                  }
                  whileTap={
                    prefersReducedMotion || loading ? {} : { scale: 0.98 }
                  }
                  transition={{ duration: 0.15 }}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-5 sm:w-5" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
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
