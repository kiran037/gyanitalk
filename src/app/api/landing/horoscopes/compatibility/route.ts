// app/api/landing/horoscopes/compatibility/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VALID_ZODIACS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zodiac1, zodiac2, langcode = 'en' } = body;

    // Validate input
    if (!zodiac1 || !zodiac2) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Both zodiac signs are required',
          required: ['zodiac1', 'zodiac2']
        },
        { status: 400 }
      );
    }

    const z1 = zodiac1.toLowerCase();
    const z2 = zodiac2.toLowerCase();

    if (!VALID_ZODIACS.includes(z1) || !VALID_ZODIACS.includes(z2)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid zodiac sign(s)',
          validSigns: VALID_ZODIACS
        },
        { status: 400 }
      );
    }

    const capitalizedZodiac1 = z1.charAt(0).toUpperCase() + z1.slice(1);
    const capitalizedZodiac2 = z2.charAt(0).toUpperCase() + z2.slice(1);

    // Fetch latest daily horoscopes for both signs
    const [horoscope1, horoscope2] = await Promise.all([
      prisma.horoscopes.findFirst({
        where: {
          zodiac: capitalizedZodiac1,
          type: 1, // Daily
          langcode: langcode,
        },
        orderBy: { created_at: 'desc' },
        take: 1
      }),
      prisma.horoscopes.findFirst({
        where: {
          zodiac: capitalizedZodiac2,
          type: 1, // Daily
          langcode: langcode,
        },
        orderBy: { created_at: 'desc' },
        take: 1
      })
    ]);

    if (!horoscope1 || !horoscope2) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Horoscope data not available for one or both signs'
        },
        { status: 404 }
      );
    }

    // Calculate compatibility scores
    const compatibilityScore = {
      overall: Math.round((horoscope1.total_score + horoscope2.total_score) / 2),
      relationship: Math.round((horoscope1.relationship + horoscope2.relationship) / 2),
      communication: Math.round((horoscope1.status + horoscope2.status) / 2),
      emotional: Math.round((horoscope1.health + horoscope2.health) / 2),
      trust: Math.round((horoscope1.friends + horoscope2.friends) / 2),
      values: Math.round((horoscope1.family + horoscope2.family) / 2),
      activities: Math.round((horoscope1.travel + horoscope2.travel) / 2)
    };

    // Determine compatibility level
    let compatibilityLevel = 'Low';
    let compatibilityMessage = 'You may face challenges but can work through them.';
    
    if (compatibilityScore.overall >= 80) {
      compatibilityLevel = 'Excellent';
      compatibilityMessage = 'Highly compatible! You complement each other wonderfully.';
    } else if (compatibilityScore.overall >= 65) {
      compatibilityLevel = 'Very Good';
      compatibilityMessage = 'Great match! You have strong potential together.';
    } else if (compatibilityScore.overall >= 50) {
      compatibilityLevel = 'Good';
      compatibilityMessage = 'Compatible! Understanding and communication will strengthen your bond.';
    } else if (compatibilityScore.overall >= 35) {
      compatibilityLevel = 'Fair';
      compatibilityMessage = 'Moderate compatibility. Effort and compromise are key.';
    }

    return NextResponse.json({
      success: true,
      data: {
        signs: {
          first: {
            zodiac: capitalizedZodiac1,
            totalScore: horoscope1.total_score,
            luckyColor: horoscope1.lucky_color
          },
          second: {
            zodiac: capitalizedZodiac2,
            totalScore: horoscope2.total_score,
            luckyColor: horoscope2.lucky_color
          }
        },
        compatibility: {
          level: compatibilityLevel,
          message: compatibilityMessage,
          scores: compatibilityScore
        },
        insights: {
          strengths: getStrengths(compatibilityScore),
          challenges: getChallenges(compatibilityScore),
          advice: getAdvice(compatibilityScore)
        },
        date: horoscope1.date
      }
    });

  } catch (error) {
    console.error('Error calculating compatibility:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate compatibility',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getStrengths(scores: any): string[] {
  const strengths: string[] = [];
  
  if (scores.relationship >= 7) strengths.push('Strong romantic connection');
  if (scores.communication >= 7) strengths.push('Excellent communication');
  if (scores.emotional >= 7) strengths.push('Deep emotional understanding');
  if (scores.trust >= 7) strengths.push('High level of trust');
  if (scores.values >= 7) strengths.push('Shared values and goals');
  if (scores.activities >= 7) strengths.push('Enjoy activities together');
  
  if (strengths.length === 0) {
    strengths.push('Potential for growth together');
  }
  
  return strengths;
}

function getChallenges(scores: any): string[] {
  const challenges: string[] = [];
  
  if (scores.relationship < 5) challenges.push('Need to work on romantic connection');
  if (scores.communication < 5) challenges.push('Improve communication patterns');
  if (scores.emotional < 5) challenges.push('Build emotional understanding');
  if (scores.trust < 5) challenges.push('Develop trust and reliability');
  if (scores.values < 5) challenges.push('Align on core values');
  if (scores.activities < 5) challenges.push('Find shared interests');
  
  if (challenges.length === 0) {
    challenges.push('Minor adjustments needed');
  }
  
  return challenges;
}

function getAdvice(scores: any): string {
  if (scores.overall >= 70) {
    return 'Continue nurturing your connection and celebrating your strengths together.';
  } else if (scores.overall >= 50) {
    return 'Focus on open communication and understanding each other\'s needs.';
  } else {
    return 'Take time to understand each other better and work on building trust.';
  }
}