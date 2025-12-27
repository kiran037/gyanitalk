// //old vedic api ts
// import axios from 'axios';
// import { prisma } from "@/lib/prisma";

// export class VedicAPI {
//   private static BASE_URL = 'https://api.vedicastroapi.com/v3-json';

//   private static async getApiKey(): Promise<string> {
//     const flag = await prisma.systemflag.findFirst({
//       where: { name: 'vedicAstroAPI' }
//     });
//     return flag?.value || process.env.VEDICASTRO_API_KEY || '';
//   }

//   // ===== BASIC KUNDLI APIs =====
//   static async getPlanetDetails(params: {
//     dob: string;
//     tob: string;
//     lat: number;
//     lon: number;
//     tz: string;
//     lang: string;
//   }) {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/horoscope/planet-details`, {
//         params: { ...params, api_key: apiKey }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Vedic API Error:', error);
//       throw new Error('Failed to fetch planet details');
//     }
//   }

//   static async getChartImage(params: {
//     dob: string;
//     tob: string;
//     lat: number;
//     lon: number;
//     tz: string;
//     lang: string;
//     div: string;
//     style: string;
//   }) {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/horoscope/chart-image`, {
//         params: {
//           ...params,
//           api_key: apiKey,
//           font_size: 24,
//           font_style: 'roboto',
//           color: '#F0D08D',
//           stroke: 3,
//           colorful_planets: 1
//         }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Chart API Error:', error);
//       throw new Error('Failed to generate chart');
//     }
//   }

//   // ===== MATCHING APIs =====
  
//   /**
//    * Basic Ashtakoot matching (North Indian - 36 points)
//    */
//   static async getAshtakootMatch(params: {
//     boy_dob: string;
//     boy_tob: string;
//     boy_lat: number;
//     boy_lon: number;
//     boy_tz: string;
//     girl_dob: string;
//     girl_tob: string;
//     girl_lat: number;
//     girl_lon: number;
//     girl_tz: string;
//     lang: string;
//   }) {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/matching/ashtakoot`, {
//         params: { ...params, api_key: apiKey }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Ashtakoot API Error:', error);
//       throw new Error('Failed to fetch ashtakoot match');
//     }
//   }

//   /**
//    * Ashtakoot with detailed planetary information
//    */
//   static async getAshtakootWithAstroDetails(params: {
//     boy_dob: string;
//     boy_tob: string;
//     boy_lat: number;
//     boy_lon: number;
//     boy_tz: string;
//     girl_dob: string;
//     girl_tob: string;
//     girl_lat: number;
//     girl_lon: number;
//     girl_tz: string;
//     lang: string;
//   }) {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/matching/ashtakoot-with-astro-details`, {
//         params: { ...params, api_key: apiKey }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Ashtakoot Astro API Error:', error);
//       throw new Error('Failed to fetch ashtakoot with astro details');
//     }
//   }

//   /**
//    * Basic Dashakoot matching (South Indian - 10 points)
//    */
//   static async getDashakootMatch(params: {
//     boy_dob: string;
//     boy_tob: string;
//     boy_lat: number;
//     boy_lon: number;
//     boy_tz: string;
//     girl_dob: string;
//     girl_tob: string;
//     girl_lat: number;
//     girl_lon: number;
//     girl_tz: string;
//     lang: string;
//   }) {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/matching/dashakoot`, {
//         params: { ...params, api_key: apiKey }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Dashakoot API Error:', error);
//       throw new Error('Failed to fetch dashakoot match');
//     }
//   }

//   /**
//    * Dashakoot with detailed planetary information
//    */
//   static async getDashakootWithAstroDetails(params: {
//     boy_dob: string;
//     boy_tob: string;
//     boy_lat: number;
//     boy_lon: number;
//     boy_tz: string;
//     girl_dob: string;
//     girl_tob: string;
//     girl_lat: number;
//     girl_lon: number;
//     girl_tz: string;
//     lang: string;
//   }) {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/matching/dashakoot-with-astro-details`, {
//         params: { ...params, api_key: apiKey }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Dashakoot Astro API Error:', error);
//       throw new Error('Failed to fetch dashakoot with astro details');
//     }
//   }

