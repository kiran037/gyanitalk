// // src/app/api/landing/kundali/generate/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from "@/lib/prisma";
// import { RateLimiter } from '@/lib/rate-limiter';
// import { SessionManager } from '@/lib/session-manager';
// import { VedicAPI } from '@/lib/kundli/vedic-api';
// import { Validator } from '@/lib/validation';
// import { BirthDetails } from '@/types/kundli';
// import { APIError } from '@/lib/error-response';
// import { getClientIP } from '@/lib/ip-helper';
// import { formatDateForAPI } from '@/lib/date-formatter';

// export async function POST(request: NextRequest) {
//     try {
//         const body = await request.json();
//         const { birthDetails, language = 'en' } = body as {
//             birthDetails: BirthDetails;
//             language: string;
//         };

//         // Get IP address
//         const ipAddress = getClientIP(request);

//         // Validate input
//         const validation = Validator.validateBirthDetails(birthDetails);
//         if (!validation.isValid) {
//             return APIError.badRequest('Validation failed', validation.errors);
//         }

//         // Validate mobile number
//         if (!birthDetails.contactNo || birthDetails.contactNo.length < 10) {
//             return APIError.badRequest('Valid mobile number is required');
//         }

//         // Truncate fields to prevent database errors
//         const truncatedName = birthDetails.name.substring(0, 50);
//         const truncatedBirthPlace = birthDetails.birthPlace.substring(0, 50);

//         // Find or create user based on mobile number
//         let user = await prisma.users.findFirst({
//             where: { contactNo: birthDetails.contactNo }
//         });

//         if (!user) {
//             user = await prisma.users.create({
//                 data: {
//                     name: truncatedName,
//                     contactNo: birthDetails.contactNo,
//                     countryCode: birthDetails.countryCode || '+91',
//                     gender: birthDetails.gender,
//                     birthDate: new Date(birthDetails.birthDate),
//                     birthTime: birthDetails.birthTime,
//                     birthPlace: truncatedBirthPlace,
//                     isActive: true,
//                     isDelete: false
//                 }
//             });

//             await prisma.user_wallets.create({
//                 data: {
//                     userId: user.id,
//                     amount: 0,
//                     isActive: true,
//                     isDelete: false,
//                     createdBy: Number(user.id),
//                     modifiedBy: Number(user.id)
//                 }
//             });
//         }

//         const userId = Number(user.id);
//         const identifier = `user_${userId}`;
//         const rateLimitResult = await RateLimiter.checkLimit(identifier, true);

//         if (!rateLimitResult.allowed) {
//             return APIError.rateLimitExceeded(
//                 rateLimitResult.resetAt,
//                 rateLimitResult.remaining,
//                 false
//             );
//         }

//         // Prepare API params
//         const apiParams = {
//             dob: formatDateForAPI(birthDetails.birthDate),
//             tob: birthDetails.birthTime,
//             lat: birthDetails.latitude,
//             lon: birthDetails.longitude,
//             tz: birthDetails.timezone,
//             lang: language
//         };

//         // Fetch ALL data in parallel
//         const [
//             planetDetails,
//             ascendantReport,
//             houseLords,
//             personalCharacteristics,
//             divisionalCharts,
//             chartImageD1,
//             chartImageD9,
//             ashtakvarga,
//             planetaryAspects,
//             planetsInHouses,
//             westernPlanets,
//             aiPrediction
//         ] = await Promise.all([
//             VedicAPI.getPlanetDetails(apiParams),
//             VedicAPI.getAscendantReport(apiParams),
//             VedicAPI.getHouseLords(apiParams),
//             VedicAPI.getPersonalCharacteristics(apiParams),
//             VedicAPI.getDivisionalCharts({ ...apiParams, div: 'D1' }),
//             VedicAPI.getChartImage({ ...apiParams, div: 'D1', style: 'north' }),
//             VedicAPI.getChartImage({ ...apiParams, div: 'D9', style: 'north' }),
//             VedicAPI.getAshtakvarga(apiParams),
//             VedicAPI.getPlanetaryAspects({ ...apiParams, type: 'houses' }),
//             VedicAPI.getPlanetsInHouses(apiParams),
//             VedicAPI.getWesternPlanets(apiParams),
//             VedicAPI.getAI12MonthPrediction(apiParams)
//         ]);

//         // Create kundali record
//         const kundali = await prisma.kundalis.create({
//             data: {
//                 name: truncatedName,
//                 gender: birthDetails.gender,
//                 birthDate: new Date(birthDetails.birthDate),
//                 birthTime: birthDetails.birthTime,
//                 birthPlace: truncatedBirthPlace,
//                 latitude: birthDetails.latitude,
//                 longitude: birthDetails.longitude,
//                 timezone: birthDetails.timezone,
//                 isActive: true,
//                 isDelete: false,
//                 createdBy: userId,
//                 modifiedBy: userId,
//                 pdf_type: 'free',
//                 forMatch: '0'
//             }
//         });

