// app/settings/layout.tsx
"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Settings, 
  DollarSign, 
  Star, 
  User, 
  Image, 
  Gift, 
  Languages, 
  Flag,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  icon: any;
  href: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    label: "Financial",
    items: [
      { label: "Recharge Amounts", icon: DollarSign, href: "/admin/settings/recharge" },
    ]
  },
  {
    label: "Content",
    items: [
      { label: "Horoscope Signs", icon: Star, href: "/admin/settings/horoscope-signs" },
      { label: "Default Profiles", icon: User, href: "/admin/settings/default-profiles" },
      { label: "Banners", icon: Image, href: "/admin/settings/banners" },
      { label: "Gifts", icon: Gift, href: "/admin/settings/gifts" },
    ]
  },
  {
    label: "Localization",
    items: [
      { label: "Languages", icon: Languages, href: "/admin/settings/languages" },
    ]
  },
  {
    label: "System",
    items: [
      { label: "System Flags", icon: Flag, href: "/admin/settings/system-flags", badge: "Core" },
    ]
  }
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Financial", "Content", "Localization", "System"]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Handle responsive detection on client-side only
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    // Initial check
    checkDesktop();
    
    // Add resize listener
    window.addEventListener('resize', checkDesktop);
    
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => 
      prev.includes(label) 
        ? prev.filter(g => g !== label)
        : [...prev, label]
    );
  };

  const showSidebar = sidebarOpen || isDesktop;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 -right-1/4 w-96 h-96 bg-[#FFB347] rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative flex">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed lg:sticky top-0 left-0 h-screen w-72 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 z-40 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">System Configuration</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {navigation.map((group) => (
                    <div key={group.label} className="mb-4">
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        <span>{group.label}</span>
                        {expandedGroups.includes(group.label) ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedGroups.includes(group.label) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-1 overflow-hidden"
                          >
                            {group.items.map((item) => {
                              const isActive = pathname === item.href;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                    isActive
                                      ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  }`}
                                >
                                  <item.icon className="w-4 h-4" />
                                  <span className="flex-1">{item.label}</span>
                                  {item.badge && (
                                    <span className="px-1.5 py-0.5 bg-white/20 text-[10px] font-bold rounded">
                                      {item.badge}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}