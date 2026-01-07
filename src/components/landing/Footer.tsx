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
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];

  return (
    <footer
      className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-black"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      {/* Top CTA Bar - Mobile Friendly */}
      <div className="border-b border-gray-100 bg-orange-50/50 px-4 py-8 dark:border-gray-800 dark:bg-gray-900/20 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-6 text-center sm:gap-8 lg:flex-row lg:justify-between lg:text-left">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-[#FF6B35] dark:bg-gray-800 lg:h-14 lg:w-14">
                <ShieldCheck className="h-7 w-7 lg:h-8 lg:w-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                  100% Secure & Confidential
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  200,000+ Customers trust GyaniTalk
                </p>
              </div>
            </div>

            <Link
              href="/talk-to-astrologers"
              className="group flex items-center gap-2 rounded-full bg-[#FF6B35] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#e05a2b] active:scale-95 sm:px-8 sm:text-base"
            >
              Chat Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          
          {/* Brand, Govt Recognition, Contact & Social - Full width on mobile, 5 cols on lg */}
          <div className="space-y-8 lg:col-span-5">
            
            {/* Logo */}
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl ring-1 ring-gray-200 transition-all group-hover:ring-[#FF6B35]/50 dark:ring-gray-800 sm:h-14 sm:w-14">
                <Image
                  src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                  alt="Gyani Talk Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                  Gyani<span className="text-[#FF6B35]">Talk</span>
                </span>
                <p className="mt-1 text-[9px] font-medium uppercase tracking-wider text-gray-500 sm:text-[10px]">
                  India's First Trusted Astrology Platform
                </p>
              </div>
            </Link>

            {/* Govt Recognition - Compact on mobile */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Recognized by
              </p>
              <div className="mt-4 flex items-center justify-center gap-6 sm:gap-8">
                <div className="relative h-14 w-28 sm:h-16 sm:w-32">
                  <Image
                    src="/footer/istart.jpg"
                    alt="iStart Rajasthan"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                  <Image
                    src="/footer/doitc.png"
                    alt="DOITC"
                    fill
                    className="object-contain drop-shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="space-y-4 rounded-2xl bg-gray-50 p-5 dark:bg-gray-900/50 sm:p-6">
              <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6B35]" />
                <address className="not-italic text-sm leading-relaxed">
                  OSTWAL PLAZA, 1st Floor,
                  <br />
                  Sundarwas, Udaipur,
                  <br />
                  Rajasthan 313001
                </address>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-5 w-5 shrink-0 text-[#FF6B35]" />
                <a href="tel:+916375636577" className="font-medium hover:text-[#FF6B35]">
                  +91 6375636577
                </a>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-5 w-5 shrink-0 text-[#FF6B35]" />
                <a href="mailto:contact@gyanitalk.com" className="font-medium hover:text-[#FF6B35]">
                  contact@gyanitalk.com
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { Icon: Instagram, href: "https://www.instagram.com/gyanitalkapp/" },
                { Icon: Facebook, href: "https://www.facebook.com/gyanitalkapp/" },
                { Icon: Youtube, href: "https://youtube.com/@gyanitalkapp" },
                { Icon: Linkedin, href: "https://www.linkedin.com/company/gyanitalk/" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-[#FF6B35] hover:text-white dark:bg-gray-800 dark:text-gray-400"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Section - Stacks nicely on mobile */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-4">
            
            {/* Horoscopes */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Horoscopes
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                {zodiacSigns.map((sign) => (
                  <li key={sign}>
                    <Link
                      href={`/horoscope/${sign.toLowerCase()}`}
                      className="text-gray-600 hover:text-[#FF6B35] dark:text-gray-400"
                    >
                      {sign}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Discover & Free Tools */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Discover
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Talk to Astrologer",
                  "Chat with Astrologer",
                  "Astro Mall",
                  "Astrology Blog",
                  "Learn Astrology",
                ].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase().replace(/ /g, "-")}`} className="text-gray-600 hover:text-[#FF6B35] dark:text-gray-400">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Free Tools
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {["Free Janam Kundali", "Kundali Matching", "Today's Panchang"].map((tool) => (
                  <li key={tool}>
                    <Link href={`/${tool.toLowerCase().replace(/ /g, "-")}`} className="text-gray-600 hover:text-[#FF6B35] dark:text-gray-400">
                      {tool}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Company
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {["About Us", "Contact Us", "Privacy Policy", "Terms of Service"].map((link) => (
                  <li key={link}>
                    <Link href={`/${link.toLowerCase().replace(/ /g, "-")}`} className="text-gray-600 hover:text-[#FF6B35] dark:text-gray-400">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* App Download & Payment */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Get the App
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Talk to India's best astrologers anytime.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <a
                  href="https://play.google.com/store/apps/details?id=com.app.gyanitalk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-black px-4 py-3 text-white transition-transform hover:scale-105 dark:bg-white dark:text-black"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Get it on</div>
                    <div className="font-bold">Google Play</div>
                  </div>
                </a>

                <a
                  href="https://apps.apple.com/in/app/gyanitalk/id6742021396"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-black px-4 py-3 text-white transition-transform hover:scale-105 dark:bg-white dark:text-black"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Download on the</div>
                    <div className="font-bold">App Store</div>
                  </div>
                </a>
              </div>

              <div className="mt-8 flex items-center gap-3 text-gray-500">
                <CreditCard className="h-6 w-6" />
                <ShieldCheck className="h-6 w-6" />
                <span className="text-xs font-medium">VISA / UPI / RuPay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 border-t border-gray-100 pt-8 text-center dark:border-gray-800">
          <p className="text-xs leading-relaxed text-gray-500">
            <span className="font-semibold text-gray-900 dark:text-gray-300">Disclaimer: </span>
            GyaniTalk connects you with expert astrologers for guidance. Astrology is for entertainment purposes and should not replace professional advice.
          </p>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 flex flex-col items-center gap-4 border-t border-gray-100 pt-8 text-center text-sm text-gray-500 dark:border-gray-800 sm:flex-row sm:justify-between">
          <p>&copy; {currentYear} GyaniTalk. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy-policy" className="hover:text-[#FF6B35]">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-[#FF6B35]">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-[#FF6B35]">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}