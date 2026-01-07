"use client";

import LandingWrapper from "@/components/landing/LandingWrapper";
import ProfileSidebar from "@/components/landing/profile/ProfileSidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LandingWrapper>
      <div className="relative min-h-screen bg-gray-50 dark:bg-black selection:bg-[#FF6B35]/10">
        {/* Main Content */}
        <div className="relative z-10 px-4 pt-20 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Desktop Sidebar */}
              <aside className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24">
                  <ProfileSidebar />
                </div>
              </aside>

              {/* Main Content Area */}
              <main className="lg:col-span-9 w-full">
                <div className="min-h-[60vh]">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </LandingWrapper>
  );
}