// Seed class_slots with a rolling N-week window of recurring weekly slots.
// Idempotent: existing slots for the same datetime are skipped.
// Reused by the /api/cron/seed-class-slots route (which calls seedClassSlots()).
//
// Usage:
//   node scripts/seed-class-slots.mjs                  # 4 weeks ahead (default)
//   node scripts/seed-class-slots.mjs --weeks 8
//   node scripts/seed-class-slots.mjs --dry-run        # show what would be inserted

import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set. Pass it via env or .env.local.');
  process.exit(1);
}

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const weeksFlag = argv.indexOf('--weeks');
const weeksAhead = weeksFlag >= 0 ? parseInt(argv[weeksFlag + 1] ?? '4', 10) : 4;

// Weekly slot template. dow is JS Date getDay() value (0=Sun ... 6=Sat).
// Times are in Asia/Jerusalem local time.
const SLOT_TEMPLATE = [
  { dow: 1, hour: 18, minute: 30, labelHe: 'יום שני 18:30', labelEn: 'Monday 18:30', location: 'רוקח 40, תל אביב' },
  { dow: 1, hour: 19, minute: 45, labelHe: 'יום שני 19:45', labelEn: 'Monday 19:45', location: 'רוקח 40, תל אביב' },
  { dow: 3, hour: 18, minute: 30, labelHe: 'יום רביעי 18:30', labelEn: 'Wednesday 18:30', location: 'רוקח 40, תל אביב' },
  { dow: 3, hour: 19, minute: 45, labelHe: 'יום רביעי 19:45', labelEn: 'Wednesday 19:45', location: 'רוקח 40, תל אביב' },
  { dow: 5, hour: 13, minute: 30, labelHe: 'יום שישי 13:30', labelEn: 'Friday 13:30', location: 'חוף צ׳ארלס קלור, תל אביב' },
  { dow: 6, hour: 13, minute: 30, labelHe: 'יום שבת 13:30', labelEn: 'Saturday 13:30', location: 'חוף צ׳ארלס קלור, תל אביב' },
];

const DEFAULT_CAPACITY = 8;

// Build a Date at a specific Israel-local clock time on a given calendar date.
// Israel is UTC+2 standard, UTC+3 during DST (last Friday March → last Sunday October).
// We compute the offset via Intl.DateTimeFormat to avoid hardcoding DST rules.
function israelLocalToUTC(year, month, day, hour, minute) {
  // Construct a UTC timestamp at the target wall-clock time, then adjust by IL offset for that date.
  const naive = new Date(Date.UTC(year, month, day, hour, minute));
  const offsetMinutes = getIsraelOffsetMinutes(naive);
  return new Date(naive.getTime() - offsetMinutes * 60_000);
}

function getIsraelOffsetMinutes(forDate) {
  // Format the date in Israel time, parse back, compare to UTC.
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(forDate).map((p) => [p.type, p.value]));
  const ilWallClockUTC = Date.UTC(
    parseInt(parts.year, 10),
    parseInt(parts.month, 10) - 1,
    parseInt(parts.day, 10),
    parseInt(parts.hour === '24' ? '00' : parts.hour, 10),
    parseInt(parts.minute, 10),
    parseInt(parts.second, 10),
  );
  return Math.round((ilWallClockUTC - forDate.getTime()) / 60_000);
}

function generateSlotsForWeeks(weeks) {
  const now = new Date();
  const slots = [];
  // For each upcoming day in the window
  for (let dayOffset = 0; dayOffset < weeks * 7 + 1; dayOffset++) {
    const target = new Date(now.getTime() + dayOffset * 86_400_000);
    const dow = target.getUTCDay();
    for (const t of SLOT_TEMPLATE) {
      if (t.dow !== dow) continue;
      const date = israelLocalToUTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate(), t.hour, t.minute);
      if (date.getTime() <= now.getTime()) continue; // skip past times
      slots.push({
        id: crypto.randomUUID(),
        date,
        capacity: DEFAULT_CAPACITY,
        labelHe: t.labelHe,
        labelEn: t.labelEn,
        location: t.location,
      });
    }
  }
  return slots;
}

async function main() {
  const sql = neon(DATABASE_URL);

  const slots = generateSlotsForWeeks(weeksAhead);
  console.log(`Generated ${slots.length} candidate slots for the next ${weeksAhead} weeks.`);

  if (dryRun) {
    slots.slice(0, 10).forEach((s) => {
      console.log(`  - ${s.date.toISOString()} · ${s.labelHe} · ${s.location}`);
    });
    if (slots.length > 10) console.log(`  ... and ${slots.length - 10} more`);
    console.log('Dry run; no inserts made.');
    return;
  }

  let inserted = 0;
  let skipped = 0;
  for (const s of slots) {
    // Skip if a slot already exists at the same datetime (idempotent)
    const existing = await sql`
      SELECT id FROM class_slots
      WHERE date = ${s.date.toISOString()}
      LIMIT 1
    `;
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    await sql`
      INSERT INTO class_slots (id, date, capacity, label_he, label_en, location, active, created_at)
      VALUES (${s.id}, ${s.date.toISOString()}, ${s.capacity}, ${s.labelHe}, ${s.labelEn}, ${s.location}, true, NOW())
    `;
    inserted++;
  }

  console.log(`Seed complete: ${inserted} inserted, ${skipped} skipped (already existed).`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
