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
      <div className="relative min-h-screen bg-[#F2F2F7] dark:bg-[#000] selection:bg-[#FF6B35]/20">
        {/* Changed pb-20 to pb-6 for mobile, lg:pb-12 for desktop */}
        <div className="relative z-10 px-0 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-6 lg:pb-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
              
              {/* Desktop Sidebar - Hidden on Mobile */}
              <aside className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24">
                  <ProfileSidebar />
                </div>
              </aside>

              {/* Main Content Area */}
              <main className="lg:col-span-9 w-full">
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </LandingWrapper>
  );
}