
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

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    
    try {
        const body = await request.json();
        const { birthDetails, language = 'en' } = body as {
            birthDetails: BirthDetails;
            language: string;
        };

        console.log('🚀 Starting kundli generation for:', birthDetails.name);

        // Get IP address
        const ipAddress = getClientIP(request);

        // Validate input
        const validation = Validator.validateBirthDetails(birthDetails);
        if (!validation.isValid) {
            return APIError.badRequest('Validation failed', validation.errors);
        }

        // Validate mobile number
        if (!birthDetails.contactNo || birthDetails.contactNo.length < 10) {
            return APIError.badRequest('Valid mobile number is required');
        }

        // Validate and normalize timezone
        if (!TimezoneHelper.isValid(birthDetails.timezone)) {
            return APIError.badRequest('Invalid timezone value. Must be between -12 and 14');
        }
        const normalizedTimezone = TimezoneHelper.toDBFormat(birthDetails.timezone);

        // Truncate fields to prevent database errors
        const truncatedName = birthDetails.name.substring(0, 50);
        const truncatedBirthPlace = birthDetails.birthPlace.substring(0, 50);

        // Find or create user based on mobile number
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

            console.log('✓ New user created:', Number(user.id));
        } else {
            console.log('✓ Existing user found:', Number(user.id));
        }

        const userId = Number(user.id);
        const identifier = `user_${userId}`;
        const rateLimitResult = await RateLimiter.checkLimit(identifier, true);

        if (!rateLimitResult.allowed) {
            return APIError.rateLimitExceeded(
                rateLimitResult.resetAt,
                rateLimitResult.remaining,
                false
            );
        }

        console.log('✓ Rate limit check passed. Remaining:', rateLimitResult.remaining);

        // Prepare API params
        const apiParams = {
            dob: formatDateForAPI(birthDetails.birthDate),
            tob: birthDetails.birthTime,
            lat: birthDetails.latitude,
            lon: birthDetails.longitude,
            tz: TimezoneHelper.toAPIFormat(birthDetails.timezone), // Use API format
            lang: language
        };

        console.log('📊 Fetching kundli data from APIs...');

        // ===== FETCH ALL KUNDLI DATA IN PARALLEL =====
        const allApiResults = await Promise.allSettled([
            // Core horoscope data (0-2)
            VedicGenAPI.getPlanetDetails(apiParams),
            VedicGenAPI.getAscendantReport(apiParams),
            VedicGenAPI.getPersonalCharacteristics(apiParams),
            
            // Charts (3-6)
            VedicGenAPI.getDivisionalCharts({ ...apiParams, div: 'D1' }),
            VedicGenAPI.getDivisionalCharts({ ...apiParams, div: 'D9' }),
            VedicGenAPI.getChartImage({ ...apiParams, div: 'D1', style: 'north' }),
            VedicGenAPI.getChartImage({ ...apiParams, div: 'D9', style: 'north' }),
            
            // Ashtakvarga (7)
            VedicGenAPI.getAshtakvarga(apiParams),
            
            // Planetary information (8-9)
            VedicGenAPI.getPlanetaryAspects({ ...apiParams, type: 'houses' }),
            VedicGenAPI.getPlanetsInHouses(apiParams),
            
            // Western astrology (10)
            VedicGenAPI.getWesternPlanets(apiParams),
            
            // Extended horoscope (11-18)
            VedicGenAPI.getShadBala(apiParams),
            VedicGenAPI.getSadeSatiTable(apiParams),
            VedicGenAPI.getCurrentSadeSati(apiParams),
            VedicGenAPI.getKPHouses(apiParams),
            VedicGenAPI.getKPPlanets(apiParams),
            VedicGenAPI.getVarshapalYearChart(apiParams),
            VedicGenAPI.getVarshapalDetails(apiParams),
            VedicGenAPI.getYogaList(apiParams),
            VedicGenAPI.getExtendedKundliDetails(apiParams),
            
            // Signs and ascendant (19-21)
            VedicGenAPI.getFindMoonSign(apiParams),
            VedicGenAPI.getFindSunSign(apiParams),
            VedicGenAPI.getFindAscendant(apiParams),
            
            // Friendship (22)
            VedicGenAPI.getFriendship(apiParams),
            
            // Suggestions (23-24)
            VedicGenAPI.getGemSuggestion(apiParams),
            VedicGenAPI.getRudrakshSuggestion(apiParams),
            
            // Jaimini and Arutha (25-26)
            VedicGenAPI.getAruthaPadas(apiParams),
            VedicGenAPI.getJaiminiKarakas(apiParams),
            
            // Doshas (27-31)
            VedicGenAPI.getMangalDosh(apiParams),
            VedicGenAPI.getKaalsarpDosh(apiParams),
            VedicGenAPI.getManglikDosh(apiParams),
            VedicGenAPI.getPitraDosh(apiParams),
            VedicGenAPI.getPapasamaya(apiParams),
            
            // AI Predictions (32)
            VedicGenAPI.getAI12MonthPrediction(apiParams),
            
            // Numerology (33)
            VedicGenAPI.getNumeroTable({ ...apiParams, name: truncatedName })
        ]);

        const apiTime = Date.now() - startTime;
        console.log(`✓ All API calls completed in ${apiTime}ms`);

        // Count successes and failures
        const successCount = allApiResults.filter(r => r.status === 'fulfilled').length;
        const failCount = allApiResults.filter(r => r.status === 'rejected').length;
        console.log(`📈 API Results: ${successCount} succeeded, ${failCount} failed`);

        // Create kundali record
        const kundali = await prisma.kundalis.create({
            data: {
                name: truncatedName,
                gender: birthDetails.gender,
                birthDate: new Date(birthDetails.birthDate),
                birthTime: birthDetails.birthTime,
                birthPlace: truncatedBirthPlace,
                latitude: birthDetails.latitude,
                longitude: birthDetails.longitude,
                timezone: normalizedTimezone, // Use normalized string timezone
                isActive: true,
                isDelete: false,
                createdBy: userId,
                modifiedBy: userId,
                pdf_type: 'free',
                forMatch: '0'
            }
        });

        console.log('✓ Kundali record created:', Number(kundali.id));

        // Format complete kundli data using formatter
        const kundliData = KundliDataFormatter.formatCompleteKundli(
            birthDetails,
            allApiResults,
            language
        );

        // Create session
        const sessionId = await SessionManager.createSession(
            kundliData,
            ipAddress,
            Number(kundali.id),
            userId
        );

        const totalTime = Date.now() - startTime;
        console.log(`✅ Kundli generation completed in ${totalTime}ms`);
        console.log('📦 Session ID:', sessionId);

        return NextResponse.json({
            success: true,
            data: {
                sessionId,
                kundaliId: Number(kundali.id),
                userId: userId,
                kundli: kundliData
            },
            isFreeTier: true,
            remainingFreeGenerations: rateLimitResult.remaining,
            resetAt: rateLimitResult.resetAt,
            message: 'Comprehensive kundli generated successfully',
            meta: {
                totalApis: allApiResults.length,
                successfulApis: successCount,
                failedApis: failCount,
                generationTime: `${totalTime}ms`
            }
        });

    } catch (error: any) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Kundli generation error after ${totalTime}ms:`, error);
        
        return APIError.internalError(
            'Failed to generate kundli',
            process.env.NODE_ENV === 'development' ? {
                message: error.message,
                stack: error.stack,
                time: `${totalTime}ms`
            } : undefined
        );
    }
}