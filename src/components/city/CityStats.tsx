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
 * CityStats — server component.
 * Displays member count and upcoming jam count for a city.
 */
export default async function CityStats({ city, locale = "he" }: Props) {
  const t = await getTranslations({ locale, namespace: "city.stats" });
  const cityName = CITY_NAMES[city];
  const now = new Date();

  // Count members with matching city (ILIKE for loose match on user.city text field)
  const [memberResult] = await db
    .select({ count: count() })
    .from(user)
    .where(
      or(
        ilike(user.city, `%${cityName.he}%`),
        ilike(user.city, `%${cityName.en}%`)
      )
    );

  // Count upcoming jams for this city
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
    {
      value: memberCount,
      label: t("members", { count: memberCount }),
      raw: memberCount,
    },
    {
      value: jamCount,
      label: t("jams", { count: jamCount }),
      raw: jamCount,
    },
  ];

  return (
    <section>
      <h2 className="mb-6 text-3xl font-black uppercase tracking-tight text-neutral-100">
        {t("title")}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="card-hover border-4 border-neutral-100 bg-neutral-900 p-8 text-center"
          >
            <p className="mb-2 text-6xl font-black tabular-nums text-brand sm:text-7xl">
              {stat.raw}
            </p>
            <p className="text-lg font-bold uppercase tracking-widest text-neutral-300">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
