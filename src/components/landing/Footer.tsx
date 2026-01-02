"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Smartphone,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const zodiacSigns = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];

  return (
    <footer
      className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-black"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      {/* Top CTA Bar */}
      <div className="border-b border-gray-100 bg-orange-50/50 px-4 py-10 dark:border-gray-800 dark:bg-gray-900/20 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="hidden rounded-full bg-orange-100 p-3 text-[#FF6B35] dark:bg-gray-800 lg:block">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                100% Secure & Confidential
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                200,000+ Customers trust GyaniTalk for their astrological
                guidance.
              </p>
            </div>
          </div>
          <Link
            href="/talk-to-astrologers"
            className="group flex items-center gap-2 rounded-full bg-[#FF6B35] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-[#e05a2b] hover:shadow-orange-500/50"
          >
            Chat Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <div className="xl:grid xl:grid-cols-12 xl:gap-8">
          {/* Brand & Contact (Takes 4 columns on large screens) */}
          <div className="space-y-8 xl:col-span-4">
            <Link href="/" className="group flex w-fit items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl ring-1 ring-gray-200 transition-all duration-300 group-hover:ring-[#FF6B35]/50 dark:ring-gray-800">
                <Image
                  src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                  alt="Gyani Talk Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Gyani<span className="text-[#FF6B35]">Talk</span>
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500">
                  India's #1 Astro App
                </span>
              </div>
            </Link>

            <div className="space-y-4 rounded-2xl bg-gray-50 p-6 dark:bg-gray-900/50">
              <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#FF6B35]" />
                <address className="not-italic">
                  OSTWAL PLAZA, 1st Floor,
                  <br />
                  Shri Karniprakash Building,
                  <br />
                  Sundarwas, Udaipur,
                  <br />
                  Rajasthan 313001
                </address>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-5 w-5 shrink-0 text-[#FF6B35]" />
                <a
                  href="tel:+916375636577"
                  className="font-medium hover:text-[#FF6B35]"
                >
                  +91 6375636577
                </a>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-5 w-5 shrink-0 text-[#FF6B35]" />
                <a
                  href="mailto:career@gyanitalk.com"
                  className="font-medium hover:text-[#FF6B35]"
                >
                  career@gyanitalk.com
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              {[
                {
                  Icon: Instagram,
                  href: "https://www.instagram.com/gyanitalkapp/",
                },
                {
                  Icon: Facebook,
                  href: "https://www.facebook.com/gyanitalkapp/",
                },
                { Icon: Youtube, href: "https://youtube.com/@gyanitalkapp" },
                {
                  Icon: Linkedin,
                  href: "https://www.linkedin.com/company/gyanitalk/",
                },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-[#FF6B35] hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-[#FF6B35]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Section (Takes 8 columns on large screens) */}
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-8 xl:mt-0">
            {/* Column 1: Horoscopes */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Horoscopes
              </h3>
              <ul className="mt-4 space-y-2">
                {zodiacSigns.map((sign) => (
                  <li key={sign}>
                    <Link
                      href={`/horoscope/${sign.toLowerCase()}`}
                      className="text-sm text-gray-600 transition-colors hover:text-[#FF6B35] dark:text-gray-400 dark:hover:text-[#FF6B35]"
                    >
                      {sign}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Discover
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "Talk to Astrologer", href: "/talk-to-astrologers" },
                  {
                    label: "Chat with Astrologer",
                    href: "/talk-to-astrologers",
                  },
                  { label: "Astro Mall", href: "/mall" },
                  { label: "Astrology Blog", href: "/blog" },
                  { label: "Learn Astrology", href: "/courses" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-[#FF6B35] dark:text-gray-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Free Tools
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "Free Janam Kundali", href: "/free-kundali" },
                  { label: "Kundali Matching", href: "/kundali-matching" },
                  { label: "Today's Panchang", href: "/panchang" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-[#FF6B35] dark:text-gray-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Support */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Company
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "About Us", href: "/about-us" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Terms of Service", href: "/terms-of-service" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-[#FF6B35] dark:text-gray-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: App Download (Fills the right side!) */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Get the App
              </h3>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Talk to India's best astrologers anytime, anywhere.
              </p>

              <div className="mt-6 space-y-3">
                <button className="flex w-full items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-white transition-transform hover:scale-105 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="flex flex-col items-start text-xs leading-none">
                    <span className="font-light opacity-80">Get it on</span>
                    <span className="text-sm font-bold">Google Play</span>
                  </div>
                </button>
                <button className="flex w-full items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-white transition-transform hover:scale-105 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="flex flex-col items-start text-xs leading-none">
                    <span className="font-light opacity-80">
                      Download on the
                    </span>
                    <span className="text-sm font-bold">App Store</span>
                  </div>
                </button>
              </div>

              <div className="mt-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  We Accept
                </h3>
                <div className="mt-3 flex gap-2 text-gray-400">
                  <CreditCard className="h-6 w-6" />
                  <ShieldCheck className="h-6 w-6" />
                  {/* You can add real payment icons here later */}
                  <span className="text-xs font-medium">
                    VISA / UPI / RuPay
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-16 border-t border-gray-100 pt-8 dark:border-gray-800">
          <p className="text-justify text-xs leading-relaxed text-gray-500">
            <span className="font-semibold text-gray-900 dark:text-gray-300">
              Disclaimer:{" "}
            </span>
            GyaniTalk connects you with expert astrologers for guidance. Please
            note that astrology is a belief system and should not replace
            professional medical, legal, or financial advice. We do not
            guarantee specific results. By using GyaniTalk, you agree to our
            Terms of Service.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row">
          <p>&copy; {currentYear} GyaniTalk. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-[#FF6B35]">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-[#FF6B35]">
              Terms
            </Link>
            <Link href="/sitemap.xml" className="hover:text-[#FF6B35]">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
