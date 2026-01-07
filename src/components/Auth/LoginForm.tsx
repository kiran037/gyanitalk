// // src/components/Auth/LoginForm.tsx
// "use client";

// import { useState } from "react";
// import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";
// import PhoneInput from "@/components/adminUI/PhoneInput";
// import OTPInput from "@/components/Auth/OTPInput";

// type LoginMode = "password" | "otp";

// export default function LoginForm() {
//   const router = useRouter();
//   const [mode, setMode] = useState<LoginMode>("password");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);

//   // Password mode state
//   const [passwordData, setPasswordData] = useState({
//     identifier: "",
//     password: "",
//     remember: false,
//   });

//   // OTP mode state
//   const [otpData, setOtpData] = useState({
//     contactNo: "",
//     countryCode: "+91",
//     otp: "",
//     remember: false,
//   });

//   const [errors, setErrors] = useState<Record<string, string>>({});

//   // Redirect after successful login
//   const redirectAfterLogin = async () => {
//     try {
//       const res = await fetch("/api/me");
//       const { data } = await res.json();

//       const roleIds = data.roles.map((r: any) => parseInt(r.id));

//       // User (3) or Astrologer (2) → "/"
//       if (roleIds.includes(2) || roleIds.includes(3)) {
//         router.push("/");
//       } else {
//         // Admin or other roles → "/admin/dashboard"
//         router.push("/admin/dashboard");
//       }
//     } catch (error) {
//       console.error("Redirect error:", error);
//       router.push("/");
//     }
//   };

//   // PASSWORD LOGIN
//   const handlePasswordLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors({});

