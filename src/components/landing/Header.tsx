// // "use client";

// import { Moon, Sun, Menu, X } from "lucide-react";
// import { useState, useEffect, useMemo } from "react";
// import { usePathname } from "next/navigation";
// import Link from "next/link";

// interface HeaderProps {
//   theme: string;
//   toggleTheme: () => void;
//   menuItems?: Array<{
//     label: string;
//     href?: string; // optional for dropdown parent
//     children?: { label: string; href: string }[];
//   }>;
// }

// export default function Header({ theme, toggleTheme, menuItems }: HeaderProps) {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const pathname = usePathname();

//   const items = useMemo(
//     () =>
//       menuItems || [
//         { label: "Home", href: "/" },
//         { label: "Astrologers", href: "/talk-to-astrologers" },
//         { label: "Horoscope", href: "/horoscope" },
//         {
//           label: "Kundli",
//           children: [
//             { label: "Free Kundali", href: "/free-kundali" },
//             { label: "Kundali Matching", href: "/kundali-matching" },
//           ],
//         },
//         { label: "Panchang", href: "/panchang" },
//         { label: "Mall", href: "/mall" },
//         { label: "Courses", href: "/courses" },
//         { label: "Blog", href: "/blog" },
//         { label: "About", href: "/about-us" },
//         { label: "Contact", href: "/contact" },
//       ],
//     [menuItems],
//   );

//   // Handle scroll effect (throttled with rAF)
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     let ticking = false;

//     const handleScroll = () => {
//       if (!ticking) {
//         window.requestAnimationFrame(() => {
//           setScrolled(window.scrollY > 20);
//           ticking = false;
//         });
//         ticking = true;
//       }
//     };

//     handleScroll(); // initial
//     window.addEventListener("scroll", handleScroll, { passive: true });

//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Close mobile menu when route changes
//   useEffect(() => {
//     setMobileMenuOpen(false);
//   }, [pathname]);

//   // Check if current path matches menu item
//   const isActive = (href: string) => {
//     if (href === "/" && pathname === "/") return true;
//     if (href !== "/" && pathname.startsWith(href)) return true;
//     return false;
//   };

//   return (
//     <>
//       <nav
//         aria-label="Main navigation"
//         className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
//           scrolled
//             ? "border-b border-gray-200 bg-white/90 shadow-lg backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90"
//             : "border-b border-gray-100 bg-white dark:border-gray-900 dark:bg-gray-950"
//         }`}
//       >
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="flex h-16 items-center justify-between gap-3">
//             {/* Logo */}
//             <Link href="/" className="group flex min-w-0 items-center gap-2">
//               <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg ring-2 ring-[#FF6B35]/20 transition-all group-hover:ring-[#FF6B35]/40">
//                 <img
//                   src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
//                   alt="Gyani Talk"
//                   className="h-full w-full object-cover"
//                   decoding="async"
//                 />
//               </div>
//               <span className="truncate text-base font-bold text-gray-900 dark:text-white sm:text-lg">
//                 Gyani<span className="text-[#FF6B35]">Talk</span>
//               </span>
//             </Link>

//             {/* Desktop Menu */}
//             <div className="hidden items-center gap-1.5 md:flex lg:gap-2">
//               {items.map((item) => {
//                 // DROPDOWN ITEM
//                 if (item.children) {
//                   return (
//                     <div key={item.label} className="group relative">
//                       {/* Parent */}
//                       <div className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-[#FF6B35] dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-[#FF6B35]">
//                         {item.label}
//                       </div>

//                       {/* Dropdown */}
//                       <div className="pointer-events-auto absolute left-0 top-full z-50 hidden min-w-[200px] pt-2 group-hover:block">
//                         <div className="rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950">
//                           <div className="flex flex-col p-2">
//                             {item.children.map((child) => (
//                               <Link
//                                 key={child.href}
//                                 href={child.href}
//                                 className="rounded-lg px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-[#FF6B35] dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-[#FF6B35]"
//                               >
//                                 {child.label}
//                               </Link>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 }

