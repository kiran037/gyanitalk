

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { RateLimiter } from '@/lib/rate-limiter';
import { SessionManager } from '@/lib/session-manager';
import { VedicGenAPI } from '@/lib/kundli/vedic-gen-api';
import { KundliDataFormatter } from '@/lib/kundli/kundli-data-formatter';
import { TimezoneHelper } from '@/lib/kundli/timezone-helper';
import { Validator } from '@/lib/validation';
import { BirthDetails } from '@/types/kundli';
import { APIError } from '@/lib/error-response';
import { getClientIP } from '@/lib/ip-helper';
import { formatDateForAPI } from '@/lib/date-formatter';
import { getSession } from "@/lib/auth/index"; 

// ✅ Helper to safely convert BigInt/Decimal/Date for JSON response
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (typeof obj === "object" && (obj as any).constructor?.name === "Decimal") {
    return Number((obj as any).toString());
  }
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    
    try {
        const body = await request.json();
        const { birthDetails, language = 'en' } = body as {
            birthDetails: BirthDetails;
            language: string;
        };

        const ipAddress = getClientIP(request);
        const session = await getSession(request);
        const isLoggedIn = !!(session && session.userId);
        
        let ownerUserId: number;

        if (isLoggedIn) {
            ownerUserId = Number(session!.userId);
        } else {
            if (!birthDetails.contactNo || birthDetails.contactNo.length < 10) {
                return APIError.badRequest('Valid mobile number is required');
            }

            const truncatedName = birthDetails.name.substring(0, 50);
            const truncatedBirthPlace = birthDetails.birthPlace.substring(0, 50);

            let user = await prisma.users.findFirst({
                where: { contactNo: birthDetails.contactNo }
            });

            if (!user) {
                user = await prisma.users.create({
                    data: {
                        name: truncatedName,
                        contactNo: birthDetails.contactNo,
                        countryCode: birthDetails.countryCode || '+91',
                        gender: birthDetails.gender,
                        birthDate: new Date(birthDetails.birthDate),
                        birthTime: birthDetails.birthTime,
                        birthPlace: truncatedBirthPlace,
                        isActive: true,
                        isDelete: false
                    }
                });

                await prisma.user_wallets.create({
                    data: {
                        userId: user.id,
                        amount: 0,
                        isActive: true,
                        isDelete: false,
                        createdBy: Number(user.id),
                        modifiedBy: Number(user.id)
                    }
                });
            }
            ownerUserId = Number(user.id);
        }

        const identifier = isLoggedIn ? `user_${ownerUserId}` : `ip_${ipAddress}`;
        const rateLimitResult = await RateLimiter.checkLimit(identifier, isLoggedIn);

        if (!rateLimitResult.allowed) {
            return APIError.rateLimitExceeded(
                rateLimitResult.resetAt,
                rateLimitResult.remaining,
                !isLoggedIn
            );
        }

        const validation = Validator.validateBirthDetails(birthDetails);
        if (!validation.isValid) {
            return APIError.badRequest('Validation failed', validation.errors);
        }

        if (!TimezoneHelper.isValid(birthDetails.timezone)) {
            return APIError.badRequest('Invalid timezone value. Must be between -12 and 14');
        }
        const normalizedTimezone = TimezoneHelper.toDBFormat(birthDetails.timezone);
        const truncatedName = birthDetails.name.substring(0, 50);
        const truncatedBirthPlace = birthDetails.birthPlace.substring(0, 50);

        // API Parameters
        const apiParams = {
            dob: formatDateForAPI(birthDetails.birthDate),
            tob: birthDetails.birthTime,
            lat: birthDetails.latitude,
            lon: birthDetails.longitude,
            tz: TimezoneHelper.toAPIFormat(birthDetails.timezone),
            lang: language
        };

        // 7. Fetch External APIs (Parallel)
        // ✅ Ensure this order matches "KundliDataFormatter.formatCompleteKundli" destructuring EXACTLY
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
            VedicGenAPI.getNumeroTable({ ...apiParams, name: truncatedName })
        ]);

        const kundali = await prisma.kundalis.create({
            data: {
                name: truncatedName,
                gender: birthDetails.gender,
                birthDate: new Date(birthDetails.birthDate),
                birthTime: birthDetails.birthTime,
                birthPlace: truncatedBirthPlace,
                latitude: birthDetails.latitude,
                longitude: birthDetails.longitude,
                timezone: normalizedTimezone,
                isActive: true,
                isDelete: false,
                createdBy: ownerUserId,
                modifiedBy: ownerUserId,
                pdf_type: 'free',
                forMatch: '0'
            }
        });

        const kundliData = KundliDataFormatter.formatCompleteKundli(
            birthDetails,
            allApiResults,
            language
        );

        const sessionId = await SessionManager.createSession(
            kundliData,
            ipAddress,
            Number(kundali.id),
            ownerUserId
        );

        const responseData = {
            success: true,
            data: {
                sessionId,
                kundaliId: kundali.id, 
                userId: ownerUserId,
                kundli: kundliData
            },
            isFreeTier: true,
            remainingFreeGenerations: rateLimitResult.remaining,
            resetAt: rateLimitResult.resetAt,
            message: 'Comprehensive kundli generated successfully',
        };

        // ✅ FIX: Use converter to handle BigInt serialization
        return NextResponse.json(convertPrismaTypes(responseData));

    } catch (error: any) {
        console.error("Kundli gen error:", error);
        return APIError.internalError('Failed to generate kundli');
    }
}