//     if (!passwordData.identifier || !passwordData.password) {
//       setErrors({ form: "Please fill in all fields" });
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("/api/auth/login/password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           identifier: passwordData.identifier,
//           password: passwordData.password,
//           remember: passwordData.remember,
//         }),
//       });

//       const result = await res.json();

//       if (!res.ok) {
//         throw new Error(result.error || "Login failed");
//       }

//       toast.success("Login successful!");
//       await redirectAfterLogin();
//     } catch (error: any) {
//       toast.error(error.message || "Login failed");
//       setErrors({ form: error.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // OTP SEND
//   const handleSendOTP = async () => {
//     setErrors({});

//     if (!otpData.contactNo) {
//       setErrors({ contactNo: "Mobile number is required" });
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("/api/auth/login/otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contactNo: otpData.contactNo,
//           countryCode: otpData.countryCode,
//         }),
//       });

//       const result = await res.json();

//       if (!res.ok) {
//         throw new Error(result.error || "Failed to send OTP");
//       }

//       toast.success("OTP sent successfully!");
//       setOtpSent(true);
//     } catch (error: any) {
//       toast.error(error.message || "Failed to send OTP");
//       setErrors({ form: error.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // OTP LOGIN
//   const handleOTPLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors({});

//     if (!otpData.otp || otpData.otp.length !== 6) {
//       setErrors({ otp: "Please enter a valid 6-digit OTP" });
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("/api/auth/verify-login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contactNo: otpData.contactNo,
//           countryCode: otpData.countryCode,
//           otp: otpData.otp,
//           remember: otpData.remember,
//         }),
//       });

//       const result = await res.json();

//       if (!res.ok) {
//         throw new Error(result.error || "OTP verification failed");
//       }

//       toast.success("Login successful!");
//       await redirectAfterLogin();
//     } catch (error: any) {
//       toast.error(error.message || "OTP verification failed");
//       setErrors({ form: error.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative mx-auto w-full max-w-md">
//       {/* Ambient background blobs */}
//       <div className="pointer-events-none absolute -top-24 -right-28 h-64 w-64 rounded-full bg-gradient-to-br from-[#FF6B35]/20 to-[#FFB347]/20 blur-3xl animate-pulse" />
//       <div
//         className="pointer-events-none absolute -bottom-24 -left-28 h-72 w-72 rounded-full bg-gradient-to-tr from-[#FFB347]/20 to-[#FF8C61]/20 blur-3xl animate-pulse"
//         style={{ animationDelay: "1s" }}
//       />

//       <div className="relative overflow-hidden rounded-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 shadow-2xl p-8">
//         {/* Header */}
//         <div className="mb-8 text-center">
//           <div className="flex justify-center mb-6">
//             <Link href="/" aria-label="Go to home">
//               <img
//                 src="https://gyanitalk.com/public/storage/images/astrologer_7851728112667.png"
//                 alt="Gyani Talk"
//                 className="w-20 h-20 object-contain cursor-pointer"
//               />
//             </Link>
//           </div>
//           <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
//             Welcome back
//           </h1>
//           <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
//             Sign in to continue to your account
//           </p>
//         </div>

//         {/* Mode Switcher */}
//         <div className="mb-6 flex rounded-xl bg-gray-100 dark:bg-gray-700/50 p-1">
//           <button
//             type="button"
//             onClick={() => {
//               setMode("password");
//               setOtpSent(false);
//               setErrors({});
//             }}
//             className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
//               mode === "password"
//                 ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-md"
//                 : "text-gray-600 dark:text-gray-300"
//             }`}
//           >
//             Password
//           </button>
//           <button
//             type="button"
//             onClick={() => {
//               setMode("otp");
//               setOtpSent(false);
//               setErrors({});
//             }}
//             className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
//               mode === "otp"
//                 ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-md"
//                 : "text-gray-600 dark:text-gray-300"
//             }`}
//           >
//             OTP
//           </button>
//         </div>

//         {/* Error Display */}
//         {errors.form && (
//           <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
//             {errors.form}
//           </div>
//         )}

//         {/* PASSWORD MODE */}
//         {mode === "password" && (
//           <form onSubmit={handlePasswordLogin} className="space-y-5">
//             {/* Email/Mobile Field */}
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
//                 Email or Mobile
//               </label>
//               <div className="relative">
//                 <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10">
//                   <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   value={passwordData.identifier}
//                   onChange={(e) =>
//                     setPasswordData((s) => ({ ...s, identifier: e.target.value }))
//                   }
//                   placeholder="Enter email or mobile"
//                   disabled={loading}
//                   className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08] backdrop-blur-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
//                 Password
//               </label>
//               <div className="relative">
//                 <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10">
//                   <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={passwordData.password}
//                   onChange={(e) =>
//                     setPasswordData((s) => ({ ...s, password: e.target.value }))
//                   }
//                   placeholder="Enter your password"
//                   disabled={loading}
//                   className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08] backdrop-blur-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
//                 >
//                   {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* Remember Me */}
//             <div className="flex items-center justify-between">
//               <label className="inline-flex items-center gap-2 cursor-pointer group">
//                 <input
//                   type="checkbox"
//                   checked={passwordData.remember}
//                   onChange={(e) =>
//                     setPasswordData((s) => ({ ...s, remember: e.target.checked }))
//                   }
//                   className="h-4 w-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
//                 />
//                 <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
//               </label>

//               <Link
//                 href="/forgot-password"
//                 className="text-sm font-semibold text-[#FF6B35] hover:text-[#FF8C61] transition-colors"
//               >
//                 Forgot Password?
//               </Link>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B35] to-[#FFB347] hover:from-[#FF8C61] hover:to-[#FFCC80] shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
//             >
//               {loading ? "Signing in..." : "Sign In"}
//             </button>
//           </form>
//         )}

//         {/* OTP MODE */}
//         {mode === "otp" && (
//           <div className="space-y-5">
//             {!otpSent ? (
//               <>
//                 {/* Phone Input */}
//                 <div>
//                   <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
//                     Mobile Number
//                   </label>
//                   <PhoneInput
//                     value={otpData.contactNo}
//                     countryCode={otpData.countryCode}
//                     onChange={(phone, code) =>
//                       setOtpData((s) => ({ ...s, contactNo: phone, countryCode: code }))
//                     }
//                     error={errors.contactNo}
//                   />
//                 </div>

//                 {/* Send OTP Button */}
//                 <button
//                   type="button"
//                   onClick={handleSendOTP}
//                   disabled={loading}
//                   className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B35] to-[#FFB347] hover:from-[#FF8C61] hover:to-[#FFCC80] shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
//                 >
//                   {loading ? "Sending OTP..." : "Send OTP"}
//                 </button>
//               </>
//             ) : (
//               <form onSubmit={handleOTPLogin} className="space-y-5">
//                 {/* OTP Input */}
//                 <div>
//                   <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
//                     Enter OTP
//                   </label>
//                   <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
//                     OTP sent to {otpData.countryCode} {otpData.contactNo}
//                   </p>
//                   <OTPInput
//                     value={otpData.otp}
//                     onChange={(otp) => setOtpData((s) => ({ ...s, otp }))}
//                     error={errors.otp}
//                   />
//                 </div>

//                 {/* Resend OTP */}
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setOtpSent(false);
//                     setOtpData((s) => ({ ...s, otp: "" }));
//                   }}
//                   className="text-sm font-semibold text-[#FF6B35] hover:text-[#FF8C61] transition-colors"
//                 >
//                   Change Number or Resend OTP
//                 </button>

//                 {/* Remember Me */}
//                 <div className="flex items-center pt-1">
//                   <label className="inline-flex items-center gap-2 cursor-pointer group">
//                     <input
//                       type="checkbox"
//                       checked={otpData.remember}
//                       onChange={(e) =>
//                         setOtpData((s) => ({ ...s, remember: e.target.checked }))
//                       }
//                       className="h-4 w-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
//                     />
//                     <span className="text-sm text-gray-700 dark:text-gray-300">
//                       Remember me for 30 days
//                     </span>
//                   </label>
//                 </div>

//                 {/* Verify Button */}
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B35] to-[#FFB347] hover:from-[#FF8C61] hover:to-[#FFCC80] shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
//                 >
//                   {loading ? "Verifying..." : "Verify & Sign In"}
//                 </button>
//               </form>
//             )}
//           </div>
//         )}

//         {/* Footer Links */}
//         <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
//           Don't have an account?{" "}
//           <Link
//             href="/register"
//             className="font-semibold text-[#FF6B35] hover:text-[#FF8C61] transition-colors"
//           >
//             Register
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import PhoneInput from "@/components/adminUI/PhoneInput";
import OTPInput from "@/components/Auth/OTPInput";

type LoginMode = "password" | "otp";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [passwordData, setPasswordData] = useState({ identifier: "", password: "", remember: false });
  const [otpData, setOtpData] = useState({ contactNo: "", countryCode: "+91", otp: "", remember: false });

  // --- Auth Handlers (Same logic as before) ---
  const redirectAfterLogin = async () => {
    try {
      const res = await fetch("/api/me");
      const { data } = await res.json();
      const roleIds = data.roles.map((r: any) => parseInt(r.id));
      if (roleIds.includes(2) || roleIds.includes(3)) router.push("/");
      else router.push("/admin/dashboard");
    } catch { router.push("/"); }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!passwordData.identifier || !passwordData.password) return setErrors({ form: "Please fill in all fields" });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });
      if (!res.ok) { const r = await res.json(); throw new Error(r.error || "Login failed"); }
      toast.success("Login successful!");
      await redirectAfterLogin();
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  const handleSendOTP = async () => {
    setErrors({});
    if (!otpData.contactNo) return setErrors({ contactNo: "Mobile number required" });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactNo: otpData.contactNo, countryCode: otpData.countryCode }),
      });
      if (!res.ok) { const r = await res.json(); throw new Error(r.error); }
      toast.success("OTP sent!");
      setOtpSent(true);
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpData.otp || otpData.otp.length !== 6) return setErrors({ otp: "Invalid OTP" });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otpData),
      });
      if (!res.ok) { const r = await res.json(); throw new Error(r.error); }
      toast.success("Welcome back!");
      await redirectAfterLogin();
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  return (
    <div>
      {/* 1. Toggle Switch (Minimalist) */}
      <div className="mb-8 flex gap-6 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => { setMode("password"); setErrors({}); }}
          className={`pb-3 text-sm font-semibold transition-all ${
            mode === "password" 
              ? "border-b-2 border-[#FF6B35] text-gray-900 dark:text-white" 
              : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
          }`}
        >
          Password Login
        </button>
        <button
          onClick={() => { setMode("otp"); setErrors({}); }}
          className={`pb-3 text-sm font-semibold transition-all ${
            mode === "otp" 
              ? "border-b-2 border-[#FF6B35] text-gray-900 dark:text-white" 
              : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
          }`}
        >
          OTP Login
        </button>
      </div>

      {/* 2. Error Message */}
      {errors.form && (
        <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
          {errors.form}
        </div>
      )}

      {/* 3. Forms */}
      <AnimatePresence mode="wait">
        {mode === "password" ? (
          <motion.form
            key="password"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handlePasswordLogin}
            className="space-y-5"
          >
            {/* Input: Identifier */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email or Mobile
              </label>
              <input
                type="text"
                value={passwordData.identifier}
                onChange={(e) => setPasswordData(s => ({ ...s, identifier: e.target.value }))}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-gray-400 focus:bg-white focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Input: Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-[#FF6B35] hover:underline">
                    Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.password}
                    onChange={(e) => setPasswordData(s => ({ ...s, password: e.target.value }))}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-gray-400 focus:bg-white focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
                <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] py-3.5 text-sm font-bold text-white transition-transform hover:bg-black hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 dark:bg-white dark:text-black"
                >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Log in"}
                </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {!otpSent ? (
                <>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mobile Number
                        </label>
                        <PhoneInput 
                            value={otpData.contactNo}
                            countryCode={otpData.countryCode}
                            onChange={(p, c) => setOtpData(s => ({...s, contactNo: p, countryCode: c}))}
                            error={errors.contactNo}
                        />
                    </div>
                    <button
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] py-3.5 text-sm font-bold text-white transition-transform hover:bg-black hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 dark:bg-white dark:text-black"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Send OTP"}
                    </button>
                </>
            ) : (
                <form onSubmit={handleOTPLogin} className="space-y-6">
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enter code</label>
                            <button 
                                type="button" 
                                onClick={() => setOtpSent(false)} 
                                className="text-xs font-semibold text-[#FF6B35] hover:underline"
                            >
                                Change number
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <OTPInput 
                                value={otpData.otp}
                                onChange={(otp) => setOtpData(s => ({...s, otp}))}
                                error={errors.otp}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] py-3.5 text-sm font-bold text-white transition-transform hover:bg-black hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 dark:bg-white dark:text-black"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify & Log in"}
                    </button>
                </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 4. Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-[#FF6B35] hover:underline">
                Register
            </Link>
        </p>
      </div>

      {/* Social Options (Visual match to reference) */}
      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 dark:bg-[#0B1121]">or continue with</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <span className="text-lg">G</span> Google
        </button>
        <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
             Apple
        </button>
      </div>
    </div>
  );
}