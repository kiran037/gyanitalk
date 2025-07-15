"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <>
      {isMobile && (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
          <button
            onClick={toggleSidebar}
            className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] lg:hidden"
          >
            <MenuIcon />
            <span className="sr-only">Toggle Sidebar</span>
          </button>
  
          <Link
            href="/"
            className="ml-2 max-[430px]:hidden min-[375px]:ml-4"
          >
            <Image
              src="/images/logo/logo-icon.svg"
              width={32}
              height={32}
              alt="Logo"
              role="presentation"
            />
          </Link>
        </header>
      )}
    </>
  );
  
}
