// /src/components/Layouts/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ChevronRight, X, Search } from "lucide-react";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  // Auto-expand active parent items
  useEffect(() => {
    NAV_DATA.forEach((section) => {
      section.items.forEach((item) => {
        item.items?.forEach((sub) => {
          if (sub.url === pathname && !expandedItems.includes(item.title)) {
            setExpandedItems((p) => [...p, item.title]);
          }
        });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Filter navigation based on search
  const filteredNavData = searchQuery
    ? NAV_DATA.map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const matchesParent = item.title.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesChild = item.items?.some((sub) =>
            sub.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          return matchesParent || matchesChild;
        }),
      })).filter((section) => section.items.length > 0)
    : NAV_DATA;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`relative transition-all duration-300 ease-in-out bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/30 shrink-0 flex-none ${
          isMobile 
            ? `fixed inset-y-0 left-0 z-50 shadow-2xl ${isOpen ? 'w-full max-w-[280px] translate-x-0' : 'w-0 -translate-x-full'}` 
            : 'h-full w-[250px]'
        }`}
        aria-label="Main navigation"
        aria-hidden={isMobile ? !isOpen : false}
      >
        {/* Column (header + scroll area) */}
        <div className="relative flex h-full flex-col">
          {/* Header row (close button for mobile) */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/30">
            {isMobile && (
              <>
                <span className="text-lg font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  Menu
                </span>
                <button
                  onClick={toggleSidebar}
                  className="rounded-xl p-2 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-800 dark:hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Search Bar */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-600/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          {/* Scrollable nav area */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 no-scrollbar">
            <div className="space-y-8">
              {filteredNavData.map((section, sectionIndex) => (
                <div key={section.label}>
                  <h2 className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {section.label}
                  </h2>

                  <nav role="navigation" aria-label={section.label}>
                    <ul className="space-y-1">
                      {section.items.map((item, itemIndex) => {
                        const hasChildren = (item.items?.length ?? 0) > 0;
                        const activeChild = item.items?.some(({ url }) => url === pathname);
                        const itemKey = `${sectionIndex}-${itemIndex}`;

                        if (hasChildren) {
                          const expanded = expandedItems.includes(item.title);
                          return (
                            <li key={item.title} className="space-y-1">
                              <button
                                onClick={() => toggleExpanded(item.title)}
                                onMouseEnter={() => setHoveredItem(itemKey)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                                  activeChild
                                    ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-[#FF6B35] dark:text-[#FF8C61] shadow-sm'
                                    : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                                } ${hoveredItem === itemKey ? 'scale-[1.02] transform' : ''}`}
                              >
                                <div
                                  className={`rounded-lg p-1.5 transition-all duration-200 ${
                                    activeChild
                                      ? 'bg-gradient-to-br from-[#FF6B35] to-[#FFB347] shadow-lg'
                                      : 'bg-white/50 dark:bg-gray-800/50 group-hover:bg-white dark:group-hover:bg-gray-700/80'
                                  }`}
                                >
                                  <item.icon
                                    className={`h-4 w-4 transition-colors duration-200 ${
                                      activeChild
                                        ? 'text-white'
                                        : 'text-gray-500 group-hover:text-[#FF6B35] dark:text-gray-400 dark:group-hover:text-[#FF8C61]'
                                    }`}
                                  />
                                </div>
                                <span className="flex-1 truncate">{item.title}</span>
                                <ChevronRight
                                  className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                                    expanded ? 'rotate-90' : 'rotate-0'
                                  } ${
                                    activeChild
                                      ? 'text-[#FF6B35] dark:text-[#FF8C61]'
                                      : 'text-gray-400 group-hover:text-[#FF6B35] dark:group-hover:text-[#FF8C61]'
                                  }`}
                                  aria-hidden="true"
                                />
                              </button>

                              {expanded && (
                                <ul className="ml-6 space-y-1 overflow-hidden animate-in slide-in-from-top-2" role="menu">
                                  {item.items!.map((sub, subIndex) => {
                                    const href = sub.url;
                                    const isActive = pathname === href;
                                    const subItemKey = `${itemKey}-${subIndex}`;
                                    return (
                                      <li key={sub.title} role="none">
                                        <Link
                                          href={href}
                                          onClick={() => isMobile && toggleSidebar()}
                                          onMouseEnter={() => setHoveredItem(subItemKey)}
                                          onMouseLeave={() => setHoveredItem(null)}
                                          className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
                                            isActive
                                              ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-[#FF6B35] dark:text-[#FF8C61] shadow-sm font-medium'
                                              : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-400'
                                          } ${hoveredItem === subItemKey ? 'scale-[1.02] transform' : ''}`}
                                          role="menuitem"
                                        >
                                          <div
                                            className={`h-2 w-2 rounded-full transition-all duration-200 ${
                                              isActive
                                                ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFB347] shadow-lg shadow-[#FF6B35]/50'
                                                : 'bg-gray-300 group-hover:bg-[#FF6B35] dark:bg-gray-600 dark:group-hover:bg-[#FF8C61]'
                                            }`}
                                          />
                                          <span className="truncate">{sub.title}</span>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          );
                        }

                        // Leaf item
                        const href =
                          "url" in item
                            ? (item.url as string)
                            : "/" + item.title.toLowerCase().split(" ").join("-");

                        const isActive = pathname === href;

                        return (
                          <li key={item.title}>
                            <Link
                              href={href}
                              onClick={() => isMobile && toggleSidebar()}
                              onMouseEnter={() => setHoveredItem(itemKey)}
                              onMouseLeave={() => setHoveredItem(null)}
                              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-[#FF6B35] dark:text-[#FF8C61] shadow-sm'
                                  : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                              } ${hoveredItem === itemKey ? 'scale-[1.02] transform' : ''}`}
                            >
                              <div
                                className={`rounded-lg p-1.5 transition-all duration-200 ${
                                  isActive
                                    ? 'bg-gradient-to-br from-[#FF6B35] to-[#FFB347] shadow-lg'
                                    : 'bg-white/50 dark:bg-gray-800/50 group-hover:bg-white dark:group-hover:bg-gray-700/80'
                                }`}
                              >
                                <item.icon
                                  className={`h-4 w-4 transition-colors duration-200 ${
                                    isActive
                                      ? 'text-white'
                                      : 'text-gray-500 group-hover:text-[#FF6B35] dark:text-gray-400 dark:group-hover:text-[#FF8C61]'
                                  }`}
                                />
                              </div>
                              <span className="truncate">{item.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
              ))}
            </div>
          </div>

          {/* Hide scrollbar styles */}
          <style jsx global>{`
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      </aside>
    </>
  );
}