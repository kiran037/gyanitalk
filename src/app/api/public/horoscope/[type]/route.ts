///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/public/horoscope/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
const ZODIAC_MAP: Record<number, string> = {
  1: 'Aries',
  2: 'Taurus',
  3: 'Gemini',
  4: 'Cancer',
  5: 'Leo',
  6: 'Virgo',
  7: 'Libra',
  8: 'Scorpio',
  9: 'Sagittarius',
  10: 'Capricorn',
  11: 'Aquarius',
  12: 'Pisces',
};
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await context.params;
    const typeInt = Number(type);

    const systemFlag = await prisma.systemflag.findFirst({
      where: { name: 'vedicAstroAPI' },
    });

    if (!systemFlag?.value) {
      return NextResponse.json({ success: false, message: 'API key missing' });
    }

    const apiKey = systemFlag.value;
    const languages = ['en', 'hi', 'be', 'mr','ka','ta','te','ml','gu','pa'];

    const today = new Date();
    const currDate = today.toISOString().split('T')[0]; // yyyy-mm-dd
    const currDateDDMMYYYY = today.toLocaleDateString('en-GB'); // dd/mm/yyyy
    const { start: weekStartDate, end: weekEndDate } = getWeekRange();
    // 🔁 Zodiac loop
    let yearlyStartDate: Date | null = null;
    let yearlyEndDate: Date | null = null;
    for (let zodiac = 1; zodiac <= 12; zodiac++) {
      for (const lang of languages) {

        /* ================= DAILY ================= */
        if (typeInt === 1) {
          const res = await fetch(
            'https://api.vedicastroapi.com/v3-json/prediction/daily-moon?' +
            new URLSearchParams({
              zodiac: zodiac.toString(),
              date: currDateDDMMYYYY,
              show_same: 'true',
              api_key: apiKey,
              lang,
            })
          );

          const { response } = await res.json();
          if (!response) continue;

          await prisma.horoscopes.create({
            data: {
              zodiac: String(response.zodiac),
              total_score: Number(response.total_score),
              lucky_color: response.lucky_color ?? '',
              lucky_color_code: response.lucky_color_code ?? '',
              lucky_number: JSON.stringify(response.lucky_number ?? []),

              physique: Number(response.physique),
              status: Number(response.status),
              finances: Number(response.finances),
              relationship: Number(response.relationship),
              career: Number(response.career),
              travel: Number(response.travel),
              family: Number(response.family),
              friends: Number(response.friends),
              health: Number(response.health),

              bot_response: response.bot_response ?? '',
              date: new Date(),
              type: 1,
              langcode: lang,
              travel_remark: '',
              family_remark: '',
              friends_remark: '',
              finances_remark: '',
              status_remark: '',
            },
          });
        }

        /* ================= WEEKLY ================= */
        if (typeInt === 2) {
          const res = await fetch(
            'https://api.vedicastroapi.com/v3-json/prediction/weekly-moon?' +
            new URLSearchParams({
              zodiac: zodiac.toString(),
              week: 'thisweek',
              show_same: 'true',
              api_key: apiKey,
              lang,
            })
          );

          const { response } = await res.json();
          if (!response) continue;

          await prisma.horoscopes.create({
            data: {
              zodiac: String(response.zodiac),
              total_score: Number(response.total_score),
              lucky_color: response.lucky_color ?? '',
              lucky_color_code: response.lucky_color_code ?? '',
              lucky_number: JSON.stringify(response.lucky_number ?? []),

              physique: Number(response.physique ?? 0),
              status: Number(response.status),
              finances: Number(response.finances),
              relationship: Number(response.relationship),
              career: Number(response.career),
              travel: Number(response.travel),
              family: Number(response.family),
              friends: Number(response.friends),
              health: Number(response.health),

              bot_response: response.bot_response ?? '',
              date: new Date(currDate),
              start_date: weekStartDate,
              end_date: weekEndDate,
              type: 2,
              langcode: lang,

              // ✅ REQUIRED remarks (empty)
              travel_remark: '',
              family_remark: '',
              friends_remark: '',
              finances_remark: '',
              status_remark: '',
              health_remark: null,
              career_remark: null,
              relationship_remark: null,
            },
          });
        }

        /* ================= YEARLY ================= */
        if (typeInt === 3) {
          const res = await fetch(
            'https://api.vedicastroapi.com/v3-json/prediction/yearly?' +
            new URLSearchParams({
              zodiac: zodiac.toString(),
              year: today.getFullYear().toString(),
              show_same: 'true',
              api_key: apiKey,
              lang,
            })
          );

          const json = await res.json();
          if (!json?.response) continue;
          for (const [, rawValue] of Object.entries(json.response)) {
            const value: any = rawValue;

            if (!value?.period) continue;

            let startDate: Date | null = null;
            let endDate: Date | null = null;

            // PHP logic: sirf EN me period se start/end date
            if (lang === 'en' && typeof value.period === 'string') {
              const parts = value.period.split(' to ');
              if (parts.length === 2) {
                yearlyStartDate = parseYearlyPeriodDate(
                  parts[0].trim(),
                  today.getFullYear()
                );
                yearlyEndDate = parseYearlyPeriodDate(
                  parts[1].trim(),
                  today.getFullYear()
                );
              }
            }

            await prisma.horoscopes.create({
              data: {
                zodiac: ZODIAC_MAP[zodiac], // ✅ NAME (Aries, Taurus...)

                total_score: parseScore(value.score),

                lucky_color: value.lucky_color ?? '',
                lucky_color_code: value.lucky_color_code ?? '',
                lucky_number: value.lucky_number ?? '',

                physique: parseScore(value.physique?.score),
                status: parseScore(value.status?.score),
                finances: parseScore(value.finances?.score),
                relationship: parseScore(value.relationship?.score),
                career: parseScore(value.career?.score),
                travel: parseScore(value.travel?.score),
                family: parseScore(value.family?.score),
                friends: parseScore(value.friends?.score),
                health: parseScore(value.health?.score),

                bot_response: value.prediction ?? '',
                date: new Date(),              // same as PHP $currDate
                start_date: yearlyStartDate,         // PHP strtotime equivalent
                end_date: yearlyEndDate,
                type: 3,                       // YEARLY
                langcode: lang,

                // REQUIRED remarks (Prisma-safe)
                health_remark: value.health?.prediction ?? '',
                career_remark: value.career?.prediction ?? '',
                relationship_remark: value.relationship?.prediction ?? '',
                travel_remark: value.travel?.prediction ?? '',
                family_remark: value.family?.prediction ?? '',
                friends_remark: value.friends?.prediction ?? '',
                finances_remark: value.finances?.prediction ?? '',
                status_remark: value.status?.prediction ?? '',
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Horoscope generated successfully',
      type: typeInt,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
function parseScore(score: any): number {
  if (score === null || score === undefined) return 0;
  if (typeof score === 'number') return score;
  if (typeof score === 'string')
    return Number(score.replace('%', '').trim()) || 0;
  return 0;
}

function safeParseDate(input: any): Date | null {
  if (!input || typeof input !== 'string') return null;
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}
function getWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0-6
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);

  const start = new Date(now.setDate(diffToMonday));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start, end };
}
function parseYearlyPeriodDate(input: string, year: number): Date | null {
  if (!input) return null;
  const hasYear = /\d{4}/.test(input);
  const dateStr = hasYear ? input : `${input} ${year}`;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}
