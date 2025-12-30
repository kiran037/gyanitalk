"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  ExternalLink,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-black"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand & Social Section */}
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="group flex w-fit items-center gap-2.5">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-gray-200 transition-all duration-300 group-hover:ring-[#FF6B35]/50 dark:ring-gray-800">
                <Image
                  src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                  alt="Gyani Talk Logo"
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Gyani<span className="text-[#FF6B35]">Talk</span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-6 text-gray-600 dark:text-gray-400">
              Your trusted companion for astrological guidance and spiritual
              growth. Connect with expert astrologers and discover your cosmic
              path.
            </p>

            <div className="flex gap-4">
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
                  className="group flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-all duration-300 hover:bg-[#FF6B35] hover:text-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-[#FF6B35] dark:hover:text-white"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Section - Responsive Grid */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-3 md:gap-8">
              {/* Column 1: Quick Links */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                  Discover
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {[
                    {
                      label: "Talk to Astrologers",
                      href: "/talk-to-astrologers",
                    },
                    { label: "Read Blog", href: "/blog" },
                    { label: "Contact Support", href: "/contact" },
                    { label: "Courses", href: "/courses" },
                    { label: "Mall", href: "/mall" },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="group flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-[#FF6B35] dark:text-gray-400 dark:hover:text-[#FF6B35]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Legal (Hidden on mobile grid-cols-2, shown in md grid) */}
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                 Service
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {[
                    { label: "Free Kundali", href: "/free-kundali" },
                    { label: "Kundali Matching", href: "/kundali-matching" },
                    { label: "Horoscope", href: "/horoscope" },
                    { label: "Panchang", href: "/panchang" },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-gray-600 transition-colors hover:text-[#FF6B35] dark:text-gray-400 dark:hover:text-[#FF6B35]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                   Company
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {[
                    { label: "About Us", href: "/about-us" },
                    { label: "Terms of Service", href: "/terms-of-service" },
                    { label: "Privacy Policy", href: "/privacy-policy" },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-gray-600 transition-colors hover:text-[#FF6B35] dark:text-gray-400 dark:hover:text-[#FF6B35]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 sm:text-left">
              &copy; {currentYear} Gyani Talk. All rights reserved.
            </p>

            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span>Made with</span>
              <span className="animate-pulse text-red-500">❤️</span>
              <span>for spiritual seekers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
