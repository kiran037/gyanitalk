/**
 * Timezone Helper Utilities
 * Handles timezone conversions and validations
 */

export class TimezoneHelper {
  /**
   * Normalize timezone to string format for database storage
   * Accepts both number and string, returns string
   */
  static toDBFormat(timezone: number | string): string {
    if (typeof timezone === 'number') {
      return timezone.toString();
    }
    return timezone;
  }

  /**
   * Convert timezone to API format (string)
   * Ensures proper decimal format without trailing zeros
   */
  static toAPIFormat(timezone: number | string): string {
    const normalized = this.toDBFormat(timezone);
    const parsed = parseFloat(normalized);
    
    if (isNaN(parsed)) {
      throw new Error('Invalid timezone value');
    }
    
    return parsed.toString();
  }

  /**
   * Validate timezone value
   * Returns true if valid, false otherwise
   */
  static isValid(timezone: number | string): boolean {
    try {
      const value = typeof timezone === 'number' ? timezone : parseFloat(timezone);
      return !isNaN(value) && value >= -12 && value <= 14;
    } catch {
      return false;
    }
  }

  /**
   * Get timezone from offset
   * Converts UTC offset to timezone string
   */
  static fromOffset(offsetMinutes: number): string {
    const hours = offsetMinutes / 60;
    return hours.toString();
  }

  /**
   * Common timezone values for reference
   */
  static readonly COMMON_TIMEZONES = {
    IST: '5.5',          // Indian Standard Time
    PST: '-8',           // Pacific Standard Time
    MST: '-7',           // Mountain Standard Time
    CST: '-6',           // Central Standard Time
    EST: '-5',           // Eastern Standard Time
    GMT: '0',            // Greenwich Mean Time
    CET: '1',            // Central European Time
    JST: '9',            // Japan Standard Time
    AEST: '10',          // Australian Eastern Standard Time
  };

  /**
   * Parse timezone from various input formats
   */
  static parse(input: any): string {
    if (input === null || input === undefined) {
      throw new Error('Timezone cannot be null or undefined');
    }

    if (typeof input === 'number') {
      return input.toString();
    }

    if (typeof input === 'string') {
      const trimmed = input.trim();
      const parsed = parseFloat(trimmed);
      
      if (isNaN(parsed)) {
        // Check if it's a named timezone
        const commonValue = this.COMMON_TIMEZONES[trimmed as keyof typeof this.COMMON_TIMEZONES];
        if (commonValue) {
          return commonValue;
        }
        throw new Error(`Invalid timezone format: ${trimmed}`);
      }
      
      return parsed.toString();
    }

    throw new Error(`Unsupported timezone type: ${typeof input}`);
  }

  /**
   * Convert timezone to hours and minutes
   */
  static toHoursMinutes(timezone: number | string): { hours: number; minutes: number } {
    const value = parseFloat(this.toDBFormat(timezone));
    const hours = Math.floor(Math.abs(value));
    const minutes = Math.round((Math.abs(value) - hours) * 60);
    
    return {
      hours: value >= 0 ? hours : -hours,
      minutes
    };
  }

  /**
   * Format timezone for display
   */
  static format(timezone: number | string, includeUTC: boolean = true): string {
    const value = parseFloat(this.toDBFormat(timezone));
    const { hours, minutes } = this.toHoursMinutes(value);
    const sign = value >= 0 ? '+' : '-';
    
    let formatted = `${sign}${Math.abs(hours).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    if (includeUTC) {
      formatted = `UTC${formatted}`;
    }
    
    return formatted;
  }
}