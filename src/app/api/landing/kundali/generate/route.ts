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

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    
    try {
        const body = await request.json();
        const { birthDetails, language = 'en' } = body as {
            birthDetails: BirthDetails;
            language: string;
        };

        // 1. Get IP address
        const ipAddress = getClientIP(request);

        // 2. Check Authentication Status
        const session = await getSession(request);
        const isLoggedIn = !!(session && session.userId);
        
        let ownerUserId: number;

        // 3. DETERMINE OWNERSHIP LOGIC
        if (isLoggedIn) {
            // CASE A: User is logged in. 
            // The Kundli belongs to THEM, regardless of the phone number entered.
            ownerUserId = Number(session!.userId);
            console.log(`✓ User Logged In. associating Kundli with ID: ${ownerUserId}`);
        } else {
            // CASE B: Guest User.
            // We must find or create a user based on the phone number provided in the form.
            
            // Validate mobile number for guest creation
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

                // Create wallet for new user
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
            console.log(`✓ Guest User. Associated/Created User ID: ${ownerUserId} based on phone.`);
        }

        // 4. Rate Limiting
        const identifier = isLoggedIn ? `user_${ownerUserId}` : `ip_${ipAddress}`;
        const rateLimitResult = await RateLimiter.checkLimit(identifier, isLoggedIn);

        if (!rateLimitResult.allowed) {
            return APIError.rateLimitExceeded(
                rateLimitResult.resetAt,
                rateLimitResult.remaining,
                !isLoggedIn
            );
        }

        // 5. Validate Input Data
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

        // 6. Prepare API Params
        const apiParams = {
            dob: formatDateForAPI(birthDetails.birthDate),
            tob: birthDetails.birthTime,
            lat: birthDetails.latitude,
            lon: birthDetails.longitude,
            tz: TimezoneHelper.toAPIFormat(birthDetails.timezone),
            lang: language
        };

        // 7. Fetch External APIs (Parallel)
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

        // 8. Create Kundali Record
        // CRITICAL: We use 'ownerUserId' for createdBy/modifiedBy
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
                createdBy: ownerUserId,  // <--- FIXED: Points to logged in user or guest user
                modifiedBy: ownerUserId, // <--- FIXED
                pdf_type: 'free',
                forMatch: '0'
            }
        });

        // 9. Create Session
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

        const totalTime = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            data: {
                sessionId,
                kundaliId: Number(kundali.id),
                userId: ownerUserId,
                kundli: kundliData
            },
            isFreeTier: true,
            remainingFreeGenerations: rateLimitResult.remaining,
            resetAt: rateLimitResult.resetAt,
            message: 'Comprehensive kundli generated successfully',
        });

    } catch (error: any) {
        console.error("Kundli gen error:", error);
        return APIError.internalError('Failed to generate kundli');
    }
}