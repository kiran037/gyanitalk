import axios from 'axios';
import { prisma } from "@/lib/prisma";

/**
 * VedicGenAPI - Handles all kundli generation and analysis APIs
 * Separated from matching APIs to maintain clean architecture
 */
export class VedicGenAPI {
  private static BASE_URL = 'https://api.vedicastroapi.com/v3-json';

  private static async getApiKey(): Promise<string> {
    const flag = await prisma.systemflag.findFirst({
      where: { name: 'vedicAstroAPI' }
    });
    return flag?.value || process.env.VEDICASTRO_API_KEY || '';
  }

  // ===== CORE HOROSCOPE APIs =====
  
  static async getPlanetDetails(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/planet-details`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getAscendantReport(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/ascendant-report`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getPlanetReport(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    planet: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/planet-report`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getPersonalCharacteristics(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/personal-characteristics`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getDivisionalCharts(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    div: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/divisional-charts`, {
      params: { 
        ...params, 
        api_key: apiKey,
        response_type: 'planet_object'
      }
    });
    return response.data;
  }

  static async getChartImage(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
    div: string;
    style: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/chart-image`, {
      params: {
        ...params,
        api_key: apiKey,
        font_size: 24,
        font_style: 'roboto',
        color: '#ff3366',
        stroke: 3,
        colorful_planets: 1,
        format: 'svg',
        size: 500,
        show_degree: true
      }
    });
    return response.data;
  }

  static async getGeneralHouseReport(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    house: number;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/general-house-report`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  // ===== ASHTAKVARGA APIs =====

  static async getAshtakvarga(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/ashtakvarga`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getBinnashtakvarga(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    planet: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/binnashtakvarga`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getAshtakvargaChartImage(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    style: string;
    planet: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/ashtakvarga-chart-image`, {
      params: {
        ...params,
        api_key: apiKey,
        color: '#ff3366',
        size: 500,
        font_size: 24,
        format: 'svg'
      }
    });
    return response.data;
  }

  // ===== PLANETARY ASPECTS =====

  static async getPlanetaryAspects(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    type: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/planetary-aspects`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getPlanetsInHouses(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/planets-in-houses`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  // ===== WESTERN ASTROLOGY =====

  static async getWesternPlanets(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/western-planets`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  // ===== EXTENDED HOROSCOPE APIs (NEW) =====

  static async getShadBala(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/shad-bala`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getSadeSatiTable(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/sade-sati-table`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getCurrentSadeSati(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/current-sade-sati`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getKPHouses(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/kp-houses`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getKPPlanets(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/kp-planets`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getVarshapalYearChart(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/varshapal-year-chart`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getVarshapalDetails(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/varshapal-details`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getYogaList(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/yoga-list`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getExtendedKundliDetails(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/extended-kundli-details`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getFindMoonSign(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/find-moon-sign`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getFindSunSign(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/find-sun-sign`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getFindAscendant(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/find-ascendant`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getFriendship(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/friendship`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getGemSuggestion(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/gem-suggestion`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getNumeroTable(params: {
    name: string;
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/numero-table`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getRudrakshSuggestion(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/rudraksh-suggestion`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getAruthaPadas(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/arutha-padas`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getJaiminiKarakas(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/extended-horoscope/jaimini-karakas`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  // ===== DOSHA APIs =====

  static async getMangalDosh(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/dosha/mangal-dosh`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getKaalsarpDosh(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/dosha/kaalsarp-dosh`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getManglikDosh(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/dosha/manglik-dosh`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getPitraDosh(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/dosha/pitra-dosh`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  static async getPapasamaya(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/dosha/papasamaya`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  // ===== AI PREDICTIONS =====

  static async getAI12MonthPrediction(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/horoscope/ai-12-month-prediction`, {
      params: { ...params, api_key: apiKey }
    });
    return response.data;
  }

  // ===== PDF GENERATION =====
  
  static async generatePDF(params: {
    name: string;
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    pob: string;
    lang: string;
    pdfType: string;
    style: string;
  }): Promise<string> {
    const apiKey = await this.getApiKey();
    const response = await axios.get(`${this.BASE_URL}/pdf/horoscope-queue`, {
      params: {
        ...params,
        api_key: apiKey,
        color: '140'
      }
    });

    if (response.data.status === 200 && response.data.response) {
      return response.data.response;
    }
    throw new Error('PDF generation failed');
  }
}