//                 // NORMAL LINK
//                 const active = isActive(item.href!);
//                 return (
//                   <Link
//                     key={item.href}
//                     href={item.href!}
//                     aria-current={active ? "page" : undefined}
//                     className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
//                       active
//                         ? "bg-[#FF6B35] text-white"
//                         : "text-gray-700 hover:bg-gray-100 hover:text-[#FF6B35] dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-[#FF6B35]"
//                     }`}
//                   >
//                     {item.label}
//                   </Link>
//                 );
//               })}
//             </div>

//             {/* Right Side Actions */}
//             <div className="flex items-center gap-2">
//               {/* Theme Toggle */}
//               <button
//                 onClick={toggleTheme}
//                 className="flex items-center justify-center rounded-lg bg-gray-100 p-2 transition-all hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800"
//                 aria-label="Toggle theme"
//               >
//                 {theme === "dark" ? (
//                   <Sun
//                     className="h-5 w-5 text-yellow-500"
//                     aria-hidden="true"
//                     focusable="false"
//                   />
//                 ) : (
//                   <Moon
//                     className="h-5 w-5 text-gray-700"
//                     aria-hidden="true"
//                     focusable="false"
//                   />
//                 )}
//               </button>

//               {/* Mobile Menu Button */}
//               <button
//                 onClick={() => setMobileMenuOpen((prev) => !prev)}
//                 className="flex items-center justify-center rounded-lg bg-gray-100 p-2 transition-all hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 md:hidden"
//                 aria-label="Toggle menu"
//               >
//                 {mobileMenuOpen ? (
//                   <X
//                     className="h-5 w-5 text-gray-700 dark:text-gray-300"
//                     aria-hidden="true"
//                     focusable="false"
//                   />
//                 ) : (
//                   <Menu
//                     className="h-5 w-5 text-gray-700 dark:text-gray-300"
//                     aria-hidden="true"
//                     focusable="false"
//                   />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Menu Overlay */}
//       {mobileMenuOpen && (
//         <div className="fixed inset-0 z-40 md:hidden">
//           {/* Backdrop */}
//           <button
//             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//             onClick={() => setMobileMenuOpen(false)}
//             aria-hidden="true"
//             tabIndex={-1}
//           />

//           {/* Menu Panel */}
//           <div className="absolute left-0 right-0 top-16 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
//             <div className="mx-auto max-w-7xl px-4 py-4">
//               <div className="flex flex-col gap-1.5">
//                 {items.map((item) => {
//                   if (item.children) {
//                     return (
//                       <div key={item.label} className="flex flex-col gap-1">
//                         <span className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
//                           {item.label}
//                         </span>

//                         {item.children.map((child) => (
//                           <Link
//                             key={child.href}
//                             href={child.href}
//                             onClick={() => setMobileMenuOpen(false)}
//                             className="ml-4 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
//                           >
//                             {child.label}
//                           </Link>
//                         ))}
//                       </div>
//                     );
//                   }

//                   const active = isActive(item.href!);
//                   return (
//                     <Link
//                       key={item.href}
//                       href={item.href!}
//                       onClick={() => setMobileMenuOpen(false)}
//                       className={`rounded-lg px-4 py-3 text-sm font-medium ${
//                         active
//                           ? "bg-[#FF6B35] text-white"
//                           : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
//                       }`}
//                     >
//                       {item.label}
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }


"use client";

import { Moon, Sun, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  menuItems?: Array<{
    label: string;
    href?: string;
    children?: { label: string; href: string }[];
  }>;
}

