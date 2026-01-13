// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { verifyUserJWT } from "@/lib/auth";
// import { verifySession } from "@/lib/auth/session";

// export async function DELETE(
//   request: NextRequest,
//   props: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const params = await props.params;
//     const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    
//     if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

//     let jwtPayload;
//     try { jwtPayload = await verifyUserJWT(token); } catch { return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 }); }

//     if (jwtPayload?.sessionId) {
//       const sessionCheck = await verifySession(jwtPayload.sessionId as string);
//       if (!sessionCheck.valid) return NextResponse.json({ success: false, error: "Session Expired" }, { status: 401 });
//     }

//     const userId = Number(jwtPayload.userId); 
//     const kundaliId = BigInt(params.id);

//     // Verify ownership
//     const existingKundali = await prisma.kundalis.findFirst({
//       where: {
//         id: kundaliId,
//         createdBy: userId,
//         isDelete: false,
//       },
//     });

//     if (!existingKundali) {
//       return NextResponse.json({ success: false, error: "Kundali not found" }, { status: 404 });
//     }

//     // Soft Delete
//     await prisma.kundalis.update({
//       where: { id: kundaliId },
//       data: {
//         isDelete: true,
//         isActive: false,
//         updated_at: new Date(),
//       },
//     });

//     return NextResponse.json({ success: true, message: "Deleted successfully" });

//   } catch (error) {
//     console.error("Delete kundali error:", error);
//     return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { VedicGenAPI } from '@/lib/kundli/vedic-gen-api';
import { KundliDataFormatter } from '@/lib/kundli/kundli-data-formatter';
import { TimezoneHelper } from '@/lib/kundli/timezone-helper';
import { formatDateForAPI } from '@/lib/date-formatter';

// Helper for BigInt serialization
function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (typeof value === 'bigint') return value.toString();
    return value;
  }));
}

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15
) {
  try {
    const resolvedParams = await params;
    const kundaliId = BigInt(resolvedParams.id);

    // 1. Auth Check
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    let userId;
    try {
        const payload = await verifyUserJWT(token);
        userId = payload.userId;
    } catch {
        return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 });
    }

    // 2. Fetch DB Record
    const kundali = await prisma.kundalis.findFirst({
      where: { 
        id: kundaliId,
        createdBy: userId,
        isActive: true,
        isDelete: false
      }
    });

    if (!kundali) {
      return NextResponse.json({ success: false, error: "Kundali not found" }, { status: 404 });
    }

    // 3. Prepare Params for Vedic API
    // We re-calculate the report on the fly because the DB only stores birth details, not the full chart data.
    const apiParams = {
        dob: formatDateForAPI(kundali.birthDate),
        tob: kundali.birthTime,
        lat: kundali.latitude || 0,
        lon: kundali.longitude || 0,
        tz: TimezoneHelper.toAPIFormat(kundali.timezone || '5.5'),
        lang: 'en' // Default to english, or store lang in DB if available
    };

    // 4. Fetch All Astrological Data (Parallel)
    // This logic mirrors the Generate route but DOES NOT create a new DB record.
    const allApiResults = await Promise.allSettled([
        VedicGenAPI.getPlanetDetails(apiParams),
        VedicGenAPI.getAscendantReport(apiParams),
        VedicGenAPI.getPersonalCharacteristics(apiParams),
        VedicGenAPI.getDivisionalCharts({ ...apiParams, div: 'D1' }),
        VedicGenAPI.getDivisionalCharts({ ...apiParams, div: 'D9' }),
        VedicGenAPI.getChartImage({ ...apiParams, div: 'D1', style: 'north' }),
        VedicGenAPI.getChartImage({ ...apiParams, div: 'D9', style: 'north' }),
        VedicGenAPI.getAshtakvarga(apiParams),
        VedicGenAPI.getPlanetaryAspects({ ...apiParams, type: 'houses' }),
        VedicGenAPI.getPlanetsInHouses(apiParams),
        VedicGenAPI.getWesternPlanets(apiParams),
        VedicGenAPI.getShadBala(apiParams),
        VedicGenAPI.getSadeSatiTable(apiParams),
        VedicGenAPI.getCurrentSadeSati(apiParams),
        VedicGenAPI.getKPHouses(apiParams),
        VedicGenAPI.getKPPlanets(apiParams),
        VedicGenAPI.getVarshapalYearChart(apiParams),
        VedicGenAPI.getVarshapalDetails(apiParams),
        VedicGenAPI.getYogaList(apiParams),
        VedicGenAPI.getExtendedKundliDetails(apiParams),
        VedicGenAPI.getFindMoonSign(apiParams),
        VedicGenAPI.getFindSunSign(apiParams),
        VedicGenAPI.getFindAscendant(apiParams),
        VedicGenAPI.getFriendship(apiParams),
        VedicGenAPI.getGemSuggestion(apiParams),
        VedicGenAPI.getRudrakshSuggestion(apiParams),
        VedicGenAPI.getAruthaPadas(apiParams),
        VedicGenAPI.getJaiminiKarakas(apiParams),
        VedicGenAPI.getMangalDosh(apiParams),
        VedicGenAPI.getKaalsarpDosh(apiParams),
        VedicGenAPI.getManglikDosh(apiParams),
        VedicGenAPI.getPitraDosh(apiParams),
        VedicGenAPI.getPapasamaya(apiParams),
        VedicGenAPI.getAI12MonthPrediction(apiParams),
        VedicGenAPI.getNumeroTable({ ...apiParams, name: kundali.name.substring(0, 50) })
    ]);

    // 5. Format Data
    const formattedData = KundliDataFormatter.formatCompleteKundli(
        {
            name: kundali.name,
            gender: kundali.gender,
            birthDate: kundali.birthDate.toISOString(),
            birthTime: kundali.birthTime,
            birthPlace: kundali.birthPlace,
            latitude: kundali.latitude || 0,
            longitude: kundali.longitude || 0,
            timezone: kundali.timezone || '5.5',
            contactNo: '' // Not needed for display
        },
        allApiResults,
        'en'
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        record: serializeData(kundali),
        report: formattedData
      }
    });

  } catch (error) {
    console.error("GET kundali detail error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const kundaliId = BigInt(resolvedParams.id);

    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    let userId;
    try {
        const payload = await verifyUserJWT(token);
        userId = payload.userId;
    } catch {
        return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 });
    }

    await prisma.kundalis.updateMany({
      where: { 
        id: kundaliId,
        createdBy: userId 
      },
      data: {
        isActive: false,
        isDelete: true
      }
    });

    return NextResponse.json({ success: true, message: "Deleted" });

  } catch (error) {
    console.error("Delete kundali error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}