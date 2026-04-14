/**
 * Returns the next Monday from the given date (or today).
 * If today is Monday, returns NEXT Monday (7 days ahead).
 */
export function nextMonday(from: Date = new Date()): Date {
  const d = new Date(from);
  const day = d.getDay();
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatNextMonday(locale: string): string {
  const d = nextMonday();
  return d.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
    day: "numeric",
    month: "long",
  });
}

/**
 * Returns the next occurrence of a given weekday (0=Sun, 1=Mon, ..., 6=Sat) at a given hour:minute.
 * If today matches and the time is still upcoming, returns today. Otherwise the next future occurrence.
 */
export function nextOccurrence(weekday: number, hour: number, minute: number, from: Date = new Date()): Date {
  const d = new Date(from);
  const today = d.getDay();
  let daysAhead = (weekday - today + 7) % 7;
  if (daysAhead === 0) {
    // same weekday — check if time has already passed today
    const candidate = new Date(d);
    candidate.setHours(hour, minute, 0, 0);
    if (candidate.getTime() > d.getTime()) return candidate;
    daysAhead = 7;
  }
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/**
 * Short human format: "שני 20.4" / "Mon Apr 20". For day-picker chips.
 */
export function formatShortDate(date: Date, locale: string): string {
  if (locale === "he") {
    return `${date.getDate()}.${date.getMonth() + 1}`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * "היום" / "מחר" / "בעוד 3 ימים" style relative label for trial urgency.
 */
export function relativeDayLabel(date: Date, locale: string, from: Date = new Date()): string {
  const diff = Math.floor((date.getTime() - from.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
  const isHe = locale === "he";
  if (diff <= 0) return isHe ? "היום" : "today";
  if (diff === 1) return isHe ? "מחר" : "tomorrow";
  if (diff === 2) return isHe ? "מחרתיים" : "in 2 days";
  if (diff < 7) return isHe ? `בעוד ${diff} ימים` : `in ${diff} days`;
  return isHe ? `בעוד ${diff} ימים` : `in ${diff} days`;
}