//   /**
//    * Aggregate match - comprehensive compatibility (100 points)
//    * Includes: Ashtakoot, Dashakoot, Mangal Dosha, Pitra Dosha, Kaal Sarp, etc.
//    */
//   static async getAggregateMatch(params: {
//     boy_dob: string;
//     boy_tob: string;
//     boy_lat: number;
//     boy_lon: number;
//     boy_tz: string;
//     girl_dob: string;
//     girl_tob: string;
//     girl_lat: number;
//     girl_lon: number;
//     girl_tz: string;
//     lang: string;
//   }) {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/matching/aggregate-match`, {
//         params: { ...params, api_key: apiKey }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Aggregate Match API Error:', error);
//       throw new Error('Failed to fetch aggregate match');
//     }
//   }

//   /**
//    * Rajju and Vedha Dosha details
//    */
//   static async getRajjuVedhaDetails(params: {
//     boy_dob: string;
//     boy_tob: string;
//     boy_lat: number;
//     boy_lon: number;
//     boy_tz: string;
//     girl_dob: string;
//     girl_tob: string;
//     girl_lat: number;
//     girl_lon: number;
//     girl_tz: string;
//     lang: string;
//   }) {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/matching/rajju-vedha-details`, {
//         params: { ...params, api_key: apiKey }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Rajju Vedha API Error:', error);
//       throw new Error('Failed to fetch rajju vedha details');
//     }
//   }

//   /**
//    * Papasamaya matching (Malefic influences)
//    */
//   static async getPapasamayaMatch(params: {
//     boy_dob: string;
//     boy_tob: string;
//     boy_lat: number;
//     boy_lon: number;
//     boy_tz: string;
//     girl_dob: string;
//     girl_tob: string;
//     girl_lat: number;
//     girl_lon: number;
//     girl_tz: string;
//     lang: string;
//   }) {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/matching/papasamaya-match`, {
//         params: { ...params, api_key: apiKey }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Papasamaya API Error:', error);
//       throw new Error('Failed to fetch papasamaya match');
//     }
//   }

//   /**
//    * Nakshatra-based matching
//    */
//   static async getNakshatraMatch(params: {
//     boy_star: number;
//     girl_star: number;
//     lang: string;
//   }) {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/matching/nakshatra-match`, {
//         params: { ...params, api_key: apiKey }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Nakshatra Match API Error:', error);
//       throw new Error('Failed to fetch nakshatra match');
//     }
//   }

//   /**
//    * Western zodiac compatibility
//    */
//   static async getWesternMatch(params: {
//     boy_sign: number;
//     girl_sign: number;
//     lang: string;
//   }) {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/matching/western-match`, {
//         params: { ...params, api_key: apiKey }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Western Match API Error:', error);
//       throw new Error('Failed to fetch western match');
//     }
//   }

//   // ===== PDF GENERATION =====
//   static async generatePDF(params: {
//     name: string;
//     dob: string;
//     tob: string;
//     lat: number;
//     lon: number;
//     tz: string;
//     pob: string;
//     lang: string;
//     pdfType: string;
//     style: string;
//   }): Promise<string> {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/pdf/horoscope-queue`, {
//         params: {
//           ...params,
//           api_key: apiKey,
//           color: '140'
//         }
//       });

//       if (response.data.status === 200 && response.data.response) {
//         return response.data.response;
//       }
      
//       throw new Error('PDF generation failed');
//     } catch (error) {
//       console.error('PDF API Error:', error);
//       throw new Error('Failed to generate PDF');
//     }
//   }

//   static async generateMatchingPDF(params: {
//     boy_name: string;
//     boy_dob: string;
//     boy_tob: string;
//     boy_lat: number;
//     boy_lon: number;
//     boy_tz: string;
//     boy_pob: string;
//     girl_name: string;
//     girl_dob: string;
//     girl_tob: string;
//     girl_lat: number;
//     girl_lon: number;
//     girl_tz: string;
//     girl_pob: string;
//     lang: string;
//     style: string;
//   }): Promise<string> {
//     const apiKey = await this.getApiKey();
    
//     try {
//       const response = await axios.get(`${this.BASE_URL}/pdf/matching-queue`, {
//         params: {
//           ...params,
//           api_key: apiKey,
//           color: '140'
//         }
//       });

//       if (response.data.status === 200 && response.data.response) {
//         return response.data.response;
//       }
      
//       throw new Error('Matching PDF generation failed');
//     } catch (error) {
//       console.error('Matching PDF API Error:', error);
//       throw new Error('Failed to generate matching PDF');
//     }
//   }
// }

// src/lib/kundli/vedic-api.ts - WORKING VERSION (Only Validated Endpoints)
import axios from 'axios';
import { prisma } from "@/lib/prisma";

