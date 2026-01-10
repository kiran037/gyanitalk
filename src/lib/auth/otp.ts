// src/lib/auth/otp.ts
import { prisma } from "@/lib/prisma";
import axios from "axios";

type OTPType = "registration" | "login" | "password_reset" | "phone_verify";

/**
 * Generate and store OTP
 */
export async function generateOTP(
  contact: string,
  type: OTPType,
  userId?: bigint
): Promise<string> {
  // 1. Generate Random OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. OTP expires in 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // 3. Invalidate any existing unused OTPs
  await prisma.otps.updateMany({
    where: {
      phone: contact,
      otp_type: type,
      is_used: false,
    },
    data: { is_used: true },
  });

  // 4. Create new OTP
  await prisma.otps.create({
    data: {
      userId: userId ? BigInt(userId) : null,
      phone: contact,
      otp_code: otp,
      otp_type: type,
      expires_at: expiresAt,
      is_used: false,
    },
  });

  return otp;
}

/**
 * Verify OTP
 */
export async function verifyOTP(
  contact: string,
  otp: string,
  type: OTPType
): Promise<{ userId?: bigint; valid: boolean }> {
  const record = await prisma.otps.findFirst({
    where: {
      phone: contact,
      otp_code: otp,
      otp_type: type,
      is_used: false,
      expires_at: { gte: new Date() },
    },
    orderBy: { created_at: "desc" },
  });

  if (!record) return { valid: false };

  await prisma.otps.update({
    where: { id: record.id },
    data: { is_used: true },
  });

  return {
    valid: true,
    userId: record.userId || undefined,
  };
}

export async function sendOTP(
  phone: string,
  countryCode: string, 
  otp: string,
  type: OTPType
): Promise<boolean> {
  
  // 1. Prepare number for MSG91: Must be CountryCode + Phone (No + sign)
  // Example: "91" + "9876543210" = "919876543210"
  const cleanCountryCode = countryCode.replace(/\D/g, ""); 
  const formattedMobileForAPI = `${cleanCountryCode}${phone}`;

  console.log(`
╔════════════════════════════════════════╗
║          OTP GENERATED                 ║
╠════════════════════════════════════════╣
║ Mobile: ${phone}
║ CC:     ${countryCode}
║ Type:   ${type}
║ OTP:    ${otp}
╚════════════════════════════════════════╝
  `);

  if (process.env.OTP_SERVICE_PROVIDER !== "msg91") {
    console.error("OTP Error: OTP_SERVICE_PROVIDER is not set to 'msg91'");
    return false;
  }

  console.log(`📤 Sending OTP to MSG91 (Env: ${process.env.NODE_ENV})...`);

  try {
    const payload = {
      invisible: null,
      otp: otp,
      otp_length: 6,
      otp_expiry: 5,
      template_id: process.env.MSG91_TEMPLATE_ID,
      mobile: formattedMobileForAPI, // ✅ Now includes country code
      authkey: process.env.OTP_API_KEY,
      realTimeResponse: 1,
    };

    console.log("📦 Request payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      "https://control.msg91.com/api/v5/otp",
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      }
    );

    console.log("✅ MSG91 Response:", JSON.stringify(response.data, null, 2));

    if (response.data?.type === "success") {
      console.log("🎉 OTP sent successfully!");
      return true;
    }

    console.error("❌ MSG91 returned non-success response");
    return false;
  } catch (error: any) {
    console.error("💥 MSG91 Request Error:", error.message);
    return false;
  }
}

/**
 * Check if OTP rate limit exceeded
 */
export async function checkOTPRateLimit(
  contact: string,
  type: OTPType
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  const recentOTPs = await prisma.otps.count({
    where: {
      phone: contact,
      otp_type: type,
      created_at: { gte: fifteenMinutesAgo },
    },
  });

  if (recentOTPs >= 100) {
    const oldestOTP = await prisma.otps.findFirst({
      where: {
        phone: contact,
        otp_type: type,
        created_at: { gte: fifteenMinutesAgo },
      },
      orderBy: { created_at: "asc" },
    });

    const retryAfter = oldestOTP
      ? Math.ceil(
          (oldestOTP.created_at.getTime() + 15 * 60 * 1000 - Date.now()) / 1000
        )
      : 900;

    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}