export default function Header({ theme, toggleTheme, menuItems }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const items = useMemo(
    () =>
      menuItems || [
        { label: "Home", href: "/" },
        { label: "Astrologers", href: "/talk-to-astrologers" },
        { label: "Horoscope", href: "/horoscope" },
        {
          label: "Kundli",
          // href can be null if it's just a parent
          children: [
            { label: "Free Kundali", href: "/free-kundali" },
            { label: "Kundali Matching", href: "/kundali-matching" },
          ],
        },
        { label: "Panchang", href: "/panchang" },
        { label: "Mall", href: "/mall" },
        { label: "Courses", href: "/courses" },
        { label: "Blog", href: "/blog" },
        { label: "About", href: "/about-us" },
        { label: "Contact", href: "/contact" },
      ],
    [menuItems]
  );

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (!href) return false;
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-gray-200 bg-white/80 shadow-md backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80"
            : "border-b border-transparent bg-white dark:bg-gray-950"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo Section */}
            <Link href="/" className="flex flex-shrink-0 items-center gap-2.5 z-50">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-orange-50 ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
                <img
                  src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                  alt="Gyani Talk Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                  Gyani<span className="text-[#FF6B35]">Talk</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Hidden on smaller screens, Visible on XL */}
            {/* We use xl because the menu list is very long */}
            <div className="hidden xl:flex xl:items-center xl:gap-1">
              {items.map((item) => {
                if (item.children) {
                  const isChildActive = item.children.some(c => isActive(c.href));
                  return (
                    <div
                      key={item.label}
                      className="group relative"
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button 
                        className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          isChildActive
                            ? "text-[#FF6B35] bg-orange-50 dark:bg-orange-900/10"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`} />
                      </button>

                      {/* Dropdown Menu */}
                      <div className="absolute left-0 top-full pt-2 opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible">
                        <div className="w-48 overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-xl ring-1 ring-black/5 dark:border-gray-800 dark:bg-gray-900 dark:ring-white/10">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                                isActive(child.href)
                                  ? "bg-orange-50 text-[#FF6B35] dark:bg-orange-900/20"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                const active = isActive(item.href!);
                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#FF6B35] text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleTheme}
                className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
              </button>

              {/* Mobile Menu Toggle - Visible below XL */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-900 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 xl:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Side Navigation) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm xl:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 top-0 z-[70] w-full max-w-xs bg-white shadow-2xl dark:bg-gray-950 xl:hidden"
            >
              {/* Drawer Header */}
              <div className="flex h-16 items-center justify-between border-b border-gray-100 px-6 dark:border-gray-800">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-gray-800 dark:text-gray-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6">
                <div className="flex flex-col space-y-1">
                  {items.map((item) => {
                    if (item.children) {
                      return (
                        <MobileDropdown 
                          key={item.label} 
                          item={item} 
                          pathname={pathname} 
                          closeMenu={() => setMobileMenuOpen(false)} 
                        />
                      );
                    }

                    const active = isActive(item.href!);
                    return (
                      <Link
                        key={item.href}
                        href={item.href!}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all ${
                          active
                            ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Footer / CTA */}
                <div className="mt-8 border-t border-gray-100 pt-6 dark:border-gray-800">
                  <Link
                    href="/talk-to-astrologers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-xl bg-[#FF6B35] py-3.5 text-center font-bold text-white shadow-lg shadow-orange-500/20 transition-transform active:scale-95"
                  >
                    Chat with Astrologer
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper Component for Mobile Accordion
function MobileDropdown({ item, pathname, closeMenu }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const isActiveParent = item.children.some((c: any) => pathname === c.href);

  // Auto-open if child is active
  useEffect(() => {
    if (isActiveParent) setIsOpen(true);
  }, [isActiveParent]);

  return (
    <div className="overflow-hidden rounded-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between px-4 py-3 text-base font-medium transition-colors ${
          isActiveParent 
             ? "text-[#FF6B35]" 
             : "text-gray-600 dark:text-gray-400"
        }`}
      >
        <span>{item.label}</span>
        <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50 dark:bg-gray-900/50"
          >
            <div className="flex flex-col space-y-1 p-2 pl-4">
              {item.children.map((child: any) => {
                 const isChildActive = pathname === child.href;
                 return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={closeMenu}
                    className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      isChildActive
                        ? "bg-white text-[#FF6B35] shadow-sm dark:bg-gray-800"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    {child.label}
                  </Link>
                 );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}