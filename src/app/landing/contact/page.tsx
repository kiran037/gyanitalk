"use client";

import { useState } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { MapPin, Phone, Mail, Send, MessageSquare, CheckCircle, Sparkles } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        contact_name: "",
        contact_email: "",
        contact_message: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

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
            <section className="pt-32 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute top-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-20 -right-20 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-[#FFB347]/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{animationDelay: '1s'}}></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-12 sm:mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 text-[#FF6B35] dark:text-[#FF8C61] rounded-full text-sm font-semibold mb-6 shadow-lg">
                            <Sparkles className="w-4 h-4" />
                            GET IN TOUCH
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Contact Us</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Have any questions? We are happy to help. Tell us your issue and we will get back to you at the earliest.
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Left Side - Contact Information */}
                        <div className="space-y-8">
                            {/* Company Info */}
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                    Gyani Talk
                                </h2>
                                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                    Consult Online Astrologers Anytime
                                </p>

                                <div className="space-y-6">
                                    {/* Address */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <MapPin className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Our Office</h3>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                OSTWAL PLAZA, 1ST FLOOR<br />
                                                SHRI KARNIPRAKASH BUILDING<br />
                                                ABOVE CENTRAL BANK OF INDIA<br />
                                                OPP, Airport Rd, Sundarwas<br />
                                                Udaipur, Rajasthan 313001
                                            </p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-start gap-4">
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
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-start gap-4">
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
                                    </div>
                                </div>
                            </div>

                            {/* Quick Info Cards */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-md">
                                    <MessageSquare className="w-10 h-10 text-[#FF6B35] dark:text-[#FF8C61] mb-3" />
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">24/7 Support</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">We're always here to help you</p>
                                </div>
                                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-md">
                                    <CheckCircle className="w-10 h-10 text-[#FF6B35] dark:text-[#FF8C61] mb-3" />
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Quick Response</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Get answers within 24 hours</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Contact Form */}
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-lg">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                Send us a Message
                            </h2>

                            {success && (
                                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <p className="text-sm text-green-800 dark:text-green-300">
                                        Thank you for contacting us! We'll get back to you soon.
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
                                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                                </div>
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
                                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
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
                                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
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
                                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white"
                                        placeholder="Tell us how we can help you..."
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#FF5722] hover:to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-[#FF6B35]/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </LandingWrapper>
    );
}