import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { db } from "@/lib/db";
import { jamSessions } from "@/lib/db/schema";
import { and, gte, eq, or, ilike, asc, isNull } from "drizzle-orm";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildEventSchema } from "@/lib/seo/schemas";

type CitySlug = "tel-aviv" | "kfar-saba";

type Props = {
  city: CitySlug;
  locale: string;
};

const CITY_NAMES: Record<CitySlug, { he: string; en: string }> = {
  "tel-aviv": { he: "תל אביב", en: "Tel Aviv" },
  "kfar-saba": { he: "כפר סבא", en: "Kfar Saba" },
};

const LEVEL_LABELS: Record<string, { he: string; en: string }> = {
  all: { he: "כל הרמות", en: "All Levels" },
  beginner: { he: "מתחילים", en: "Beginner" },
  intermediate: { he: "בינוניים", en: "Intermediate" },
  advanced: { he: "מתקדמים", en: "Advanced" },
};

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * CityJamList — server component.
 * Queries upcoming jams for the given city, with ILIKE fallback on location field
 * for existing jams that don't have city column set yet.
 */
export default async function CityJamList({ city, locale }: Props) {
  const t = await getTranslations({ locale, namespace: "city" });
  const cityName = CITY_NAMES[city];
  const now = new Date();

  // Query: city column match OR (city IS NULL AND location ILIKE cityName)
  const jams = await db
    .select()
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
    )
    .orderBy(asc(jamSessions.scheduledAt))
    .limit(6);

  return (
    <section>
      <h2 className="mb-6 text-3xl font-black uppercase tracking-tight text-neutral-100">
        {t("upcomingJams")}
      </h2>

      {jams.length === 0 ? (
        <div className="border-4 border-dashed border-neutral-700 p-8 text-center">
          <p className="text-lg text-neutral-400">
            {t("noJams", { city: locale === "he" ? cityName.he : cityName.en })}
          </p>
          <Link
            href={`/${locale}/jams`}
            className="mt-4 inline-block border-4 border-neutral-100 bg-transparent px-6 py-3 text-sm font-black uppercase tracking-widest text-neutral-100 transition-all hover:bg-neutral-100 hover:text-neutral-950"
          >
            {locale === "he" ? "כל הג׳אמים" : "View All Jams"}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jams.map((jam) => (
            <div key={jam.id}>
              <JsonLd
                data={buildEventSchema({
                  id: jam.id,
                  scheduledAt: jam.scheduledAt,
                  location: jam.location,
                  level: jam.level,
                })}
              />
              <div className="card-hover border-4 border-neutral-100 bg-neutral-900 p-5 transition-colors hover:bg-neutral-800">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand">
                  {formatDate(jam.scheduledAt, locale)}
                </p>
                <p className="mb-2 text-base font-bold text-neutral-100">
                  {jam.location}
                </p>
                <div className="flex items-center justify-between">
                  <span className="rounded border-2 border-neutral-600 px-2 py-0.5 text-xs font-semibold text-neutral-400">
                    {(LEVEL_LABELS[jam.level] ?? LEVEL_LABELS.all)[
                      locale === "he" ? "he" : "en"
                    ]}
                  </span>
                  <Link
                    href={`/${locale}/jams`}
                    className="border-2 border-brand px-3 py-1 text-xs font-black uppercase tracking-widest text-brand transition-all hover:bg-brand hover:text-neutral-950"
                  >
                    {t("joinJam")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
