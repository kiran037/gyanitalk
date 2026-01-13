"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Instagram, Facebook, Youtube, Linkedin, Mail, MapPin, Phone,
  ArrowRight, ShieldCheck, ChevronDown, CreditCard
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // State for mobile accordions
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];

  const socialLinks = [
    { Icon: Instagram, href: "https://www.instagram.com/gyanitalkapp/" },
    { Icon: Facebook, href: "https://www.facebook.com/gyanitalkapp/" },
    { Icon: Youtube, href: "https://youtube.com/@gyanitalkapp" },
    { Icon: Linkedin, href: "https://www.linkedin.com/company/gyanitalk/" },
  ];

  return (
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 pb-6 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* 1. Brand Identity & Contact */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-start justify-between lg:block">
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-2.5">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg ring-1 ring-gray-100 dark:ring-white/10">
                        <Image
                        src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                        alt="Logo"
                        fill
                        className="object-cover"
                        />
                    </div>
                    <div>
                        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                        Gyani<span className="text-[#FF6B35]">Talk</span>
                        </span>
                        <p className="text-[9px] uppercase tracking-wide text-gray-500">Trusted Astrology</p>
                    </div>
                </Link>

                {/* Socials (Mobile: Right aligned) */}
                <div className="flex lg:hidden gap-2">
                    {socialLinks.slice(0, 3).map(({ Icon, href }, i) => (
                        <a key={i} href={href} className="p-2 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
                            <Icon className="h-4 w-4" />
                        </a>
                    ))}
                </div>
            </div>

            {/* Govt Logos */}
            <div className="flex items-center gap-4 py-3 border-y border-gray-50 dark:border-white/5 lg:border-none lg:py-0">
                <span className="text-[10px] font-bold uppercase text-gray-400 lg:hidden">Supported By</span>
                <div className="flex items-center gap-4 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
                    <div className="relative h-8 w-20">
                        <Image src="/footer/istart.jpg" alt="iStart" fill className="object-contain" />
                    </div>
                    <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />
                    <div className="relative h-8 w-16">
                        <Image src="/footer/doitc.png" alt="DOITC" fill className="object-contain" />
                    </div>
                </div>
            </div>

            {/* Desktop Contact Info */}
            <div className="hidden lg:block space-y-3">
                <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B35]" />
                    <address className="not-italic text-xs leading-relaxed">
                    OSTWAL PLAZA, 1st Floor, Sundarwas,<br />Udaipur, Rajasthan 313001
                    </address>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4 shrink-0 text-[#FF6B35]" />
                    <span className="text-xs">+91 6375636577</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4 shrink-0 text-[#FF6B35]" />
                    <span className="text-xs">contact@gyanitalk.com</span>
                </div>
            </div>
          </div>

          {/* 2. Links Section */}
          <div className="lg:col-span-8 grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-8">
            
            {/* Horoscopes - 2 Columns on Desktop */}
            <div className="border-b border-gray-100 dark:border-white/5 lg:border-none">
                <button 
                    onClick={() => toggleSection('horoscope')}
                    className="flex items-center justify-between w-full py-3 lg:py-0 lg:cursor-default"
                >
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Horoscopes</h3>
                    <ChevronDown className={`h-4 w-4 text-gray-400 lg:hidden transition-transform ${openSection === 'horoscope' ? 'rotate-180' : ''}`} />
                </button>
                {/* Logic: Hidden if closed on mobile, Always Block on LG */}
                <div className={`${openSection === 'horoscope' ? 'block' : 'hidden'} lg:block pb-4 lg:pb-0 lg:mt-4`}>
                    {/* lg:grid-cols-2 makes it 2 columns on desktop */}
                    <ul className="grid grid-cols-2 lg:grid-cols-2 gap-x-4 gap-y-2">
                        {zodiacSigns.map((sign) => (
                            <li key={sign}>
                                <Link href={`/horoscope/${sign.toLowerCase()}`} className="text-xs text-gray-500 hover:text-[#FF6B35] dark:text-gray-400">
                                    {sign}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Discover */}
            <div className="border-b border-gray-100 dark:border-white/5 lg:border-none">
                <button onClick={() => toggleSection('discover')} className="flex items-center justify-between w-full py-3 lg:py-0 lg:cursor-default">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Discover</h3>
                    <ChevronDown className={`h-4 w-4 text-gray-400 lg:hidden transition-transform ${openSection === 'discover' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`${openSection === 'discover' ? 'block' : 'hidden'} lg:block pb-4 lg:pb-0 lg:mt-4`}>
                    <ul className="space-y-2.5">
                        {["Talk to Astrologer", "Chat with Astrologer", "Astro Mall", "Kundali Matching", "Panchang"].map((item) => (
                            <li key={item}>
                                <Link href={`/${item.toLowerCase().replace(/ /g, "-")}`} className="text-xs text-gray-500 hover:text-[#FF6B35] dark:text-gray-400 block">
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Company */}
            <div className="border-b border-gray-100 dark:border-white/5 lg:border-none">
                <button onClick={() => toggleSection('company')} className="flex items-center justify-between w-full py-3 lg:py-0 lg:cursor-default">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Company</h3>
                    <ChevronDown className={`h-4 w-4 text-gray-400 lg:hidden transition-transform ${openSection === 'company' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`${openSection === 'company' ? 'block' : 'hidden'} lg:block pb-4 lg:pb-0 lg:mt-4`}>
                    <ul className="space-y-2.5">
                        {["About Us", "Contact Us", "Privacy Policy", "Terms of Service"].map((link) => (
                            <li key={link}>
                                <Link href={`/${link.toLowerCase().replace(/ /g, "-")}`} className="text-xs text-gray-500 hover:text-[#FF6B35] dark:text-gray-400 block">
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Download App */}
            <div className="pt-6 lg:pt-0">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4">Get the App</h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                    <a href="https://play.google.com/store/apps/details?id=com.app.gyanitalk" target="_blank" className="flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity">
                         <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" /></svg>
                         <div className="leading-none">
                            <div className="text-[9px] opacity-70">Get it on</div>
                            <div className="text-xs font-bold">Google Play</div>
                         </div>
                    </a>
                    <a href="https://apps.apple.com/in/app/gyanitalk/id6742021396" target="_blank" className="flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity">
                        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                        <div className="leading-none">
                            <div className="text-[9px] opacity-70">Download on</div>
                            <div className="text-xs font-bold">App Store</div>
                        </div>
                    </a>
                </div>
            </div>

          </div>
        </div>

        {/* 3. Footer Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
            <p className="text-[10px] text-gray-400 text-center mb-4 leading-relaxed max-w-2xl mx-auto">
                <span className="font-bold text-gray-500">Disclaimer:</span> GyaniTalk connects you with experts. Astrology is for entertainment and guidance purposes only.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-gray-500 uppercase tracking-wide">
                <p>&copy; {currentYear} GyaniTalk. All rights reserved.</p>
                <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Secure Payments</span>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
}