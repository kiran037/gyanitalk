
import axios from 'axios';
import { prisma } from "@/lib/prisma";

export class VedicGenAPI {
  private static BASE_URL = 'https://api.vedicastroapi.com/v3-json';

  private static async getApiKey(): Promise<string> {
    const flag = await prisma.systemflag.findFirst({
      where: { name: 'vedicAstroAPI' }
    });
    return flag?.value || process.env.VEDICASTRO_API_KEY || '';
  }

  // ===== CORE HOROSCOPE APIs (/horoscope) =====
  
  static async getPlanetDetails(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/planet-details`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getAscendantReport(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/ascendant-report`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getPersonalCharacteristics(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/personal-characteristics`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getDivisionalCharts(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/divisional-charts`, { params: { ...params, api_key: apiKey, response_type: 'planet_object' } })).data;
  }

  static async getChartImage(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/chart-image`, { params: { ...params, api_key: apiKey, color: '#ff3366', stroke: 2, format: 'svg' } })).data;
  }

  // ✅ ADDED MISSING METHOD
  static async getAshtakvargaChartImage(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/ashtakvarga-chart`, { 
      params: { 
        ...params, 
        api_key: apiKey,
        color: '#ff3366',
        size: 500,
        font_size: 24,
        format: 'svg'
      } 
    })).data;
  }

  // ✅ ADDED USEFUL RELATED METHOD
  static async getBinnashtakvarga(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/binnashtakvarga`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getAshtakvarga(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/ashtakvarga`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getPlanetaryAspects(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/planetary-aspects`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getPlanetsInHouses(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/planets-in-houses`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getWesternPlanets(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/western-planets`, { params: { ...params, api_key: apiKey } })).data;
  }

  // ===== EXTENDED HOROSCOPE APIs (/extended-horoscope) =====

  static async getShadBala(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/extended-horoscope/shad-bala`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getSadeSatiTable(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/sade-sati-table`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getCurrentSadeSati(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/current-sade-sati`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getYogaList(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/yoga-list`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getKPHouses(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/extended-horoscope/kp-houses`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getKPPlanets(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/extended-horoscope/kp-planets`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getVarshapalYearChart(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/extended-horoscope/varshapal-year-chart`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getVarshapalDetails(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/extended-horoscope/varshapal-details`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getExtendedKundliDetails(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/extended-horoscope/extended-kundli-details`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getFindMoonSign(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/find-moon-sign`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getFindSunSign(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/find-sun-sign`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getFindAscendant(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/find-ascendant`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getFriendship(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/extended-horoscope/friendship`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getGemSuggestion(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/extended-horoscope/gem-suggestion`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getRudrakshSuggestion(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/extended-horoscope/rudraksh-suggestion`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getNumeroTable(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/extended-horoscope/numero-table`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getAruthaPadas(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/extended-horoscope/arutha-padas`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getJaiminiKarakas(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/extended-horoscope/jaimini-karakas`, { params: { ...params, api_key: apiKey } })).data;
  }

  // ===== DOSHA APIs (/dosha) =====

  static async getMangalDosh(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/dosha/mangal-dosh`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getKaalsarpDosh(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/dosha/kaalsarp-dosh`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getManglikDosh(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/dosha/manglik-dosh`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getPitraDosh(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/dosha/pitra-dosh`, { params: { ...params, api_key: apiKey } })).data;
  }

  static async getPapasamaya(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/dosha/papasamaya`, { params: { ...params, api_key: apiKey } })).data;
  }

  // ===== AI PREDICTIONS =====

  static async getAI12MonthPrediction(params: any) {
    const apiKey = await this.getApiKey();
    return (await axios.get(`${this.BASE_URL}/horoscope/ai-12-month-prediction`, { params: { ...params, api_key: apiKey } })).data;
  }
}