//         // Prepare comprehensive response
//         const kundliData = {
//             basicDetails: {
//                 name: birthDetails.name,
//                 birthDate: birthDetails.birthDate,
//                 birthTime: birthDetails.birthTime,
//                 birthPlace: birthDetails.birthPlace,
//                 latitude: birthDetails.latitude,
//                 longitude: birthDetails.longitude
//             },
//             planetDetails: planetDetails.response,
//             ascendantReport: ascendantReport.response?.[0],
//             houseLords: houseLords.response,
//             personalCharacteristics: personalCharacteristics.response,
//             divisionalCharts: divisionalCharts.response,
//             charts: {
//                 d1: chartImageD1.response?.svg || chartImageD1.response?.image_url,
//                 d9: chartImageD9.response?.svg || chartImageD9.response?.image_url
//             },
//             ashtakvarga: ashtakvarga.response,
//             planetaryAspects: planetaryAspects.response,
//             planetsInHouses: planetsInHouses.response,
//             westernPlanets: westernPlanets.response,
//             aiPrediction: aiPrediction.response,
//             language
//         };

//         // Create session
//         const sessionId = await SessionManager.createSession(
//             kundliData,
//             ipAddress,
//             Number(kundali.id),
//             userId
//         );

//         return NextResponse.json({
//             success: true,
//             data: {
//                 sessionId,
//                 kundaliId: Number(kundali.id),
//                 userId: userId,
//                 kundli: kundliData
//             },
//             isFreeTier: true,
//             remainingFreeGenerations: rateLimitResult.remaining,
//             resetAt: rateLimitResult.resetAt
//         });

//     } catch (error: any) {
//         console.error('Kundli generation error:', error);
//         return APIError.internalError(
//             'Failed to generate kundli',
//             process.env.NODE_ENV === 'development' ? error.message : undefined
//         );
//     }
// }

// src/app/api/landing/kundali/generate/route.ts - WORKING VERSION (Only Valid Endpoints)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { RateLimiter } from '@/lib/rate-limiter';
import { SessionManager } from '@/lib/session-manager';
import { VedicAPI } from '@/lib/kundli/vedic-api';
import { Validator } from '@/lib/validation';
import { BirthDetails } from '@/types/kundli';
import { APIError } from '@/lib/error-response';
import { getClientIP } from '@/lib/ip-helper';
import { formatDateForAPI } from '@/lib/date-formatter';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { birthDetails, language = 'en' } = body as {
            birthDetails: BirthDetails;
            language: string;
        };

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

        // Prepare API params
        const apiParams = {
            dob: formatDateForAPI(birthDetails.birthDate),
            tob: birthDetails.birthTime,
            lat: birthDetails.latitude,
            lon: birthDetails.longitude,
            tz: birthDetails.timezone,
            lang: language
        };

        // Fetch ONLY WORKING endpoints in parallel
        const [
            planetDetails,
            ascendantReport,
            personalCharacteristics,
            divisionalCharts,
            chartImageD1,
            chartImageD9,
            ashtakvarga,
            planetaryAspects,
            planetsInHouses,
            westernPlanets,
            aiPrediction
        ] = await Promise.all([
            VedicAPI.getPlanetDetails(apiParams),
            VedicAPI.getAscendantReport(apiParams),
            VedicAPI.getPersonalCharacteristics(apiParams),
            VedicAPI.getDivisionalCharts({ ...apiParams, div: 'D1' }),
            VedicAPI.getChartImage({ ...apiParams, div: 'D1', style: 'north' }),
            VedicAPI.getChartImage({ ...apiParams, div: 'D9', style: 'north' }),
            VedicAPI.getAshtakvarga(apiParams),
            VedicAPI.getPlanetaryAspects({ ...apiParams, type: 'houses' }),
            VedicAPI.getPlanetsInHouses(apiParams),
            VedicAPI.getWesternPlanets(apiParams),
            VedicAPI.getAI12MonthPrediction(apiParams)
        ]);

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
                timezone: birthDetails.timezone,
                isActive: true,
                isDelete: false,
                createdBy: userId,
                modifiedBy: userId,
                pdf_type: 'free',
                forMatch: '0'
            }
        });

        // Prepare comprehensive response
        const kundliData = {
            basicDetails: {
                name: birthDetails.name,
                birthDate: birthDetails.birthDate,
                birthTime: birthDetails.birthTime,
                birthPlace: birthDetails.birthPlace,
                latitude: birthDetails.latitude,
                longitude: birthDetails.longitude
            },
            planetDetails: planetDetails.response,
            ascendantReport: ascendantReport.response?.[0],
            personalCharacteristics: personalCharacteristics.response,
            divisionalCharts: divisionalCharts.response,
            charts: {
                d1: chartImageD1.response?.svg || chartImageD1.response?.image_url,
                d9: chartImageD9.response?.svg || chartImageD9.response?.image_url
            },
            ashtakvarga: ashtakvarga.response,
            planetaryAspects: planetaryAspects.response,
            planetsInHouses: planetsInHouses.response,
            westernPlanets: westernPlanets.response,
            aiPrediction: aiPrediction.response,
            language
        };

        // Create session
        const sessionId = await SessionManager.createSession(
            kundliData,
            ipAddress,
            Number(kundali.id),
            userId
        );

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
            resetAt: rateLimitResult.resetAt
        });

    } catch (error: any) {
        console.error('Kundli generation error:', error);
        return APIError.internalError(
            'Failed to generate kundli',
            process.env.NODE_ENV === 'development' ? error.message : undefined
        );
    }
}