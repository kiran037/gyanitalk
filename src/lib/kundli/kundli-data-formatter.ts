export class KundliDataFormatter {

  static extractData(result: PromiseSettledResult<any>, logName?: string): any {
    if (result.status === 'fulfilled' && result.value) {
      const data = result.value.response !== undefined ? result.value.response : result.value;
      
      if (logName) {

      }
      return data || null;
    }
    
    if (logName) {
      console.warn(`✗ ${logName}: Failed or Empty -`, result.status === 'rejected' ? result.reason?.message : 'No value');
    }
    return null;
  }

  /**
   * Format basic details for response
   */
  static formatBasicDetails(birthDetails: any) {
    return {
      name: birthDetails.name,
      birthDate: birthDetails.birthDate,
      birthTime: birthDetails.birthTime,
      birthPlace: birthDetails.birthPlace,
      latitude: birthDetails.latitude,
      longitude: birthDetails.longitude,
      gender: birthDetails.gender,
      timezone: birthDetails.timezone
    };
  }

  /**
   * Format planet details with analysis
   */
  static formatPlanetDetails(planetData: any) {
    if (!planetData) return null;
    
    // V3 often returns an object map { "Sun": {...}, "Moon": {...} }
    // We convert values to an array for counting
    const planets = Object.values(planetData);
    
    return {
      planets: planetData,
      summary: {
        totalPlanets: planets.length,
        retrograde: planets.filter((p: any) => p?.isRetro === 'true' || p?.retro === true).length,
        exalted: planets.filter((p: any) => p?.basic_avastha?.toLowerCase() === 'exalted').length,
        debilitated: planets.filter((p: any) => p?.basic_avastha?.toLowerCase() === 'debilitated').length
      }
    };
  }

  /**
   * Format yoga list with categorization
   */
  static formatYogaList(yogaData: any) {
    if (!yogaData) return null;
    
    // Handle case where yogas_list might be missing
    const yogas = yogaData.yogas_list || [];
    
    return {
      total: yogaData.yogas_count || yogas.length,
      rajaYogaCount: yogaData.raja_yoga_count || 0,
      dhanaYogaCount: yogaData.dhana_yoga_count || 0,
      daridraYogaCount: yogaData.daridra_yoga_count || 0,
      yogas: yogas.map((yoga: any) => ({
        name: yoga.yoga || yoga.name,
        meaning: yoga.meaning || yoga.description,
        strength: yoga.strength_in_percentage,
        planets: yoga.planets_involved,
        houses: yoga.houses_involved
      })),
      categorized: {
        beneficial: yogas.filter((y: any) => 
          !y.yoga?.toLowerCase().includes('daridra') && 
          !y.yoga?.toLowerCase().includes('dosha')
        ),
        challenging: yogas.filter((y: any) => 
          y.yoga?.toLowerCase().includes('daridra') || 
          y.yoga?.toLowerCase().includes('dosha')
        )
      }
    };
  }

  /**
   * Format dosha information
   */
  static formatDoshas(doshaResults: any) {
    return {
      mangal: {
        present: doshaResults.mangal?.is_dosha_present || false,
        score: doshaResults.mangal?.score || 0,
        factors: doshaResults.mangal?.factors || null,
        response: doshaResults.mangal?.bot_response || null
      },
      kaalsarp: {
        present: doshaResults.kaalsarp?.is_dosha_present || false,
        type: doshaResults.kaalsarp?.dosha_type || null,
        direction: doshaResults.kaalsarp?.dosha_direction || null,
        axis: doshaResults.kaalsarp?.rahu_ketu_axis || null,
        response: doshaResults.kaalsarp?.bot_response || null,
        remedies: doshaResults.kaalsarp?.remedies || []
      },
      manglik: {
        present: doshaResults.manglik?.manglik_by_mars || false,
        score: doshaResults.manglik?.score || 0,
        factors: doshaResults.manglik?.factors || [],
        bySaturn: doshaResults.manglik?.manglik_by_saturn || false,
        byRahuKetu: doshaResults.manglik?.manglik_by_rahuketu || false,
        aspects: doshaResults.manglik?.aspects || [],
        response: doshaResults.manglik?.bot_response || null
      },
      pitra: {
        present: doshaResults.pitra?.is_dosha_present || false,
        response: doshaResults.pitra?.bot_response || null,
        effects: doshaResults.pitra?.effects || [],
        remedies: doshaResults.pitra?.remedies || []
      },
      papasamaya: doshaResults.papasamaya || null
    };
  }

  /**
   * Format sade sati information
   */
  static formatSadeSati(sadeSatiData: any) {
    const table = sadeSatiData.table || [];
    const current = sadeSatiData.current || null;
    
    return {
      table: table,
      current: current ? {
        dateConsidered: current.date_considered,
        periodType: current.shani_period_type,
        description: current.description,
        botResponse: current.bot_response,
        saturnRetrograde: current.saturn_retrograde,
        age: current.age,
        remedies: current.remedies || []
      } : null,
      periods: {
        past: table.filter((p: any) => new Date(p.end_date) < new Date()),
        current: table.filter((p: any) => {
          const start = new Date(p.start_date);
          const end = new Date(p.end_date);
          const now = new Date();
          return start <= now && now <= end;
        }),
        future: table.filter((p: any) => new Date(p.start_date) > new Date())
      }
    };
  }

  /**
   * Format AI predictions by category
   */
  static formatAIPredictions(aiData: any) {
    if (!aiData || !Array.isArray(aiData)) return null;
    
    return aiData.map(month => ({
      month: month.specifications?.start_month,
      startDate: month.specifications?.start_date,
      endDate: month.specifications?.end_date,
      dasha: month.specifications?.dasha,
      dashaEnd: month.specifications?.dasha_end,
      dashaInflection: month.specifications?.dasha_inflection,
      predictions: {
        relationship: month.predictions?.relationship,
        education: month.predictions?.education,
        career: month.predictions?.career,
        finance: month.predictions?.finance,
        health: month.predictions?.health,
        family: month.predictions?.family
      }
    }));
  }

  /**
   * Format suggestions (gems and rudraksh)
   */
  static formatSuggestions(gemData: any, rudrakshData: any) {
    return {
      gem: gemData ? {
        name: gemData.name,
        otherName: gemData.other_name,
        planet: gemData.planet,
        description: gemData.description,
        goodResults: gemData.good_results || [],
        diseasesCure: gemData.diseases_cure || [],
        finger: gemData.finger,
        weight: gemData.weight,
        day: gemData.day,
        metal: gemData.metal,
        substitute: gemData.substitute || [],
        notToWearWith: gemData.not_to_wear_with || [],
        timeToWear: gemData.time_to_wear,
        methods: gemData.methods,
        mantra: gemData.mantra
      } : null,
      rudraksh: rudrakshData ? {
        name: rudrakshData.name,
        mukhiForDisease: rudrakshData.mukhi_for_disease_cure || [],
        mukhiForMoney: rudrakshData.mukhi_for_money || [],
        description: rudrakshData.mukhi_description,
        response: rudrakshData.bot_response
      } : null
    };
  }

  /**
   * Format complete kundli data structure
   */
  static formatCompleteKundli(
    birthDetails: any,
    allApiResults: any[],
    language: string
  ) {
    // Destructuring MUST match the Promise.all array order in route.ts exactly
    const [
      planetDetails,
      ascendantReport,
      personalCharacteristics,
      divisionalChartsD1,
      divisionalChartsD9,
      chartImageD1,
      chartImageD9,
      ashtakvarga,
      planetaryAspects,
      planetsInHouses,
      westernPlanets,
      shadBala,
      sadeSatiTable,
      currentSadeSati,
      kpHouses,
      kpPlanets,
      varshapalYearChart,
      varshapalDetails,
      yogaList,
      extendedKundliDetails,
      moonSign,
      sunSign,
      ascendant,
      friendship,
      gemSuggestion,
      rudrakshSuggestion,
      aruthaPadas,
      jaiminiKarakas,
      mangalDosh,
      kaalsarpDosh,
      manglikDosh,
      pitraDosh,
      papasamaya,
      aiPrediction,
      numeroTable
    ] = allApiResults;

    // Extract basic signs once
    const moonSignData = this.extractData(moonSign, 'Moon Sign');
    const sunSignData = this.extractData(sunSign, 'Sun Sign');
    const ascendantData = this.extractData(ascendant, 'Ascendant');

    return {
      basicDetails: {
        ...this.formatBasicDetails(birthDetails),
        // Handle different API response structures for signs
        moonSign: moonSignData?.moon_sign || moonSignData?.sign || null,
        sunSign: sunSignData?.sun_sign || sunSignData?.sign || null,
        ascendant: ascendantData?.ascendant || ascendantData?.sign || null,
      },
      
      // Core horoscope
      planetDetails: this.formatPlanetDetails(this.extractData(planetDetails, 'Planet Details')),
      
      // Ascendant report might be an array or object
      ascendantReport: Array.isArray(this.extractData(ascendantReport)) 
        ? this.extractData(ascendantReport)[0] 
        : this.extractData(ascendantReport, 'Ascendant Report'),
        
      personalCharacteristics: this.extractData(personalCharacteristics, 'Personal Characteristics'),
      
      // Charts
      divisionalCharts: {
        d1: this.extractData(divisionalChartsD1, 'D1 Chart'),
        d9: this.extractData(divisionalChartsD9, 'D9 Chart')
      },
      charts: {
        d1: this.extractData(chartImageD1, 'D1 Image')?.svg || this.extractData(chartImageD1)?.image_url,
        d9: this.extractData(chartImageD9, 'D9 Image')?.svg || this.extractData(chartImageD9)?.image_url
      },
      
      // Ashtakvarga
      ashtakvarga: this.extractData(ashtakvarga, 'Ashtakvarga'),
      
      // Planetary information
      planetaryAspects: this.extractData(planetaryAspects, 'Planetary Aspects'),
      planetsInHouses: this.extractData(planetsInHouses, 'Planets in Houses'),
      
      // Western astrology
      westernPlanets: this.extractData(westernPlanets, 'Western Planets'),
      
      // Extended horoscope
      shadBala: this.extractData(shadBala, 'Shad Bala'),
      sadeSati: this.formatSadeSati({
        table: this.extractData(sadeSatiTable, 'Sade Sati Table'),
        current: this.extractData(currentSadeSati, 'Current Sade Sati')
      }),
      kpSystem: {
        houses: this.extractData(kpHouses, 'KP Houses'),
        planets: this.extractData(kpPlanets, 'KP Planets')
      },
      varshapal: {
        yearChart: this.extractData(varshapalYearChart, 'Varshapal Year Chart'),
        details: this.extractData(varshapalDetails, 'Varshapal Details')
      },
      yogaList: this.formatYogaList(this.extractData(yogaList, 'Yoga List')),
      extendedDetails: this.extractData(extendedKundliDetails, 'Extended Kundli Details'),
      
      // Friendship and compatibility
      friendship: this.extractData(friendship, 'Friendship'),
      
      // Suggestions
      suggestions: this.formatSuggestions(
        this.extractData(gemSuggestion, 'Gem Suggestion'),
        this.extractData(rudrakshSuggestion, 'Rudraksh Suggestion')
      ),
      
      // Jaimini and Arutha
      jaimini: {
        karakas: this.extractData(jaiminiKarakas, 'Jaimini Karakas'),
        aruthaPadas: this.extractData(aruthaPadas, 'Arutha Padas')
      },
      
      // Doshas
      doshas: this.formatDoshas({
        mangal: this.extractData(mangalDosh, 'Mangal Dosh'),
        kaalsarp: this.extractData(kaalsarpDosh, 'Kaalsarp Dosh'),
        manglik: this.extractData(manglikDosh, 'Manglik Dosh'),
        pitra: this.extractData(pitraDosh, 'Pitra Dosh'),
        papasamaya: this.extractData(papasamaya, 'Papasamaya')
      }),
      
      // AI Predictions
      aiPrediction: this.formatAIPredictions(this.extractData(aiPrediction, 'AI Prediction')),
      
      // Numerology
      numerology: this.extractData(numeroTable, 'Numero Table'),
      
      // Metadata
      language,
      generatedAt: new Date().toISOString(),
      version: '2.0.0'
    };
  }
}