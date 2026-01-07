// src/lib/profile/update.ts
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * Profile update validation schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  contactNo: z.string().regex(/^\d{10}$/).optional(),
  countryCode: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  birthTime: z.string().max(50).optional(),
  birthPlace: z.string().max(255).optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  location: z.string().max(100).optional(),
  pincode: z.number().int().optional(),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: bigint,
  data: UpdateProfileData
) {
  const updateData: any = {};

  // Handle date fields
  if (data.birthDate) {
    updateData.birthDate = new Date(data.birthDate);
  }

  // Copy other fields
  const simpleFields = [
    "name",
    "email",
    "contactNo",
    "countryCode",
    "birthTime",
    "birthPlace",
    "gender",
    "addressLine1",
    "addressLine2",
    "location",
    "pincode",
  ];

  simpleFields.forEach((field) => {
    if (data[field as keyof UpdateProfileData] !== undefined) {
      updateData[field] = data[field as keyof UpdateProfileData];
    }
  });

  // If email changed, mark as unverified
  if (data.email) {
    updateData.email_verified = false;
    updateData.email_verified_at = null;
  }

  // If phone changed, mark as unverified
  if (data.contactNo) {
    updateData.phone_verified = false;
    updateData.phone_verified_at = null;
  }

  return await prisma.users.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      contactNo: true,
      email_verified: true,
      phone_verified: true,
      updated_at: true,
    },
  });
}

/**
 * Update profile picture
 */
export async function updateProfilePicture(userId: bigint, profilePath: string) {
  return await prisma.users.update({
    where: { id: userId },
    data: { profile: profilePath },
    select: {
      id: true,
      profile: true,
      updated_at: true,
    },
  });
}

/**
 * Validate profile update data
 */
export function validateProfileUpdate(data: any): {
  valid: boolean;
  errors?: any;
  data?: UpdateProfileData;
} {
  try {
    const validated = updateProfileSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.issues };
    }
    return { valid: false, errors: [{ message: "Invalid data" }] };
  }
}