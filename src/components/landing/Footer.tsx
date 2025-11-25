"use client";

import Link from "next/link";
import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
            {/* Main Footer Content */}
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-3 group">
                            <div className="w-7 h-7 rounded-lg overflow-hidden ring-2 ring-[#FF6B35]/20 group-hover:ring-[#FF6B35]/40 transition-all">
                                <img
                                    src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                                    alt="Gyani Talk"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-base font-bold text-gray-900 dark:text-white">
                                Gyani Talk
                            </span>
                        </Link>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            Your trusted platform for astrology guidance.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-2">
                            <a
                                href="https://www.instagram.com/gyanitalkapp/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-100 dark:bg-gray-900 hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] text-gray-600 dark:text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-3.5 h-3.5" />
                            </a>
                            <a
                                href="https://www.facebook.com/gyanitalkapp/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-100 dark:bg-gray-900 hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] text-gray-600 dark:text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-3.5 h-3.5" />
                            </a>
                            <a
                                href="https://youtube.com/@gyanitalkapp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-100 dark:bg-gray-900 hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] text-gray-600 dark:text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all"
                                aria-label="YouTube"
                            >
                                <Youtube className="w-3.5 h-3.5" />
                            </a>
                            <a
                                href="https://www.linkedin.com/company/gyanitalk/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-100 dark:bg-gray-900 hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] text-gray-600 dark:text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-900 dark:text-white mb-3">
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            {[
                                { label: "Blog", href: "/landing/blog" },
                                { label: "Astrologers", href: "/landing/astro" },
                                { label: "Contact", href: "/landing/contact" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-900 dark:text-white mb-3">
                            Legal
                        </h3>
                        <ul className="space-y-2">
                            {[
                                { label: "About Us", href: "/landing/about-us" },
                                { label: "Privacy Policy", href: "/landing/privacy-policy" },
                                { label: "Terms of Service", href: "/landing/terms-of-service" }
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            © {currentYear} Gyani Talk. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Made with <span className="text-[#FF6B35]">❤️</span> for spiritual seekers
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}