"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800"
      aria-label="Footer">

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
          {/* Brand Section */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-[#FF6B35]/20 group-hover:ring-[#FF6B35]/40 transition-all">
                <Image
                  src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                  alt="Gyani Talk"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                Gyani Talk
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed max-w-xs">
              Your trusted platform for astrology guidance.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {[
                {
                  href: "https://www.instagram.com/gyanitalkapp/",
                  label: "Instagram",
                  Icon: Instagram,
                },
                {
                  href: "https://www.facebook.com/gyanitalkapp/",
                  label: "Facebook",
                  Icon: Facebook,
                },
                {
                  href: "https://youtube.com/@gyanitalkapp",
                  label: "YouTube",
                  Icon: Youtube,
                },
                {
                  href: "https://www.linkedin.com/company/gyanitalk/",
                  label: "LinkedIn",
                  Icon: Linkedin,
                },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-8 sm:h-8 bg-gray-100 dark:bg-gray-900 hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] text-gray-600 dark:text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all"
                  aria-label={label}
                >
                  <Icon
                    className="w-4 h-4"
                    aria-hidden="true"
                    focusable="false"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-[11px] sm:text-xs uppercase tracking-wider text-gray-900 dark:text-white mb-3">
              Quick Links
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                { label: "Blog", href: "/blog" },
                { label: "Astrologers", href: "/talk-to-astrologers" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-[11px] sm:text-xs uppercase tracking-wider text-gray-900 dark:text-white mb-3">
              Legal
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                { label: "About Us", href: "/about-us" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms-of-service" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] transition-colors"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
            <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
              © {currentYear} Gyani Talk. All rights reserved.
            </p>
            <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
              Made with{" "}
              <span
                className="text-[#FF6B35]"
                role="img"
                aria-label="love"
              >
                ❤️
              </span>{" "}
              for spiritual seekers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}