import axios, { AxiosRequestConfig } from 'axios';
import { prisma } from "@/lib/prisma";

// ============================================
// Types & Interfaces
// ============================================

export interface PanchangParams {
  date: string; // Format: DD/MM/YYYY
  tz: number;
  lat: number;
  lon: number;
  time?: string; // Format: HH:MM
  lang?: string;
}

export interface MonthlyPanchangParams {
  date: string;
  tz: number;
  lat: number;
  lon: number;
  time?: string;
  lang?: string;
}

export interface MoonCalendarParams {
  date: string;
  tz: number;
  lang?: string;
}

export interface HoraMuhurtaParams {
  date: string;
  tz: number;
  lat: number;
  lon: number;
  time?: string;
  lang?: string;
}

export interface ChoghadiyaMuhurtaParams {
  date: string;
  tz: number;
  lat: number;
  lon: number;
  time?: string;
  lang?: string;
}

export interface SunMoonParams {
  date: string;
  tz: number;
  lat: number;
  lon: number;
  time?: string;
  lang?: string;
}

export interface RetrogradeParams {
  year: number;
  planet: string;
  lang?: string;
}

export interface TransitParams {
  year?: number;
  lang?: string;
}

// ============================================
// Vedic API Helper Class
// ============================================

export class VedicAPI {
  private static BASE_URL = 'https://api.vedicastroapi.com/v3-json';
  private static FALLBACK_API_KEY = process.env.VEDICASTRO_API_KEY || '';

  /**
   * Get API key from database or fallback to env variable
   */
  private static async getApiKey(): Promise<string> {
    try {
      const flag = await prisma.systemflag.findFirst({
        where: { name: 'vedicAstroAPI' }
      });
      return flag?.value || this.FALLBACK_API_KEY;
    } catch (error) {
      console.warn('Failed to fetch API key from database, using fallback:', error);
      return this.FALLBACK_API_KEY;
    }
  }

  /**
   * Make API request with proper error handling
   */
  private static async makeRequest<T>(
    endpoint: string,
    params: Record<string, any>
  ): Promise<T> {
    const apiKey = await this.getApiKey();
    
    if (!apiKey) {
      throw new Error('Vedic Astro API key not configured');
    }

    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.BASE_URL}${endpoint}`,
      params: {
        api_key: apiKey,
        ...params
      },
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await axios(config);
      
      if (response.data.status !== 200) {
        throw new Error(`API returned status ${response.data.status}`);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Vedic API Error: ${message}`);
      }
      throw error;
    }
  }

  // ============================================
  // Panchang APIs
  // ============================================

  /**
   * Get detailed Panchang for a specific date
   */
  static async getPanchang(params: PanchangParams) {
    return this.makeRequest('/panchang/panchang', {
      date: params.date,
      tz: params.tz,
      lat: params.lat,
      lon: params.lon,
      time: params.time || '05:20',
      lang: params.lang || 'en'
    });
  }

  /**
   * Get festivals and yogas for a date
   */
  static async getFestivalsYogas(params: PanchangParams) {
    return this.makeRequest('/panchang/panchang', {
      date: params.date,
      tz: params.tz,
      lat: params.lat,
      lon: params.lon,
      time: params.time || '05:20',
      lang: params.lang || 'en'
    });
  }

  /**
   * Get monthly Panchang
   */
  static async getMonthlyPanchang(params: MonthlyPanchangParams) {
    return this.makeRequest('/panchang/monthly-panchang', {
      date: params.date,
      tz: params.tz,
      lat: params.lat,
      lon: params.lon,
      time: params.time || '05:20',
      lang: params.lang || 'en'
    });
  }

  // ============================================
  // Moon & Sun APIs
  // ============================================

  /**
   * Get moon calendar for a month
   */
  static async getMoonCalendar(params: MoonCalendarParams) {
    return this.makeRequest('/panchang/moon-calendar', {
      date: params.date,
      tz: params.tz,
      lang: params.lang || 'en'
    });
  }

  /**
   * Get moon phase for a specific date
   */
  static async getMoonPhase(params: MoonCalendarParams) {
    return this.makeRequest('/panchang/moon-phase', {
      date: params.date,
      tz: params.tz,
      lang: params.lang || 'en'
    });
  }

  /**
   * Get moonrise time
   */
  static async getMoonrise(params: SunMoonParams) {
    return this.makeRequest('/panchang/moonrise', {
      date: params.date,
      tz: params.tz,
      lat: params.lat,
      lon: params.lon,
      time: params.time || '10:40',
      lang: params.lang || 'en'
    });
  }

  /**
   * Get moonset time
   */
  static async getMoonset(params: SunMoonParams) {
    return this.makeRequest('/panchang/moonset', {
      date: params.date,
      tz: params.tz,
      lat: params.lat,
      lon: params.lon,
      time: params.time || '10:40',
      lang: params.lang || 'en'
    });
  }

  /**
   * Get sunrise time
   */
  static async getSunrise(params: SunMoonParams) {
    return this.makeRequest('/panchang/sunrise', {
      date: params.date,
      tz: params.tz,
      lat: params.lat,
      lon: params.lon,
      time: params.time || '10:40',
      lang: params.lang || 'en'
    });
  }

  /**
   * Get sunset time
   */
  static async getSunset(params: SunMoonParams) {
    return this.makeRequest('/panchang/sunset', {
      date: params.date,
      tz: params.tz,
      lat: params.lat,
      lon: params.lon,
      time: params.time || '10:40',
      lang: params.lang || 'en'
    });
  }

  /**
   * Get solar noon time
   */
  static async getSolarNoon(params: SunMoonParams) {
    return this.makeRequest('/panchang/solarnoon', {
      date: params.date,
      tz: params.tz,
      lat: params.lat,
      lon: params.lon,
      time: params.time || '10:40',
      lang: params.lang || 'en'
    });
  }

  // ============================================
  // Muhurta APIs
  // ============================================

  /**
   * Get Hora Muhurta
   */
  static async getHoraMuhurta(params: HoraMuhurtaParams) {
    return this.makeRequest('/panchang/hora-muhurta', {
      date: params.date,
      tz: params.tz,
      lat: params.lat,
      lon: params.lon,
      time: params.time || '05:20',
      lang: params.lang || 'en'
    });
  }

  /**
   * Get Choghadiya Muhurta
   */
  static async getChoghadiyaMuhurta(params: ChoghadiyaMuhurtaParams) {
    return this.makeRequest('/panchang/choghadiya-muhurta', {
      date: params.date,
      tz: params.tz,
      lat: params.lat,
      lon: params.lon,
      time: params.time || '05:20',
      lang: params.lang || 'en'
    });
  }

  // ============================================
  // Planetary APIs
  // ============================================

  /**
   * Get retrograde information for a planet
   */
  static async getRetrogrades(params: RetrogradeParams) {
    return this.makeRequest('/panchang/retrogrades', {
      year: params.year,
      planet: params.planet,
      lang: params.lang || 'en'
    });
  }

  /**
   * Get planetary transits for a year
   */
  static async getPlanetaryTransits(params: TransitParams) {
    const year = params.year || new Date().getFullYear();
    return this.makeRequest('/panchang/planetary-transits', {
      year,
      lang: params.lang || 'en'
    });
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format date to DD/MM/YYYY
 */
export function formatDateForAPI(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get default location (can be customized based on user preference)
 */
export function getDefaultLocation() {
  return {
    lat: 28.6139, // Delhi
    lon: 77.2090,
    tz: 5.5
  };
}

/**
 * Parse date string DD/MM/YYYY to Date object
 */
export function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}