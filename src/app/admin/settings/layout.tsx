"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Settings, DollarSign, Star, User, Image, Gift, 
  Languages, Flag, ChevronDown, ChevronRight, Menu, X, 
  LayoutDashboard
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
    label: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin/settings" },
    ]
  },
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Financial", "Content", "Localization", "System", "Overview"]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true); // Default to true to prevent flicker

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => 
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 font-sans selection:bg-orange-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex min-h-screen z-10">
        
        {/* Mobile Header / Toggle */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center px-4 z-50 justify-between">
            <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-white">
                <Settings className="w-5 h-5 text-[#FF6B35]" />
                <span>Settings</span>
            </div>
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"
            >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
        </div>

        {/* Mobile Backdrop */}
        <AnimatePresence>
            {sidebarOpen && !isDesktop && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                />
            )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen w-72 
            bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl 
            border-r border-gray-200/50 dark:border-gray-800/50 
            z-50 lg:z-30 overflow-y-auto custom-scrollbar
          `}
          initial={false}
          animate={{ x: (isDesktop || sidebarOpen) ? 0 : -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="p-6">
            {/* Sidebar Header */}
            <div className="hidden lg:flex items-center gap-3 mb-10 pl-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-none">Settings</h2>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium">System Configuration</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-6">
              {navigation.map((group) => (
                <div key={group.label}>
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-2 mb-2 group"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 group-hover:text-[#FF6B35] transition-colors">
                        {group.label}
                    </span>
                    {expandedGroups.includes(group.label) ? (
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    ) : (
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedGroups.includes(group.label) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-1 overflow-hidden"
                      >
                        {group.items.map((item) => {
                          // Enhanced active state check to include sub-routes
                          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/admin/settings');
                          
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`
                                relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                ${isActive 
                                  ? "text-[#FF6B35] bg-orange-50 dark:bg-orange-900/10" 
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                }
                              `}
                            >
                              {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 border border-[#FF6B35]/20 rounded-xl"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                              <item.icon className={`w-4 h-4 ${isActive ? "text-[#FF6B35]" : "text-gray-400 group-hover:text-gray-600"}`} />
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <span className={`
                                    px-2 py-0.5 text-[10px] font-bold rounded-full
                                    ${isActive ? "bg-[#FF6B35] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}
                                `}>
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

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 lg:ml-0 mt-16 lg:mt-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}