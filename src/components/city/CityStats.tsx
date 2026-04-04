import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { user, jamSessions } from "@/lib/db/schema";
import { and, count, eq, gte, or, ilike, isNull } from "drizzle-orm";

type CitySlug = "tel-aviv" | "kfar-saba";

type Props = {
  city: CitySlug;
  locale?: string;
};

const CITY_NAMES: Record<CitySlug, { he: string; en: string }> = {
  "tel-aviv": { he: "תל אביב", en: "Tel Aviv" },
  "kfar-saba": { he: "כפר סבא", en: "Kfar Saba" },
};

/**
 * CityStats — Brutalist stats row matching Stitch city-page.html.
 *
 * Full-width bordered section with stat boxes separated by border dividers.
 * Numbers in pink, labels in white. Matching the Stitch Stats Row section.
 *
 * @see stitch-screens/city-page.html (Stats Row)
 * @see stitch-screens/city-page.png
 */
export default async function CityStats({ city, locale = "he" }: Props) {
  const t = await getTranslations({ locale, namespace: "city.stats" });
  const cityName = CITY_NAMES[city];
  const now = new Date();

  const [memberResult] = await db
    .select({ count: count() })
    .from(user)
    .where(
      or(
        ilike(user.city, `%${cityName.he}%`),
        ilike(user.city, `%${cityName.en}%`)
      )
    );

  const [jamResult] = await db
    .select({ count: count() })
    .from(jamSessions)
    .where(
      and(
        gte(jamSessions.scheduledAt, now),
        or(
          eq(jamSessions.city, city),
          and(
            isNull(jamSessions.city),
            or(
              ilike(jamSessions.location, `%${cityName.he}%`),
              ilike(jamSessions.location, `%${cityName.en}%`)
            )
          )
        )
      )
    );

  const memberCount = memberResult?.count ?? 0;
  const jamCount = jamResult?.count ?? 0;

  const stats = [
    { value: `${jamCount}`, label: t("jams", { count: jamCount }) },
    { value: `${memberCount}+`, label: t("members", { count: memberCount }) },
    { value: "4", label: locale === "he" ? "מיקומים" : "Locations" },
  ];

  return (
    <section className="border-y-2 border-white/20 bg-[#0a0a0a] py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-6 border-x border-white/10">
              <div className="text-5xl font-black text-brand mb-2">{stat.value}</div>
              <div className="text-lg font-bold text-white">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
