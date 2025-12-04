///Users/xeoren/gyanitallk-admin/src/components/Layouts/sidebar/index.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ChevronRight, X, Search, Menu } from "lucide-react";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

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

  const shouldExpand = isMobile ? isOpen : (isHovered || !isCollapsed);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={`relative transition-all duration-300 ease-in-out bg-white/60 dark:bg-white/5 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-700/60 shrink-0 flex-none h-screen ${
          isMobile 
            ? `fixed inset-y-0 left-0 z-50 shadow-2xl ${isOpen ? 'w-full max-w-[280px] translate-x-0' : 'w-0 -translate-x-full'}` 
            : shouldExpand ? 'w-[250px]' : 'w-[72px]'
        }`}
        aria-label="Main navigation"
        aria-hidden={isMobile ? !isOpen : false}
      >
        <div className="relative flex h-full flex-col">
          {/* Header */}
          <div className={`flex items-center p-4 border-b border-gray-200/60 dark:border-gray-700/60 ${shouldExpand ? 'justify-between' : 'justify-center'}`}>
            {shouldExpand ? (
              <>
                <span className="text-lg font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  Menu
                </span>
                {isMobile ? (
                  <button
                    onClick={toggleSidebar}
                    className="rounded-xl p-2 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-800 dark:hover:text-white"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="rounded-xl p-2 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-800 dark:hover:text-white"
                    aria-label="Toggle collapse"
                  >
                    <ChevronRight className={`h-5 w-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                  </button>
                )}
              </>
            ) : (
              <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>

          {/* Search Bar */}
          {shouldExpand && (
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-600/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 transition-all"
                />
              </div>
            </div>
          )}

          {/* Scrollable nav area */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 no-scrollbar">
            <div className="space-y-8">
              {filteredNavData.map((section) => (
                <div key={section.label}>
                  {shouldExpand && (
                    <h2 className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {section.label}
                    </h2>
                  )}

                  <nav role="navigation" aria-label={section.label}>
                    <ul className="space-y-1">
                      {section.items.map((item) => {
                        const hasChildren = (item.items?.length ?? 0) > 0;
                        const activeChild = item.items?.some(({ url }) => url === pathname);

                        if (hasChildren) {
                          const expanded = expandedItems.includes(item.title);
                          return (
                            <li key={item.title} className="space-y-1">
                              <button
                                onClick={() => toggleExpanded(item.title)}
                                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                                  activeChild
                                    ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-[#FF6B35] dark:text-[#FF8C61] shadow-sm'
                                    : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                                } ${!shouldExpand ? 'justify-center' : ''}`}
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
                                {shouldExpand && (
                                  <>
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
                                  </>
                                )}
                              </button>

                              {expanded && shouldExpand && (
                                <ul className="ml-6 space-y-1 overflow-hidden" role="menu">
                                  {item.items!.map((sub) => {
                                    const href = sub.url;
                                    const isActive = pathname === href;
                                    return (
                                      <li key={sub.title} role="none">
                                        <Link
                                          href={href}
                                          onClick={() => isMobile && toggleSidebar()}
                                          className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
                                            isActive
                                              ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-[#FF6B35] dark:text-[#FF8C61] shadow-sm font-medium'
                                              : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-400'
                                          }`}
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
                              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-[#FF6B35] dark:text-[#FF8C61] shadow-sm'
                                  : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                              } ${!shouldExpand ? 'justify-center' : ''}`}
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
                              {shouldExpand && <span className="truncate">{item.title}</span>}
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