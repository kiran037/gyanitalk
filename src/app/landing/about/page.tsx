"use client";

import LandingWrapper from "@/components/landing/LandingWrapper";
import { Target, Users, Shield, Zap, Award, Heart, Globe, TrendingUp, CheckCircle, Sparkles } from "lucide-react";

export default function AboutPage() {
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
                            OUR STORY
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            <span className="text-gray-900 dark:text-white">About </span>
                            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Gyani Talk</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Bridging Ancient Wisdom with Modern Technology
                        </p>
                    </div>

                    {/* Main Content Image */}
                    <div className="relative mb-16 sm:mb-20">
                        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-3xl sm:rounded-[40px] overflow-hidden shadow-2xl">
                            <img
                                src="/landing/about1.jpg"
                                alt="Astrology and Technology"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Content Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
                        <div className="space-y-6">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                Who We Are
                            </h2>
                            <div className="space-y-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                <p>
                                    Gyanitalk is a pioneering astrology app brought to you by <span className="font-semibold text-[#FF6B35] dark:text-[#FF8C61]">GYANITALK TECHNOLOGIES (OPC) PRIVATE LIMITED</span>. Dedicated to merging ancient astrological practices with state-of-the-art technology, we deliver personalized solutions to users globally.
                                </p>
                                <p>
                                    Our platform facilitates connections with expert astrologers, enabling users to explore their horoscopes and gain accurate insights into their lives. By integrating cutting-edge features, Gyanitalk ensures a smooth, engaging, and secure experience for all.
                                </p>
                                <p>
                                    Recognizing the critical role of secure payment systems, we work with trusted payment gateway providers to deliver fast, reliable, and secure transactions. This partnership reflects our commitment to excellence in user satisfaction and operational integrity.
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative h-[400px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop"
                                    alt="Technology and Innovation"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/20 to-[#FFB347]/20"></div>
                            </div>
                        </div>
                    </div>

                    {/* Mission & Vision */}
                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-20">
                        {[
                            {
                                icon: Target,
                                title: "Our Mission",
                                desc: "To democratize access to authentic astrological guidance by connecting seekers with verified experts through an intuitive, secure, and technology-driven platform.",
                                gradient: "from-[#FF6B35] to-[#FF8C61]"
                            },
                            {
                                icon: Globe,
                                title: "Our Vision",
                                desc: "To become the world's most trusted astrology platform, empowering millions to make informed life decisions through personalized cosmic insights and spiritual wisdom.",
                                gradient: "from-[#FFB347] to-[#FFCC80]"
                            }
                        ].map((item, i) => (
                            <div key={i} className="group p-8 sm:p-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <item.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Core Values */}
                    <div className="mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Our Core Values
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                The principles that guide everything we do
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: Shield, title: "Trust & Security", desc: "Your privacy and data security are our top priorities" },
                                { icon: Award, title: "Excellence", desc: "Only verified expert astrologers on our platform" },
                                { icon: Heart, title: "Empathy", desc: "Understanding and addressing your spiritual needs" },
                                { icon: Zap, title: "Innovation", desc: "Continuously improving with cutting-edge technology" }
                            ].map((value, i) => (
                                <div key={i} className="p-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all shadow-md hover:shadow-lg group">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35]/20 to-[#FFB347]/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-[#FF6B35] group-hover:to-[#FF8C61] transition-all">
                                        <value.icon className="w-6 h-6 text-[#FF6B35] dark:text-[#FF8C61] group-hover:text-white transition-colors" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{value.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Why Choose Us */}
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
                        <div className="relative order-2 lg:order-1">
                            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop"
                                    alt="Expert Consultation"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/20 to-[#FFB347]/20"></div>
                            </div>
                        </div>

                        <div className="space-y-6 order-1 lg:order-2">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                Why Choose Gyani Talk?
                            </h2>
                            <div className="space-y-4">
                                {[
                                    "100+ verified expert astrologers available 24/7",
                                    "Secure payment gateway with multiple payment options",
                                    "Personalized horoscope readings and predictions",
                                    "Free initial consultation for new users",
                                    "Multi-language support for global accessibility",
                                    "Advanced technology ensuring seamless experience"
                                ].map((feature, i) => (
                                    <div key={i} className="flex gap-3 items-start p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all">
                                        <CheckCircle className="w-6 h-6 text-[#FF6B35] dark:text-[#FF8C61] flex-shrink-0 mt-0.5" />
                                        <p className="text-gray-700 dark:text-gray-300">{feature}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl sm:rounded-[40px] p-8 sm:p-12 shadow-2xl mb-20">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: Users, value: "50K+", label: "Active Users" },
                                { icon: Award, value: "100+", label: "Expert Astrologers" },
                                { icon: Shield, value: "99.9%", label: "Secure Transactions" },
                                { icon: TrendingUp, value: "4.2★", label: "App Rating" }
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-2xl flex items-center justify-center shadow-lg">
                                            <stat.icon className="w-7 h-7 text-white" />
                                        </div>
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent mb-2">{stat.value}</div>
                                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Registered Address Section */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-3xl p-8 sm:p-10 shadow-lg">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl flex items-center justify-center">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            Registered Address
                        </h3>
                        <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
                            <p className="font-semibold text-[#FF6B35] dark:text-[#FF8C61]">GYANITALK TECHNOLOGIES (OPC) PRIVATE LIMITED</p>
                            <p>114 Ostwal Plaza 2, (M CL) Sunderwas</p>
                            <p>Udaipur City, Udaipur, Girwa</p>
                            <p>Rajasthan, India - 313001</p>
                        </div>
                    </div>
                </div>
            </section>
        </LandingWrapper>
    );
}