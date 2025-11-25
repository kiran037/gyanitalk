"use client";

import { useState } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { MapPin, Phone, Mail, Send, MessageSquare, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";


export default function ContactPage() {
    const [formData, setFormData] = useState({
        contact_name: "",
        contact_email: "",
        contact_message: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const particleOffsets = useMemo(() => {
        return Array.from({ length: 10 }).map(() => ({
            x: (Math.random() * 60) - 30,
            y: (Math.random() * 60) - 30
        }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
                    contact_message: ""
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
            <section className="relative min-h-[50vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-28">
                {/* Animated Grid Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)`,
                        backgroundSize: '40px 40px',
                    }} />
                </div>

                {/* Floating Particles */}
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute pointer-events-none"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0.15, 0.4, 0.15],
                            scale: [1, 1.8, 1],
                            x: [0, particleOffsets[i].x, 0],
                            y: [0, particleOffsets[i].y, 0],

                        }}
                        transition={{
                            duration: 12 + i * 1.5,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: "easeInOut"
                        }}
                        style={{
                            left: `${5 + (i % 5) * 20}%`,
                            top: `${10 + Math.floor(i / 5) * 40}%`,
                        }}
                    >
                        <div className="relative">
                            <div className="w-3 h-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full blur-[2px] opacity-60" />
                            <div className="absolute inset-0 w-3 h-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full animate-ping opacity-30" />
                        </div>
                    </motion.div>
                ))}

                {/* Gradient Orbs */}
                <motion.div
                    className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-1/3 -right-1/4 w-96 h-96 bg-[#FFB347] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -30, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />

                <div className="relative z-10 w-full mx-auto w-full text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-full backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">GET IN TOUCH</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Contact Us</span>
                        </h1>

                        <p className="text-lg text-gray-600 dark:text-gray-400 w-full mx-auto leading-relaxed">
                            Have any questions? We are happy to help. Tell us your issue and we will get back to you at the earliest.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="w-full mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Left Side - Contact Information */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Company Info */}
                            <motion.div
                                className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-8 shadow-lg"
                                whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.3)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    Gyani Talk
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                    Consult Online Astrologers Anytime
                                </p>

                                <div className="space-y-6">
                                    {/* Address */}
                                    <motion.div
                                        className="flex items-start gap-4"
                                        whileHover={{ x: 4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <MapPin className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Our Office</h3>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                                OSTWAL PLAZA, 1ST FLOOR<br />
                                                SHRI KARNIPRAKASH BUILDING<br />
                                                ABOVE CENTRAL BANK OF INDIA<br />
                                                OPP, Airport Rd, Sundarwas<br />
                                                Udaipur, Rajasthan 313001
                                            </p>
                                        </div>
                                    </motion.div>

                                    {/* Phone */}
                                    <motion.div
                                        className="flex items-start gap-4"
                                        whileHover={{ x: 4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#FFB347] to-[#FFCC80] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <Phone className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Customer Support</h3>
                                            <a
                                                href="tel:6375636577"
                                                className="text-[#FF6B35] dark:text-[#FF8C61] hover:underline text-lg font-medium"
                                            >
                                                6375636577
                                            </a>
                                        </div>
                                    </motion.div>

                                    {/* Email */}
                                    <motion.div
                                        className="flex items-start gap-4"
                                        whileHover={{ x: 4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#FF8C61] to-[#FFB347] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <Mail className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Us</h3>
                                            <a
                                                href="mailto:career@gyanitalk.com"
                                                className="text-[#FF6B35] dark:text-[#FF8C61] hover:underline text-lg font-medium"
                                            >
                                                career@gyanitalk.com
                                            </a>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Quick Info Cards */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { icon: MessageSquare, title: "24/7 Support", desc: "We're always here to help you" },
                                    { icon: CheckCircle, title: "Quick Response", desc: "Get answers within 24 hours" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6 cursor-pointer"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: i * 0.1 }}
                                        whileHover={{
                                            scale: 1.05,
                                            borderColor: "rgba(255, 107, 53, 0.5)",
                                            boxShadow: "0 10px 30px rgba(255, 107, 53, 0.2)"
                                        }}
                                    >
                                        <item.icon className="w-10 h-10 text-[#FF6B35] mb-3" />
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right Side - Contact Form */}
                        <motion.div
                            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-8 shadow-lg"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                Send us a Message
                            </h2>

                            {success && (
                                <motion.div
                                    className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-xl flex items-center gap-3"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <p className="text-sm text-green-800 dark:text-green-300">
                                        Thank you for contacting us! We'll get back to you soon.
                                    </p>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div
                                    className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Field */}
                                <div>
                                    <label htmlFor="contact_name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="contact_name"
                                        name="contact_name"
                                        value={formData.contact_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label htmlFor="contact_email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Your Email
                                    </label>
                                    <input
                                        type="email"
                                        id="contact_email"
                                        name="contact_email"
                                        value={formData.contact_email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                {/* Message Field */}
                                <div>
                                    <label htmlFor="contact_message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Your Message
                                    </label>
                                    <textarea
                                        id="contact_message"
                                        name="contact_message"
                                        value={formData.contact_message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        placeholder="Tell us how we can help you..."
                                    />
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
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