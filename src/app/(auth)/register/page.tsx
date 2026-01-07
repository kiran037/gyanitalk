"use client";

import RegisterForm from "@/components/Auth/RegisterForm";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function RegisterPage() {
  const avatars = [
    "/landing/profile/user1.png",
    "/landing/profile/user2.png",
    "/landing/profile/user3.png",
  ];

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F2F4F7] p-0 dark:bg-[#050A14] lg:p-8">
      {/* Main Card Container */}
      <div className="flex w-full max-w-[1600px] overflow-hidden bg-white shadow-2xl ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800 lg:h-[90vh] lg:min-h-[700px] lg:rounded-[32px]">
        
        {/* LEFT SIDE: Visuals (Hidden on Mobile) */}
        <div className="relative hidden w-5/12 flex-col justify-between p-16 text-white xl:flex">
          
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] via-[#E85D2A] to-[#8B3D1B]" />
          
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

          {/* Decorative Elements */}
          <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-yellow-500/20 blur-3xl" />

          {/* Logo */}
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white backdrop-blur-md shadow-inner transition-transform group-hover:scale-105">
                 <img 
                   src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                   alt="Logo"
                   className="h-15 w-15" 
                 />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight">GyaniTalk</span>
                <span className="text-xs font-medium text-white/70">Join our community</span>
              </div>
            </Link>
          </div>

          {/* Hero Text */}
          <div className="relative z-10 max-w-md space-y-6">
            <h2 className="text-4xl font-medium leading-tight tracking-tight">
              Begin your cosmic journey today.
            </h2>
            <p className="text-lg text-white/80 font-light">
              Create an account to get personalized horoscopes, consult with experts, and unlock your true potential.
            </p>
            
            {/* Social Proof */}
            <div className="flex items-center gap-4 rounded-3xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
                <div className="flex -space-x-3">
                    {avatars.map((src, i) => (
                        <div key={i} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-[#FF6B35] bg-gray-300">
                          <img 
                            src={src} 
                            alt={`User ${i}`} 
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=U+${i}&background=random`; }}
                          />
                        </div>
                    ))}
                </div>
                <div className="text-sm">
                    <span className="font-bold">50k+ Members</span> joined last month
                </div>
            </div>
          </div>
          
          <div className="relative z-10 text-sm text-white/50">
             © 2024 GyaniTalk Inc.
          </div>
        </div>

        {/* RIGHT SIDE: Form Area (Full width on mobile) */}
        <div className="flex w-full flex-col bg-white dark:bg-[#0B1121] xl:w-7/12">
          
          {/* Mobile Header (Visible only on small screens) */}
          <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800 xl:hidden">
             <Link href="/" className="flex items-center gap-2">
                <img 
                   src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                   alt="Logo"
                   className="h-8 w-8 object-contain" 
                 />
                 <span className="font-bold text-gray-900 dark:text-white">GyaniTalk</span>
             </Link>
             <Link href="/login" className="text-sm font-semibold text-[#FF6B35]">
                Sign In
             </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-16 xl:py-12">
            <div className="mx-auto w-full max-w-[600px]">
               {/* Desktop Header */}
               <div className="mb-8 hidden items-center justify-between xl:flex">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#FF6B35]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">Get Started</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                  </div>
                  <div className="text-right text-sm">
                     <span className="text-gray-500 dark:text-gray-400">Have an account?</span>
                     <Link href="/login" className="ml-2 font-semibold text-[#FF6B35] hover:underline">Sign In</Link>
                  </div>
               </div>

               <RegisterForm />
               
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}