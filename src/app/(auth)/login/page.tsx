"use client"; // <--- This fixes the Runtime Error

import LoginForm from "@/components/Auth/LoginForm";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const avatars = [
    "/landing/profile/user1.png",
    "/landing/profile/user2.png",
    "/landing/profile/user3.png",
  ];

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F2F4F7] p-4 dark:bg-[#050A14] lg:p-8">
      {/* Main Card Container */}
      <div className="flex w-full max-w-[1600px] overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800 lg:h-[85vh] min-h-[600px]">
        
        {/* LEFT SIDE: Visuals */}
        <div className="relative hidden w-1/2 flex-col justify-between p-16 text-white lg:flex">
          
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] via-[#E85D2A] to-[#8B3D1B]" />
          
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

          {/* Decorative Orbs */}
          <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-yellow-500/20 blur-3xl" />

          {/* Content Layer */}
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-4 group">
              {/* Logo Container */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white backdrop-blur-md shadow-inner transition-transform group-hover:scale-105">
                 <img 
                   src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                   alt="Logo"
                   className="h-15 w-15" 
                 />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight">GyaniTalk</span>
                <span className="text-xs font-medium text-white/70">Astrology & Horoscope</span>
              </div>
            </Link>
          </div>

          <div className="relative z-10 max-w-lg space-y-8">
            <h2 className="text-5xl font-medium leading-tight tracking-tight">
              Unlock your destiny <br /> with the stars.
            </h2>
            <p className="text-xl text-white/80 font-light">
              Get instant access to expert astrologers, daily horoscopes, and personalized Kundli reports.
            </p>
            
            {/* Trust Badge with Real Avatars */}
            <div className="flex items-center gap-5 rounded-3xl bg-white/10 p-5 backdrop-blur-md border border-white/10">
                <div className="flex -space-x-4">
                    {avatars.map((src, i) => (
                        <div 
                          key={i} 
                          className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#FF6B35] bg-gray-300"
                        >
                          <img 
                            src={src} 
                            alt={`User ${i + 1}`}
                            className="h-full w-full object-cover"
                            // onError is a browser event, so "use client" is required
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=User+${i}&background=random`;
                            }}
                          />
                        </div>
                    ))}
                </div>
                <div>
                    <div className="text-lg font-bold">50k+ Users</div>
                    <div className="text-sm text-white/70">Trust our platform</div>
                </div>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between text-sm text-white/50">
             <span>© 2024 GyaniTalk Inc.</span>
             <div className="flex gap-4">
               <Link href="/privacy" className="hover:text-white">Privacy</Link>
               <Link href="/terms" className="hover:text-white">Terms</Link>
             </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form Area */}
        <div className="flex w-full flex-col justify-center bg-white px-8 py-12 dark:bg-[#0B1121] lg:w-1/2 lg:px-24">
          <div className="mx-auto w-full max-w-[420px]">
             
             {/* Header */}
             <div className="mb-10">
               <div className="mb-3 flex items-center gap-2">
                 <Sparkles className="h-5 w-5 text-[#FF6B35]" />
                 <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">Welcome Back</span>
               </div>
               <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Log in to your account</h1>
               <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
                 Access your consultations, notes, and wallet history.
               </p>
             </div>

             <LoginForm />
             
          </div>
        </div>

      </div>
    </main>
  );
}