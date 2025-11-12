"use client";

import LandingWrapper from "@/components/landing/LandingWrapper";
import { Zap, Wallet, Star, Shield, Clock, Users, ChevronRight, Sparkles } from "lucide-react";

export default function HomePage() {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <LandingWrapper>
            {/* Hero Section */}
            <section id="hero" className="min-h-screen pt-24 sm:pt-28 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute top-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-20 -right-20 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-[#FFB347]/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 text-[#FF6B35] dark:text-[#FF8C61] rounded-full text-sm font-semibold shadow-lg">
                                <Sparkles className="w-4 h-4" />
                                E-platform for astrology
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                    The Easiest Way
                                </span>
                                <br />
                                <span className="text-gray-900 dark:text-white">to Connect with</span>
                                <br />
                                <span className="text-gray-900 dark:text-white">Astrologers</span>
                            </h1>

                            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Enjoy a Free Astrology Session. Get started with a free chat or call with a verified astrologer. No strings attached!
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-4 max-w-lg mx-auto lg:mx-0">
                                {[
                                    { value: "50K+", label: "Active Users" },
                                    { value: "100+", label: "Astrologers" },
                                    { value: "4.2★", label: "App Rating" }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-2xl p-3 sm:p-4 shadow-lg">
                                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">{stat.value}</div>
                                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Download Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 max-w-lg mx-auto lg:mx-0">
                                {/* App Store Button */}
                                <a
                                    href="https://apps.apple.com/in/app/gyanitalk/id6742021396"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 px-5 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/30 dark:border-gray-700/30 text-gray-900 dark:text-white rounded-2xl hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                    </svg>
                                    <div className="text-left">
                                        <div className="text-xs opacity-70">Download on</div>
                                        <div className="text-sm sm:text-base font-semibold">App Store</div>
                                    </div>
                                </a>

                                {/* Google Play Button */}
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.app.gyanitalk&pcampaignid=web_share"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 px-5 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/30 dark:border-gray-700/30 text-gray-900 dark:text-white rounded-2xl hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                    </svg>
                                    <div className="text-left">
                                        <div className="text-xs opacity-70">Get it on</div>
                                        <div className="text-sm sm:text-base font-semibold">Google Play</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Right Phone Mockup */}
                        <div className="relative flex justify-center mt-8 lg:mt-0">
                            <div className="relative w-[280px] sm:w-[320px] h-[560px] sm:h-[640px] bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-[40px] sm:rounded-[50px] p-2.5 sm:p-3 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[32px] sm:rounded-[42px] overflow-hidden">
                                    <img
                                        src="/landing/bannerlight.jpeg"
                                        alt="App Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Floating notification cards */}
                                <div className="absolute -left-4 sm:-left-6 top-24 sm:top-32 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl animate-float">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-full flex items-center justify-center shadow-lg">
                                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">New Reading</div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">Tarot Available</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -right-4 sm:-right-6 bottom-32 sm:bottom-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl animate-float-delayed">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FFB347] to-[#FFCC80] rounded-full flex items-center justify-center shadow-lg">
                                            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Sign-up Bonus</div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">₹51</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 text-[#FF6B35] dark:text-[#FF8C61] rounded-full text-sm font-semibold mb-4 shadow-lg">
                            <Zap className="w-4 h-4" />
                            POWERFUL FEATURES
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Everything You Need
                            <br />
                            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">In One App</span>
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Seamlessly manage your spiritual journey with our comprehensive platform
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[
                            {
                                icon: Zap,
                                title: "Instant Payments",
                                desc: "Lightning-fast transactions with secure payment gateway.",
                                color: "from-[#FF6B35] to-[#FF8C61]"
                            },
                            {
                                icon: Wallet,
                                title: "Digital Wallet",
                                desc: "Manage your balance effortlessly and track transactions.",
                                color: "from-[#FFB347] to-[#FFCC80]"
                            },
                            {
                                icon: Star,
                                title: "Expert Astrologers",
                                desc: "Connect with verified experts for personalized readings.",
                                color: "from-[#FF6B35] to-[#FFB347]"
                            },
                            {
                                icon: Shield,
                                title: "Bank-Level Security",
                                desc: "Military-grade encryption protects your data.",
                                color: "from-[#FF8C61] to-[#FFB347]"
                            },
                            {
                                icon: Clock,
                                title: "24/7 Availability",
                                desc: "Access services anytime, anywhere you need.",
                                color: "from-[#FFCC80] to-[#FF8C61]"
                            },
                            {
                                icon: Users,
                                title: "Activity Tracking",
                                desc: "Monitor spending patterns and consultation history.",
                                color: "from-[#FFB347] to-[#FF6B35]"
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group p-5 sm:p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 text-[#FF6B35] dark:text-[#FF8C61] rounded-full text-sm font-semibold shadow-lg">
                                <Users className="w-4 h-4" />
                                TRUSTED BY THOUSANDS
                            </div>

                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                                Why People Love
                                <br />
                                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Gyani Talk</span>
                            </h2>

                            <div className="space-y-4 sm:space-y-5">
                                {[
                                    { title: "Verified Experts", desc: "Thoroughly vetted certified professionals" },
                                    { title: "Transparent Pricing", desc: "No hidden fees, clear pricing" },
                                    { title: "Instant Consultations", desc: "Connect immediately without waiting" },
                                    { title: "Multilingual Support", desc: "Communicate in your language" },
                                ].map((benefit, i) => (
                                    <div key={i} className="flex gap-3 sm:gap-4 items-start group cursor-pointer p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl sm:rounded-2xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all shadow-md hover:shadow-lg">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B35]/20 to-[#FFB347]/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-[#FF6B35] group-hover:to-[#FF8C61] transition-all shadow-md">
                                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF6B35] dark:text-[#FF8C61] group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">{benefit.title}</h4>
                                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative order-1 lg:order-2">
                            <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                {[
                                    { value: "50K+", label: "Happy Users", icon: Users },
                                    { value: "100+", label: "Astrologers", icon: Star },
                                    { value: "99.9%", label: "Uptime", icon: Shield },
                                    { value: "24/7", label: "Support", icon: Clock },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                        <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-[#FF6B35] dark:text-[#FF8C61] mb-3 sm:mb-4" />
                                        <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent mb-2">{stat.value}</div>
                                        <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </LandingWrapper>
    );
}