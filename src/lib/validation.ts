import { BirthDetails } from '@/types/kundli';

export class Validator {
  static validateBirthDetails(data: Partial<BirthDetails>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (data.name && data.name.length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }

    // Contact number validation
    if (!data.contactNo || data.contactNo.trim().length < 10) {
      errors.contactNo = 'Valid mobile number is required (10 digits)';
    }
    if (data.contactNo && !/^\d{10,15}$/.test(data.contactNo.replace(/\s/g, ''))) {
      errors.contactNo = 'Mobile number must contain only digits';
    }

    // Gender validation
    if (!data.gender || !['male', 'female', 'other'].includes(data.gender)) {
      errors.gender = 'Invalid gender';
    }

    // Birth date validation
    if (!data.birthDate) {
      errors.birthDate = 'Birth date is required';
    } else {
      const birthDate = new Date(data.birthDate);
      const today = new Date();
      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 120);

      if (birthDate > today) {
        errors.birthDate = 'Birth date cannot be in the future';
      } else if (birthDate < maxAge) {
        errors.birthDate = 'Invalid birth date';
      }
    }

    // Birth time validation (HH:MM format)
    if (!data.birthTime) {
      errors.birthTime = 'Birth time is required';
    } else {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.birthTime)) {
        errors.birthTime = 'Invalid time format (use HH:MM)';
      }
    }

    // Birth place validation
    if (!data.birthPlace || data.birthPlace.trim().length < 2) {
      errors.birthPlace = 'Birth place is required';
    }
    if (data.birthPlace && data.birthPlace.length > 200) {
      errors.birthPlace = 'Birth place is too long (max 200 characters)';
    }

    // Coordinates validation
    if (data.latitude === undefined || data.latitude === null) {
      errors.latitude = 'Latitude is required';
    } else if (data.latitude < -90 || data.latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }

    if (data.longitude === undefined || data.longitude === null) {
      errors.longitude = 'Longitude is required';
    } else if (data.longitude < -180 || data.longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }

    // Timezone validation
    if (!data.timezone) {
      errors.timezone = 'Timezone is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateContactNumber(contactNo: string, countryCode?: string): boolean {
    if (!contactNo) return false;
    
    // Remove spaces and non-digit characters except +
    const cleaned = contactNo.replace(/[\s\-()]/g, '');
    
    // Basic phone validation (10-15 digits)
    const phoneRegex = /^\+?[\d]{10,15}$/;
    return phoneRegex.test(cleaned);
  }

  static sanitizeInput(input: string, maxLength?: number): string {
    let sanitized = input.trim().replace(/[<>]/g, '');
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    return sanitized;
  }

  /**
   * Truncate long text fields to prevent database errors
   */
  static truncateField(value: string, maxLength: number): string {
    if (!value) return '';
    return value.length > maxLength ? value.substring(0, maxLength) : value;
  }

  /**
   * Validate all required fields are present
   */
  static hasRequiredFields(data: Partial<BirthDetails>): boolean {
    const required = [
      'name',
      'contactNo',
      'gender',
      'birthDate',
      'birthTime',
      'birthPlace',
      'latitude',
      'longitude',
      'timezone'
    ];

    return required.every(field => {
      const value = (data as any)[field];
      return value !== undefined && value !== null && value !== '';
    });
  }
}