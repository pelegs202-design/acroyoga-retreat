import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classSlots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

interface SlotTemplate {
  dow: number;
  hour: number;
  minute: number;
  labelHe: string;
  labelEn: string;
  location: string;
}

const SLOT_TEMPLATE: SlotTemplate[] = [
  { dow: 1, hour: 18, minute: 30, labelHe: "יום שני 18:30", labelEn: "Monday 18:30", location: "רוקח 40, תל אביב" },
  { dow: 1, hour: 19, minute: 45, labelHe: "יום שני 19:45", labelEn: "Monday 19:45", location: "רוקח 40, תל אביב" },
  { dow: 3, hour: 18, minute: 30, labelHe: "יום רביעי 18:30", labelEn: "Wednesday 18:30", location: "רוקח 40, תל אביב" },
  { dow: 3, hour: 19, minute: 45, labelHe: "יום רביעי 19:45", labelEn: "Wednesday 19:45", location: "רוקח 40, תל אביב" },
  { dow: 5, hour: 13, minute: 30, labelHe: "יום שישי 13:30", labelEn: "Friday 13:30", location: "חוף צ׳ארלס קלור, תל אביב" },
  { dow: 6, hour: 13, minute: 30, labelHe: "יום שבת 13:30", labelEn: "Saturday 13:30", location: "חוף צ׳ארלס קלור, תל אביב" },
];

const DEFAULT_CAPACITY = 8;
const WEEKS_AHEAD = 4;

function getIsraelOffsetMinutes(forDate: Date): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(forDate).map((p) => [p.type, p.value]),
  );
  const ilWallClockUTC = Date.UTC(
    parseInt(parts.year, 10),
    parseInt(parts.month, 10) - 1,
    parseInt(parts.day, 10),
    parseInt(parts.hour === "24" ? "00" : parts.hour, 10),
    parseInt(parts.minute, 10),
    parseInt(parts.second, 10),
  );
  return Math.round((ilWallClockUTC - forDate.getTime()) / 60000);
}

function israelLocalToUTC(year: number, month: number, day: number, hour: number, minute: number): Date {
  const naive = new Date(Date.UTC(year, month, day, hour, minute));
  const offsetMinutes = getIsraelOffsetMinutes(naive);
  return new Date(naive.getTime() - offsetMinutes * 60_000);
}

function generateSlotsForWeeks(weeks: number) {
  const now = new Date();
  const slots: { date: Date; labelHe: string; labelEn: string; location: string }[] = [];
  for (let dayOffset = 0; dayOffset < weeks * 7 + 1; dayOffset++) {
    const target = new Date(now.getTime() + dayOffset * 86_400_000);
    const dow = target.getUTCDay();
    for (const t of SLOT_TEMPLATE) {
      if (t.dow !== dow) continue;
      const date = israelLocalToUTC(
        target.getUTCFullYear(),
        target.getUTCMonth(),
        target.getUTCDate(),
        t.hour,
        t.minute,
      );
      if (date.getTime() <= now.getTime()) continue;
      slots.push({
        date,
        labelHe: t.labelHe,
        labelEn: t.labelEn,
        location: t.location,
      });
    }
  }
  return slots;
}

/**
 * GET /api/cron/seed-class-slots
 *
 * Adds slots for the upcoming N weeks if not present. Idempotent on
 * (date) — skips rows that already exist for the exact datetime.
 *
 * Run daily via vercel.json.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const candidates = generateSlotsForWeeks(WEEKS_AHEAD);
  let inserted = 0;
  let skipped = 0;

  for (const s of candidates) {
    const existing = await db
      .select({ id: classSlots.id })
      .from(classSlots)
      .where(eq(classSlots.date, s.date))
      .limit(1);
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    await db.insert(classSlots).values({
      id: crypto.randomUUID(),
      date: s.date,
      capacity: DEFAULT_CAPACITY,
      labelHe: s.labelHe,
      labelEn: s.labelEn,
      location: s.location,
      active: true,
    });
    inserted++;
  }

  return NextResponse.json({ ok: true, inserted, skipped, weeksAhead: WEEKS_AHEAD });
}
