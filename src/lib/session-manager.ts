// ///Users/xeoren/Desktop/gyanitallk-admin/src/lib/session-manager.ts
// import { prisma } from "@/lib/prisma";

// import { v4 as uuidv4 } from 'uuid';

// export class SessionManager {
//   private static SESSION_PREFIX = 'kundli_session_';
//   private static SESSION_EXPIRY_HOURS = 24;

//   static async createSession(
//     kundliData: any,
//     ipAddress: string,
//     intakeFormId?: number,
//     userId?: number
//   ): Promise<string> {
//     const sessionId = uuidv4();
//     const expiresAt = new Date();
//     expiresAt.setHours(expiresAt.getHours() + this.SESSION_EXPIRY_HOURS);
//     await prisma.systemflag.create({
//       data: {
//         name: `${this.SESSION_PREFIX}${sessionId}`,
//         valueType: 'json',
//         value: JSON.stringify({
//           kundliData,
//           ipAddress,
//           userId,
//           intakeFormId,
//           expiresAt: expiresAt.toISOString()
//         }),
//         isActive: '1',
//         isDelete: '0',
//         description: 'Temporary kundli session',
//         flagGroupId: 1 // ✅ REQUIRED
//       }
//     });

//     return sessionId;
//   }

//   static async getSession(sessionId: string): Promise<any | null> {
//     const flag = await prisma.systemflag.findFirst({
//       where: { name: `${this.SESSION_PREFIX}${sessionId}` }
//     });

//     if (!flag) return null;

//     const data = JSON.parse(flag.value || '{}');
//     const expiresAt = new Date(data.expiresAt);

//     if (new Date() >= expiresAt) {
//       await this.deleteSession(sessionId);
//       return null;
//     }

//     return data;
//   }

//   static async deleteSession(sessionId: string): Promise<void> {
//     await prisma.systemflag.deleteMany({
//       where: { name: `${this.SESSION_PREFIX}${sessionId}` }
//     });
//   }

//   static async cleanExpiredSessions(): Promise<void> {
//     const allSessions = await prisma.systemflag.findMany({
//       where: { name: { startsWith: this.SESSION_PREFIX } }
//     });

//     const now = new Date();
//     for (const session of allSessions) {
//       try {
//         const data = JSON.parse(session.value || '{}');
//         const expiresAt = new Date(data.expiresAt);

//         if (now >= expiresAt) {
//           await prisma.systemflag.delete({ where: { id: session.id } });
//         }
//       } catch (error) {
//         console.error('Error cleaning session:', error);
//       }
//     }
//   }
// }

// src/lib/session-manager.ts - FIXED WITH DATA OPTIMIZATION
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';

export class SessionManager {
  private static SESSION_PREFIX = 'kundli_session_';
  private static SESSION_EXPIRY_HOURS = 24;
  private static MAX_VALUE_LENGTH = 60000; // Safe limit for most databases

  static async createSession(
    kundliData: any,
    ipAddress: string,
    intakeFormId?: number,
    userId?: number
  ): Promise<string> {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.SESSION_EXPIRY_HOURS);

    // Optimize the kundli data to reduce size
    const optimizedKundliData = this.optimizeKundliData(kundliData);

    const sessionData = {
      kundliData: optimizedKundliData,
      ipAddress,
      userId,
      intakeFormId,
      expiresAt: expiresAt.toISOString()
    };

    const dataString = JSON.stringify(sessionData);

    // If data is too large, store minimal version
    const finalData = dataString.length > this.MAX_VALUE_LENGTH
      ? this.createMinimalSession(kundliData, ipAddress, userId, intakeFormId, expiresAt)
      : sessionData;

    await prisma.systemflag.create({
      data: {
        name: `${this.SESSION_PREFIX}${sessionId}`,
        valueType: 'json',
        value: JSON.stringify(finalData),
        isActive: '1',
        isDelete: '0',
        description: 'Temporary kundli session',
        flagGroupId: 1
      }
    });

