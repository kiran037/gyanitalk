import { prisma } from "@/lib/prisma";
import { BirthDetails, IntakeFormData } from '@/types/kundli';

/**
 * DEPRECATED: This manager is kept for backward compatibility only.
 * New implementations should save directly to kundalis table.
 * intakeform table is no longer the primary storage.
 */
export class IntakeFormManager {
  /**
   * Save user intake form data for marketing purposes
   * Works for both logged-in and non-logged-in users
   */
  static async saveIntakeForm(
    data: BirthDetails,
    userId?: number
  ): Promise<number> {
    try {
      // Truncate fields to prevent database errors
      const truncatedName = data.name.substring(0, 50);
      const truncatedBirthPlace = data.birthPlace.substring(0, 50);

      const intakeForm = await prisma.intakeform.create({
        data: {
          name: truncatedName,
          phoneNumber: data.contactNo,
          countryCode: data.countryCode || '+91',
          gender: data.gender,
          birthDate: new Date(data.birthDate),
          birthTime: data.birthTime,
          birthPlace: truncatedBirthPlace,
          latitude: data.latitude?.toString() || '',
          longitude: data.longitude?.toString() || '',
          timezone: data.timezone || '5.5',
          userId: userId || null,
          maritalStatus: '', // Optional - can be collected later
          occupation: '', // Optional
          topicOfConcern: 'Kundli Generation', // Default
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      return intakeForm.id;
    } catch (error) {
      console.error('Error saving intake form:', error);
      throw new Error('Failed to save intake form');
    }
  }

  /**
   * Get intake form by ID
   */
  static async getIntakeForm(id: number): Promise<IntakeFormData | null> {
    try {
      const form = await prisma.intakeform.findUnique({
        where: { id }
      });

      if (!form) return null;

      return {
        name: form.name || '',
        contactNo: form.phoneNumber,
        countryCode: form.countryCode || '+91',
        gender: form.gender,
        birthDate: form.birthDate,
        birthTime: form.birthTime,
        birthPlace: form.birthPlace,
        latitude: form.latitude || '',
        longitude: form.longitude || '',
        timezone: form.timezone || '',
        userId: form.userId || undefined,
        maritalStatus: form.maritalStatus || '',
        occupation: form.occupation || '',
        topicOfConcern: form.topicOfConcern || ''
      };
    } catch (error) {
      console.error('Error fetching intake form:', error);
      return null;
    }
  }

  /**
   * Update intake form with userId when user logs in
   */
  static async linkToUser(intakeFormId: number, userId: number): Promise<boolean> {
    try {
      await prisma.intakeform.update({
        where: { id: intakeFormId },
        data: { userId }
      });
      return true;
    } catch (error) {
      console.error('Error linking intake form to user:', error);
      return false;
    }
  }

  /**
   * Get all intake forms for marketing (admin use)
   */
  static async getAllIntakeForms(filters?: {
    fromDate?: Date;
    toDate?: Date;
    hasUserId?: boolean;
  }) {
    try {
      const where: any = {};

      if (filters?.fromDate) {
        where.created_at = { gte: filters.fromDate };
      }

      if (filters?.toDate) {
        where.created_at = { ...where.created_at, lte: filters.toDate };
      }

      if (filters?.hasUserId !== undefined) {
        where.userId = filters.hasUserId ? { not: null } : null;
      }

      return await prisma.intakeform.findMany({
        where,
        orderBy: { created_at: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching intake forms:', error);
      return [];
    }
  }

  /**
   * Convert IntakeForm to BirthDetails format
   */
  static convertToBirthDetails(form: IntakeFormData): BirthDetails {
    return {
      name: form.name,
      contactNo: form.contactNo,
      countryCode: form.countryCode,
      gender: form.gender as 'male' | 'female' | 'other',
      birthDate: form.birthDate.toISOString().split('T')[0],
      birthTime: form.birthTime,
      birthPlace: form.birthPlace,
      latitude: parseFloat(form.latitude || '0'),
      longitude: parseFloat(form.longitude || '0'),
      timezone: form.timezone || '5.5'
    };
  }
}