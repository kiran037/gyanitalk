// src/lib/auth/email.ts
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Generate email verification token
 */
export async function generateEmailVerificationToken(
  userId: bigint,
  email: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Invalidate any existing tokens
  await prisma.email_verifications.deleteMany({
    where: { userId: BigInt(userId) },
  });

  // Create new token
  await prisma.email_verifications.create({
    data: {
      userId: BigInt(userId),
      token,
      expires_at: expiresAt,
    },
  });

  return token;
}

/**
 * Verify email token
 */
export async function verifyEmailToken(token: string): Promise<{
  valid: boolean;
  userId?: bigint;
}> {
  const record = await prisma.email_verifications.findUnique({
    where: { token },
    select: { userId: true, expires_at: true, verified_at: true },
  });

  if (!record || record.expires_at < new Date() || record.verified_at) {
    return { valid: false };
  }

  // Mark as verified
  await prisma.email_verifications.update({
    where: { token },
    data: { verified_at: new Date() },
  });

  // Update user
  await prisma.users.update({
    where: { id: record.userId },
    data: {
      email_verified: true,
      email_verified_at: new Date(),
    },
  });

  return { valid: true, userId: record.userId };
}

/**
 * Send verification email (placeholder)
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<boolean> {
  const verifyUrl = `${process.env.EMAIL_VERIFY_URL || "http://localhost:3000/verify-email"}?token=${token}`;

  // In development, just log the URL
  if (process.env.NODE_ENV === "development") {
    console.log(`
╔════════════════════════════════════════╗
║       EMAIL VERIFICATION               ║
╠════════════════════════════════════════╣
║ Email: ${email}
║ 
║ Click to verify:
║ ${verifyUrl}
║ 
║ Valid for 24 hours
╚════════════════════════════════════════╝
    `);
    return true;
  }

  // TODO: Implement actual email service (Resend, SendGrid, etc.)
  // Example with Resend:
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.EMAIL_API_KEY);
  // await resend.emails.send({
  //   from: process.env.EMAIL_FROM,
  //   to: email,
  //   subject: 'Verify your email',
  //   html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`
  // });

  console.warn("Email service not configured. Verification URL:", verifyUrl);
  return true;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  otp: string
): Promise<boolean> {
  // In development, just log
  if (process.env.NODE_ENV === "development") {
    console.log(`
╔════════════════════════════════════════╗
║       PASSWORD RESET                   ║
╠════════════════════════════════════════╣
║ Email: ${email}
║ OTP:   ${otp}
║ 
║ Valid for 5 minutes
╚════════════════════════════════════════╝
    `);
    return true;
  }

  // TODO: Implement email service
  console.warn("Email service not configured. OTP:", otp);
  return true;
}