export class VedicAPI {
  private static BASE_URL = 'https://api.vedicastroapi.com/v3-json';

  private static async getApiKey(): Promise<string> {
    const flag = await prisma.systemflag.findFirst({
      where: { name: 'vedicAstroAPI' }
    });
    return flag?.value || process.env.VEDICASTRO_API_KEY || '';
  }

  // ===== BASIC KUNDLI APIs (VALIDATED & WORKING) =====
  
  static async getPlanetDetails(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    try {
      const response = await axios.get(`${this.BASE_URL}/horoscope/planet-details`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Planet Details API Error:', error);
      throw new Error('Failed to fetch planet details');
    }
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
    try {
      const response = await axios.get(`${this.BASE_URL}/horoscope/ascendant-report`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Ascendant Report API Error:', error);
      throw new Error('Failed to fetch ascendant report');
    }
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
    try {
      const response = await axios.get(`${this.BASE_URL}/horoscope/planet-report`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Planet Report API Error:', error);
      throw new Error('Failed to fetch planet report');
    }
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
    try {
      const response = await axios.get(`${this.BASE_URL}/horoscope/personal-characteristics`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Personal Characteristics API Error:', error);
      throw new Error('Failed to fetch personal characteristics');
    }
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
    try {
      const response = await axios.get(`${this.BASE_URL}/horoscope/divisional-charts`, {
        params: { 
          ...params, 
          api_key: apiKey,
          response_type: 'planet_object'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Divisional Charts API Error:', error);
      throw new Error('Failed to fetch divisional charts');
    }
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
    try {
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
    } catch (error) {
      console.error('Chart Image API Error:', error);
      throw new Error('Failed to generate chart');
    }
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
    try {
      const response = await axios.get(`${this.BASE_URL}/horoscope/general-house-report`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('General House Report API Error:', error);
      throw new Error('Failed to fetch general house report');
    }
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
    try {
      const response = await axios.get(`${this.BASE_URL}/horoscope/ashtakvarga`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Ashtakvarga API Error:', error);
      throw new Error('Failed to fetch ashtakvarga');
    }
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
    try {
      const response = await axios.get(`${this.BASE_URL}/horoscope/binnashtakvarga`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Binnashtakvarga API Error:', error);
      throw new Error('Failed to fetch binnashtakvarga');
    }
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
    try {
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
    } catch (error) {
      console.error('Ashtakvarga Chart API Error:', error);
      throw new Error('Failed to generate ashtakvarga chart');
    }
  }

  // ===== AI & PREDICTIONS =====

  static async getAI12MonthPrediction(params: {
    dob: string;
    tob: string;
    lat: number;
    lon: number;
    tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    try {
      const response = await axios.get(`${this.BASE_URL}/horoscope/ai-12-month-prediction`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('AI Prediction API Error:', error);
      throw new Error('Failed to fetch AI predictions');
    }
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
    try {
      const response = await axios.get(`${this.BASE_URL}/horoscope/planetary-aspects`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Planetary Aspects API Error:', error);
      throw new Error('Failed to fetch planetary aspects');
    }
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
    try {
      const response = await axios.get(`${this.BASE_URL}/horoscope/planets-in-houses`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Planets in Houses API Error:', error);
      throw new Error('Failed to fetch planets in houses');
    }
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
    try {
      const response = await axios.get(`${this.BASE_URL}/horoscope/western-planets`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Western Planets API Error:', error);
      throw new Error('Failed to fetch western planets');
    }
  }

  // ===== MATCHING APIs (PRESERVED FROM OLD VERSION - ALL WORKING) =====
  
  static async getAshtakootMatch(params: {
    boy_dob: string;
    boy_tob: string;
    boy_lat: number;
    boy_lon: number;
    boy_tz: string;
    girl_dob: string;
    girl_tob: string;
    girl_lat: number;
    girl_lon: number;
    girl_tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    try {
      const response = await axios.get(`${this.BASE_URL}/matching/ashtakoot`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Ashtakoot API Error:', error);
      throw new Error('Failed to fetch ashtakoot match');
    }
  }

  static async getAshtakootWithAstroDetails(params: {
    boy_dob: string;
    boy_tob: string;
    boy_lat: number;
    boy_lon: number;
    boy_tz: string;
    girl_dob: string;
    girl_tob: string;
    girl_lat: number;
    girl_lon: number;
    girl_tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    try {
      const response = await axios.get(`${this.BASE_URL}/matching/ashtakoot-with-astro-details`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Ashtakoot Astro API Error:', error);
      throw new Error('Failed to fetch ashtakoot with astro details');
    }
  }

  static async getDashakootMatch(params: {
    boy_dob: string;
    boy_tob: string;
    boy_lat: number;
    boy_lon: number;
    boy_tz: string;
    girl_dob: string;
    girl_tob: string;
    girl_lat: number;
    girl_lon: number;
    girl_tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    try {
      const response = await axios.get(`${this.BASE_URL}/matching/dashakoot`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Dashakoot API Error:', error);
      throw new Error('Failed to fetch dashakoot match');
    }
  }

  static async getDashakootWithAstroDetails(params: {
    boy_dob: string;
    boy_tob: string;
    boy_lat: number;
    boy_lon: number;
    boy_tz: string;
    girl_dob: string;
    girl_tob: string;
    girl_lat: number;
    girl_lon: number;
    girl_tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    try {
      const response = await axios.get(`${this.BASE_URL}/matching/dashakoot-with-astro-details`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Dashakoot Astro API Error:', error);
      throw new Error('Failed to fetch dashakoot with astro details');
    }
  }

  static async getAggregateMatch(params: {
    boy_dob: string;
    boy_tob: string;
    boy_lat: number;
    boy_lon: number;
    boy_tz: string;
    girl_dob: string;
    girl_tob: string;
    girl_lat: number;
    girl_lon: number;
    girl_tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    try {
      const response = await axios.get(`${this.BASE_URL}/matching/aggregate-match`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Aggregate Match API Error:', error);
      throw new Error('Failed to fetch aggregate match');
    }
  }

  static async getRajjuVedhaDetails(params: {
    boy_dob: string;
    boy_tob: string;
    boy_lat: number;
    boy_lon: number;
    boy_tz: string;
    girl_dob: string;
    girl_tob: string;
    girl_lat: number;
    girl_lon: number;
    girl_tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    try {
      const response = await axios.get(`${this.BASE_URL}/matching/rajju-vedha-details`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Rajju Vedha API Error:', error);
      throw new Error('Failed to fetch rajju vedha details');
    }
  }

  static async getPapasamayaMatch(params: {
    boy_dob: string;
    boy_tob: string;
    boy_lat: number;
    boy_lon: number;
    boy_tz: string;
    girl_dob: string;
    girl_tob: string;
    girl_lat: number;
    girl_lon: number;
    girl_tz: string;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    try {
      const response = await axios.get(`${this.BASE_URL}/matching/papasamaya-match`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Papasamaya API Error:', error);
      throw new Error('Failed to fetch papasamaya match');
    }
  }

  static async getNakshatraMatch(params: {
    boy_star: number;
    girl_star: number;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    try {
      const response = await axios.get(`${this.BASE_URL}/matching/nakshatra-match`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Nakshatra Match API Error:', error);
      throw new Error('Failed to fetch nakshatra match');
    }
  }

  static async getWesternMatch(params: {
    boy_sign: number;
    girl_sign: number;
    lang: string;
  }) {
    const apiKey = await this.getApiKey();
    try {
      const response = await axios.get(`${this.BASE_URL}/matching/western-match`, {
        params: { ...params, api_key: apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Western Match API Error:', error);
      throw new Error('Failed to fetch western match');
    }
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
    try {
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
    } catch (error) {
      console.error('PDF API Error:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  static async generateMatchingPDF(params: {
    boy_name: string;
    boy_dob: string;
    boy_tob: string;
    boy_lat: number;
    boy_lon: number;
    boy_tz: string;
    boy_pob: string;
    girl_name: string;
    girl_dob: string;
    girl_tob: string;
    girl_lat: number;
    girl_lon: number;
    girl_tz: string;
    girl_pob: string;
    lang: string;
    style: string;
  }): Promise<string> {
    const apiKey = await this.getApiKey();
    try {
      const response = await axios.get(`${this.BASE_URL}/pdf/matching-queue`, {
        params: {
          ...params,
          api_key: apiKey,
          color: '140'
        }
      });

      if (response.data.status === 200 && response.data.response) {
        return response.data.response;
      }
      throw new Error('Matching PDF generation failed');
    } catch (error) {
      console.error('Matching PDF API Error:', error);
      throw new Error('Failed to generate matching PDF');
    }
  }
}