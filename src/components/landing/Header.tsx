"use client";

import { Moon, Sun, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
    theme: string;
    toggleTheme: () => void;
    menuItems?: Array<{ label: string; href: string }>;
}

export default function Header({ theme, toggleTheme, menuItems }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    const defaultMenuItems = [
        { label: "Home", href: "/" },
        { label: "Astrologers", href: "/landing/astro" },
        { label: "Blog", href: "/landing/blog" },
        { label: "About", href: "/landing/about-us" },
        { label: "Contact", href: "/landing/contact" },
    ];
    const items = menuItems || defaultMenuItems;

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Check if current path matches menu item
    const isActive = (href: string) => {
        if (href === "/" && pathname === "/") return true;
        if (href !== "/" && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                        ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-gray-800"
                        : "bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900"
                    }`}
            >
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-[#FF6B35]/20 group-hover:ring-[#FF6B35]/40 transition-all">
                                <img
                                    src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                                    alt="Gyani Talk"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                Gyani<span className="text-[#FF6B35]">Talk</span>
                            </span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-1">
                            {items.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${active
                                                ? "bg-[#FF6B35] text-white shadow-sm"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-[#FF6B35] dark:hover:text-[#FF6B35]"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                                aria-label="Toggle theme"
                            >
                                {theme === "dark" ? (
                                    <Sun className="w-5 h-5 text-yellow-500" />
                                ) : (
                                    <Moon className="w-5 h-5 text-gray-700" />
                                )}
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                ) : (
                                    <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>

                    {/* Menu Panel */}
                    <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-xl animate-in slide-in-from-top duration-300">
                        <div className="max-w-7xl mx-auto px-4 py-4">
                            <div className="flex flex-col gap-1">
                                {items.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${active
                                                    ? "bg-[#FF6B35] text-white"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 active:bg-gray-200 dark:active:bg-gray-800"
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}