// src/app/api/home/utils/date-range/route.ts
import { NextRequest, NextResponse } from "next/server";

const TZ = "Asia/Kolkata";

// Helper to build a Date from parts in IST (approx by shifting to local date parts)
function makeISTDate(y: number, m: number, d: number) {
  // Construct as if in IST by using UTC parts offset by IST when needed.
  // Simpler approach: create with local timezone then adjust via toLocaleString with IST when rendering.
  return new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
}

function startOfMonthIST(base: Date) {
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth();
  return makeISTDate(y, m, 1);
}

function endOfMonthIST(base: Date) {
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth();
  return makeISTDate(y, m + 1, 0);
}

function startOfDayIST(base: Date) {
  const s = new Date(base);
  s.setUTCHours(0, 0, 0, 0);
  return s;
}
function endOfDayIST(base: Date) {
  const e = new Date(base);
  e.setUTCHours(23, 59, 59, 999);
  return e;
}

// Indian Financial Year: April 1 – March 31
function currentFYRangeIST(now: Date) {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0-11
  const fyStartYear = m >= 3 ? y : y - 1; // April (3) threshold
  const start = makeISTDate(fyStartYear, 3, 1);
  const end   = makeISTDate(fyStartYear + 1, 2, 31);
  return { start: startOfDayIST(start), end: endOfDayIST(end) };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const preset = (searchParams.get("preset") || "").trim(); // today,yesterday,last7,last30,thisMonth,lastMonth,thisFY,custom
    const start  = searchParams.get("startDate");
    const end    = searchParams.get("endDate");

    // “Today” anchored to IST date
    const todayIST = new Date(
      new Date().toLocaleDateString("en-CA", { timeZone: TZ })
    );

    let range: { start: Date; end: Date };
    let label = "custom";

    switch (preset) {
      case "today": {
        range = { start: startOfDayIST(todayIST), end: endOfDayIST(todayIST) };
        label = "today";
        break;
      }
      case "yesterday": {
        const y = new Date(todayIST);
        y.setUTCDate(y.getUTCDate() - 1);
        range = { start: startOfDayIST(y), end: endOfDayIST(y) };
        label = "yesterday";
        break;
      }
      case "last7": {
        const s = new Date(todayIST);
        s.setUTCDate(s.getUTCDate() - 6);
        range = { start: startOfDayIST(s), end: endOfDayIST(todayIST) };
        label = "last7";
        break;
      }
      case "last30": {
        const s = new Date(todayIST);
        s.setUTCDate(s.getUTCDate() - 29);
        range = { start: startOfDayIST(s), end: endOfDayIST(todayIST) };
        label = "last30";
        break;
      }
      case "thisMonth": {
        const s = startOfMonthIST(todayIST);
        const e = endOfMonthIST(todayIST);
        range = { start: startOfDayIST(s), end: endOfDayIST(e) };
        label = "thisMonth";
        break;
      }
      case "lastMonth": {
        const lm = new Date(todayIST);
        lm.setUTCMonth(lm.getUTCMonth() - 1);
        const s = startOfMonthIST(lm);
        const e = endOfMonthIST(lm);
        range = { start: startOfDayIST(s), end: endOfDayIST(e) };
        label = "lastMonth";
        break;
      }
      case "thisFY": {
        const { start: s, end: e } = currentFYRangeIST(todayIST);
        range = { start: s, end: e };
        label = "thisFY";
        break;
      }
      case "custom":
      default: {
        if (start || end) {
          const s = start ? new Date(start) : startOfDayIST(todayIST);
          const e = end   ? new Date(end)   : endOfDayIST(todayIST);
          range = { start: startOfDayIST(s), end: endOfDayIST(e) };
          label = "custom";
        } else {
          // default to last7
          const s = new Date(todayIST);
          s.setUTCDate(s.getUTCDate() - 6);
          range = { start: startOfDayIST(s), end: endOfDayIST(todayIST) };
          label = "last7";
        }
      }
    }

    return NextResponse.json(
      {
        label,
        timezone: TZ,
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("utils/date-range error", err);
    return NextResponse.json({ error: "Failed to compute date range" }, { status: 500 });
  }
}
