"use client";

import { Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
    theme: string;
    toggleTheme: () => void;
    menuItems?: Array<{ label: string; href: string }>;
}

export default function Header({ theme, toggleTheme, menuItems }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const defaultMenuItems = [
        { label: "Home", href: "/" },
        { label: "About", href: "/landing/about" },
        { label: "Contact", href: "/landing/contact" },
        { label: "Blog", href: "/landing/blog" }
    ];

    const items = menuItems || defaultMenuItems;

    return (
        <>
            <nav className="fixed top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-[#FF6B35]/10 rounded-2xl sm:rounded-3xl transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        {/* Logo */}
                        <a href="/" className="flex items-center gap-2 cursor-pointer">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-[#FF6B35]/30 shadow-lg">
                                <img
                                    src="https://gyanitalk.com/public/storage/images/astrologer_7851728112667.png"
                                    alt="Gyani Talk"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                Gyani Talk
                            </span>
                        </a>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-6 lg:gap-8">
                            {items.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="font-medium text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] dark:hover:text-[#FF8C61] transition-colors relative group"
                                >
                                    {item.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] group-hover:w-full transition-all duration-300"></span>
                                </a>
                            ))}
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                aria-label="Toggle theme"
                            >
                                {theme === "dark" ? (
                                    <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                                ) : (
                                    <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                                )}
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 transition-all"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                ) : (
                                    <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                )}
                            </button>

                            {/* Sign In Button */}
                            <a
                                href="/sign-in"
                                className="hidden sm:block px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#FF5722] hover:to-[#FF6B35] text-white font-semibold rounded-full hover:shadow-2xl hover:shadow-[#FF6B35]/50 hover:scale-105 transition-all duration-300"
                            >
                                Sign In
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>
                    
                    {/* Menu Panel */}
                    <div className="absolute top-20 left-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl p-6 animate-in slide-in-from-top">
                        <div className="flex flex-col gap-4">
                            {items.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="font-medium text-lg text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] dark:hover:text-[#FF8C61] transition-colors py-2 px-4 rounded-xl hover:bg-orange-50 dark:hover:bg-gray-800"
                                >
                                    {item.label}
                                </a>
                            ))}
                            <a
                                href="/sign-in"
                                onClick={() => setMobileMenuOpen(false)}
                                className="mt-2 px-6 py-3 text-center bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white font-semibold rounded-full shadow-lg"
                            >
                                Sign In
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}