    return sessionId;
  }

  /**
   * Optimize kundli data by keeping only essential information
   */
  private static optimizeKundliData(data: any): any {
    if (!data) return data;

    return {
      basicDetails: data.basicDetails,

      // Simplified planet details - handle both array and object
      planetDetails: Array.isArray(data.planetDetails)
        ? data.planetDetails.slice(0, 12).map((planet: any) => ({
            name: planet.name,
            sign: planet.sign,
            degree: planet.full_degree || planet.degree,
            house: planet.house,
            isRetro: planet.is_retro || planet.isRetro
          }))
        : data.planetDetails, // Keep as is if not array

      // Keep only the report text, not full object
      ascendantReport: data.ascendantReport ? {
        report: typeof data.ascendantReport.report === 'string' 
          ? data.ascendantReport.report.substring(0, 500) 
          : data.ascendantReport.report
      } : null,

      // Keep summary only
      personalCharacteristics: data.personalCharacteristics ? {
        name: data.personalCharacteristics.name,
        sideralSunSign: data.personalCharacteristics.SideralSunSign || data.personalCharacteristics.sideralSunSign
      } : null,

      // Keep chart image URLs only, not full SVG
      charts: {
        d1: typeof data.charts?.d1 === 'string' && data.charts.d1.length > 1000
          ? '[SVG_DATA]' // Replace large SVG with placeholder
          : data.charts?.d1,
        d9: typeof data.charts?.d9 === 'string' && data.charts.d9.length > 1000
          ? '[SVG_DATA]'
          : data.charts?.d9
      },

      // Keep only sarvashtakvarga summary
      ashtakvarga: data.ashtakvarga ? {
        sarvashtakvarga: data.ashtakvarga.sarvashtakvarga
      } : null,

      // Simplified planetary aspects - handle arrays safely
      planetaryAspects: Array.isArray(data.planetaryAspects)
        ? data.planetaryAspects.slice(0, 10)
        : data.planetaryAspects,

      // Simplified planets in houses - handle arrays safely
      planetsInHouses: Array.isArray(data.planetsInHouses)
        ? data.planetsInHouses.slice(0, 12)
        : data.planetsInHouses,

      // Keep AI prediction summary only
      aiPrediction: data.aiPrediction ? {
        prediction: typeof data.aiPrediction.prediction === 'string'
          ? data.aiPrediction.prediction.substring(0, 1000)
          : data.aiPrediction.prediction
      } : null,

      language: data.language
    };
  }

  /**
   * Create minimal session when data is still too large
   */
  private static createMinimalSession(
    kundliData: any,
    ipAddress: string,
    userId: number | undefined,
    intakeFormId: number | undefined,
    expiresAt: Date
  ): any {
    // Safely handle planetDetails whether it's array or object
    let minimalPlanets = null;
    if (Array.isArray(kundliData.planetDetails)) {
      minimalPlanets = kundliData.planetDetails.slice(0, 9).map((p: any) => ({
        name: p.name,
        sign: p.sign,
        house: p.house
      }));
    } else if (kundliData.planetDetails) {
      minimalPlanets = kundliData.planetDetails;
    }

    return {
      kundliData: {
        basicDetails: kundliData.basicDetails,
        planetDetails: minimalPlanets,
        charts: {
          d1: '[DATA_TOO_LARGE]',
          d9: '[DATA_TOO_LARGE]'
        },
        language: kundliData.language
      },
      ipAddress,
      userId,
      intakeFormId,
      expiresAt: expiresAt.toISOString(),
      note: 'Minimal session - full data stored in kundalis table'
    };
  }

  static async getSession(sessionId: string): Promise<any | null> {
    const flag = await prisma.systemflag.findFirst({
      where: { name: `${this.SESSION_PREFIX}${sessionId}` }
    });

    if (!flag) return null;

    const data = JSON.parse(flag.value || '{}');
    const expiresAt = new Date(data.expiresAt);

    if (new Date() >= expiresAt) {
      await this.deleteSession(sessionId);
      return null;
    }

    return data;
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await prisma.systemflag.deleteMany({
      where: { name: `${this.SESSION_PREFIX}${sessionId}` }
    });
  }

  static async cleanExpiredSessions(): Promise<void> {
    const allSessions = await prisma.systemflag.findMany({
      where: { name: { startsWith: this.SESSION_PREFIX } }
    });

    const now = new Date();
    for (const session of allSessions) {
      try {
        const data = JSON.parse(session.value || '{}');
        const expiresAt = new Date(data.expiresAt);

        if (now >= expiresAt) {
          await prisma.systemflag.delete({ where: { id: session.id } });
        }
      } catch (error) {
        console.error('Error cleaning session:', error);
      }
    }
  }
}