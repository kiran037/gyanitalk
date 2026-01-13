import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { RateLimiter } from '@/lib/rate-limiter';
import { SessionManager } from '@/lib/session-manager';
import { VedicAPI } from '@/lib/kundli/vedic-api';
import { Validator } from '@/lib/validation';
import { BirthDetails, MATCHING_PRICING } from '@/types/kundli';
import { APIError } from '@/lib/error-response';
import { getClientIP } from '@/lib/ip-helper';
import { formatDateForAPI } from '@/lib/date-formatter';
import { getSession } from "@/lib/auth/index"; // Import auth helper

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      male, 
      female, 
      matchType = 'north', 
      language = 'en' 
    } = body as {
      male: BirthDetails;
      female: BirthDetails;
      matchType: 'north' | 'south';
      language: string;
    };

    const ipAddress = getClientIP(request);

    // 1. Check Authentication
    const session = await getSession(request);
    const isLoggedIn = !!(session && session.userId);
    let ownerUserId: number;

    // 2. Determine Owner
    if (isLoggedIn) {
        // Logged In: Everything belongs to this user
        ownerUserId = Number(session!.userId);
    } else {
        // Guest: We usually attach it to the MALE user's phone for tracking, 
        // or create a temp user based on the first contact number available.
        // Let's use the Male's contact info to establish "ownership" for the guest session.
        
        let guestUser = await prisma.users.findFirst({
            where: { contactNo: male.contactNo }
        });

        if (!guestUser) {
            guestUser = await prisma.users.create({
                data: {
                    name: male.name.substring(0, 50),
                    contactNo: male.contactNo,
                    countryCode: male.countryCode || '+91',
                    gender: 'male',
                    // Defaulting these as they are just a placeholder for the guest "owner"
                    birthDate: new Date(male.birthDate), 
                    birthTime: male.birthTime,
                    birthPlace: male.birthPlace.substring(0, 50),
                    isActive: true,
                    isDelete: false
                }
            });
            // Create wallet
            await prisma.user_wallets.create({
                data: { userId: guestUser.id, amount: 0, isActive: true, isDelete: false, createdBy: Number(guestUser.id), modifiedBy: Number(guestUser.id) }
            });
        }
        ownerUserId = Number(guestUser.id);
    }

    // 3. Validation & Rate Limiting
    const maleValidation = Validator.validateBirthDetails(male);
    const femaleValidation = Validator.validateBirthDetails(female);

    if (!maleValidation.isValid || !femaleValidation.isValid) {
      return APIError.badRequest('Validation failed');
    }

    const identifier = isLoggedIn ? `user_${ownerUserId}` : `ip_${ipAddress}`;
    const rateLimitResult = await RateLimiter.checkLimit(identifier, isLoggedIn);

    if (!rateLimitResult.allowed) {
      return APIError.rateLimitExceeded(rateLimitResult.resetAt, rateLimitResult.remaining, !isLoggedIn);
    }

    const truncatedMaleName = male.name.substring(0, 50);
    const truncatedMaleBirthPlace = male.birthPlace.substring(0, 50);
    const truncatedFemaleName = female.name.substring(0, 50);
    const truncatedFemaleBirthPlace = female.birthPlace.substring(0, 50);

    // 4. Create Kundali Records 
    // CRITICAL FIX: createdBy is set to 'ownerUserId' (the logged in user)
    const [maleKundali, femaleKundali] = await Promise.all([
      prisma.kundalis.create({
        data: {
          name: truncatedMaleName,
          gender: male.gender,
          birthDate: new Date(male.birthDate),
          birthTime: male.birthTime,
          birthPlace: truncatedMaleBirthPlace,
          latitude: male.latitude,
          longitude: male.longitude,
          timezone: male.timezone.toString(),
          isActive: true,
          isDelete: false,
          createdBy: ownerUserId, // <--- Fixed
          modifiedBy: ownerUserId, // <--- Fixed
          pdf_type: 'free',
          forMatch: '1'
        }
      }),
      prisma.kundalis.create({
        data: {
          name: truncatedFemaleName,
          gender: female.gender,
          birthDate: new Date(female.birthDate),
          birthTime: female.birthTime,
          birthPlace: truncatedFemaleBirthPlace,
          latitude: female.latitude,
          longitude: female.longitude,
          timezone: female.timezone.toString(),
          isActive: true,
          isDelete: false,
          createdBy: ownerUserId, // <--- Fixed
          modifiedBy: ownerUserId, // <--- Fixed
          pdf_type: 'free',
          forMatch: '1'
        }
      })
    ]);

    // 5. External API Call Params
    const matchParams = {
      boy_dob: formatDateForAPI(male.birthDate),
      boy_tob: male.birthTime,
      boy_lat: male.latitude,
      boy_lon: male.longitude,
      boy_tz: male.timezone.toString(),
      girl_dob: formatDateForAPI(female.birthDate),
      girl_tob: female.birthTime,
      girl_lat: female.latitude,
      girl_lon: female.longitude,
      girl_tz: female.timezone.toString(),
      lang: language
    };

    // 6. Fetch Matching Data
    const [
      basicMatch,
      detailedMatch,
      aggregateMatch,
      rajjuVedha,
      papasamaya
    ] = await Promise.all([
      matchType === 'north'
        ? VedicAPI.getAshtakootMatch(matchParams)
        : VedicAPI.getDashakootMatch(matchParams),
      matchType === 'north'
        ? VedicAPI.getAshtakootWithAstroDetails(matchParams)
        : VedicAPI.getDashakootWithAstroDetails(matchParams),
      VedicAPI.getAggregateMatch(matchParams),
      VedicAPI.getRajjuVedhaDetails(matchParams),
      VedicAPI.getPapasamayaMatch(matchParams)
    ]);

    // 7. Save Matching Record
    // CRITICAL FIX: userId and createdBy set to 'ownerUserId'
    const matching = await prisma.kundali_matchings.create({
      data: {
        userId: BigInt(ownerUserId), // <--- Fixed: Associated with logged in user
        boyKundaliId: maleKundali.id,
        boyName: male.name,
        boyBirthDate: new Date(male.birthDate),
        boyBirthTime: male.birthTime,
        boyBirthPlace: male.birthPlace,
        girlkundaliId: femaleKundali.id,
        girlName: female.name,
        girlBirthDate: new Date(female.birthDate),
        girlBirthTime: female.birthTime,
        girlBirthPlace: female.birthPlace,
        isActive: true,
        isDelete: false,
        createdBy: ownerUserId, // <--- Fixed
        modifiedBy: ownerUserId, // <--- Fixed
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // 8. Process Response Details
    const matchDetails: any[] = [];
    const basicResponse = basicMatch.response;
    Object.entries(basicResponse).forEach(([key, value]: [string, any]) => {
      if (['score', 'bot_response', 'boy_planetary_details', 'girl_planetary_details', 'boy_astro_details', 'girl_astro_details'].includes(key)) return;
      matchDetails.push({
        key,
        title: value.name || key,
        boy_value: value[`boy_${key}`] || value.boy_tara || value.boy_gana || value.boy_yoni || value.boy_star || value.boy_rasi || value.boy_rajju || value.boy_vasya || value.boy_nadi || value.boy_varna || null,
        girl_value: value[`girl_${key}`] || value.girl_tara || value.girl_gana || value.girl_yoni || value.girl_star || value.girl_rasi || value.girl_rajju || value.girl_vasya || value.girl_nadi || value.girl_varna || null,
        score: value[key] || 0,
        full_score: value.full_score || 0,
        description: value.description || ''
      });
    });

    // 9. Create Session
    const sessionData = {
      basicMatch: basicMatch.response,
      detailedMatch: detailedMatch.response,
      aggregateMatch: aggregateMatch.response,
      rajjuVedha: rajjuVedha.response,
      papasamaya: papasamaya.response,
      matchDetails,
      male,
      female,
      matchType,
      language,
      matchingId: Number(matching.id)
    };

    const sessionId = await SessionManager.createSession(
      sessionData,
      ipAddress,
      Number(maleKundali.id), // Using Male Kundali as primary ref
      ownerUserId
    );

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        matchingId: Number(matching.id),
        maleKundaliId: Number(maleKundali.id),
        femaleKundaliId: Number(femaleKundali.id),
        basic: {
          score: basicResponse.score || 0,
          maxScore: matchType === 'north' ? 36 : 10,
          percentage: Math.round(((basicResponse.score || 0) / (matchType === 'north' ? 36 : 10)) * 100),
          message: basicResponse.bot_response || '',
          details: matchDetails
        },
        aggregate: {
          score: aggregateMatch.response.score || 0,
          maxScore: 100,
          ashtakoot_score: aggregateMatch.response.ashtakoot_score || '0/36',
          dashkoot_score: aggregateMatch.response.dashkoot_score || '0/10',
          message: aggregateMatch.response.bot_response || '',
          extended_message: aggregateMatch.response.extended_response || ''
        },
        doshas: {
            mangal: {
              present: true,
              boy_points: aggregateMatch.response.mangaldosh_points?.boy || 0,
              girl_points: aggregateMatch.response.mangaldosh_points?.girl || 0,
              message: aggregateMatch.response.mangaldosh || ''
            },
            pitra: {
              boy: aggregateMatch.response.pitradosh_points?.boy || false,
              girl: aggregateMatch.response.pitradosh_points?.girl || false,
              message: aggregateMatch.response.pitradosh || ''
            },
            kaalsarp: {
              boy: aggregateMatch.response.kaalsarp_points?.boy || false,
              girl: aggregateMatch.response.kaalsarp_points?.girl || false,
              message: aggregateMatch.response.kaalsarpdosh || ''
            },
            manglik_saturn: {
              boy: aggregateMatch.response.manglikdosh_saturn_points?.boy || false,
              girl: aggregateMatch.response.manglikdosh_saturn_points?.girl || false,
              message: aggregateMatch.response.manglikdosh_saturn || ''
            },
            manglik_rahuketu: {
              boy: aggregateMatch.response.manglikdosh_rahuketu_points?.boy || false,
              girl: aggregateMatch.response.manglikdosh_rahuketu_points?.girl || false,
              message: aggregateMatch.response.manglikdosh_rahuketu || ''
            },
            rajju: {
              present: rajjuVedha.response.is_rajju_dosha_present || false,
              part: rajjuVedha.response.rajju_part || '',
              description: rajjuVedha.response.rajju_description || ''
            },
            vedha: {
              present: rajjuVedha.response.is_vedha_dosha_present || false
            }
          },
        papasamaya: {
          boy_total: papasamaya.response.boy_total || 0,
          girl_total: papasamaya.response.girl_total || 0,
          boy_papa: papasamaya.response.boy_papa || {},
          girl_papa: papasamaya.response.girl_papa || {},
          score: papasamaya.response.score || 0,
          message: papasamaya.response.bot_response || ''
        },
        boyAstro: detailedMatch.response.boy_astro_details || {},
        girlAstro: detailedMatch.response.girl_astro_details || {},
        boyPlanets: detailedMatch.response.boy_planetary_details || {},
        girlPlanets: detailedMatch.response.girl_planetary_details || {},
        matchType
      },
      isFreeTier: true,
      remainingFreeMatchings: rateLimitResult.remaining,
      resetAt: rateLimitResult.resetAt,
      upgradeToPaid: {
        message: 'Get detailed PDF report with remedies and personalized predictions',
        option: { ...MATCHING_PRICING, requiresLogin: !isLoggedIn, requiresPayment: true }
      }
    });

  } catch (error: any) {
    console.error('Matching error:', error);
    return APIError.internalError('Failed to generate matching report');
  }
}