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
