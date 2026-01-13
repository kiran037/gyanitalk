"use client";

import ForgotPasswordForm from "@/components/Auth/ForgotPasswordForm";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const avatars = [
    "/landing/profile/user1.png",
    "/landing/profile/user2.png",
    "/landing/profile/user3.png",
  ];

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-[#0B1121]">
      
      {/* ================= LEFT SIDE (Visuals - Desktop Only) ================= */}
      <div className="relative hidden w-[35%] lg:flex flex-col justify-between overflow-hidden bg-[#0F172A]">
        
        {/* Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] via-[#D45625] to-[#8B3D1B] opacity-90" />
        <div 
            className="absolute inset-0 opacity-20 mix-blend-overlay" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />
        <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />
        <div className="absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-black/20 blur-[80px]" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20 transition-transform group-hover:scale-105">
               <img 
                 src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                 alt="Logo"
                 className="h-8 w-8 object-contain" 
               />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">GyaniTalk</span>
              <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Astrology & Horoscope</span>
            </div>
          </Link>

          <div className="space-y-6">
            <h2 className="text-4xl font-medium leading-tight tracking-tight">
              Regain access to <br /> your cosmic journey.
            </h2>
            <p className="text-base text-white/80 font-light leading-relaxed">
              Securely reset your password and get back to your consultations in seconds.
            </p>
            
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/5">
                <div className="flex -space-x-3">
                    {avatars.map((src, i) => (
                        <div key={i} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-[#FF6B35] bg-gray-200">
                          <img 
                            src={src} 
                            alt="User"
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=User+${i}&background=random`; }}
                          />
                        </div>
                    ))}
                </div>
                <div>
                    <div className="text-base font-bold">Secure Recovery</div>
                    <div className="text-xs text-white/70">Encrypted & Safe</div>
                </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs text-white/40">
             <span>© 2024 GyaniTalk Inc.</span>
             <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
             <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE (Form) ================= */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-20 bg-white dark:bg-[#0B1121]">
        
        <div className="w-full max-w-[480px] space-y-10">
            
            {/* Mobile Logo */}
            <div className="lg:hidden text-center space-y-4">
                <Link href="/" className="inline-flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B35]/10">
                        <img 
                            src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                            alt="Logo"
                            className="h-9 w-9 object-contain" 
                        />
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">GyaniTalk</span>
                </Link>
            </div>

            {/* Header */}
            <div className="text-center lg:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Forgot Password?
                </h1>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                    Enter your registered mobile number to reset it.
                </p>
            </div>

            <ForgotPasswordForm />

        </div>
      </div>
    </div>
  );
}