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

function formatDateBadge(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * CityJamList — Brutalist jam cards matching Stitch city-page.html.
 *
 * Jam cards with pink date badge at top-left corner, location name,
 * host info, and spots remaining counter. Thick 2px borders with
 * pink border on hover.
 *
 * @see stitch-screens/city-page.html (Upcoming Jams section)
 */
export default async function CityJamList({ city, locale }: Props) {
  const t = await getTranslations({ locale, namespace: "city" });
  const cityName = CITY_NAMES[city];
  const now = new Date();

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
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="text-4xl font-black mb-4 underline decoration-brand decoration-8 underline-offset-8">
              {t("upcomingJams")}
            </h2>
            <p className="text-gray-400">
              {t("noJams", { city: locale === "he" ? cityName.he : cityName.en }).replace(/^אין/, locale === "he" ? "הצטרפו למפגשים הפתוחים ב" : "Join open sessions in")}
            </p>
          </div>
          <Link
            href={`/${locale}/jams`}
            className="text-brand font-bold border-b-2 border-brand hover:text-white hover:border-white transition-all"
          >
            {locale === "he" ? "לכל האירועים ←" : "All events →"}
          </Link>
        </div>

        {jams.length === 0 ? (
          <div className="border-2 border-dashed border-neutral-700 p-8 text-center">
            <p className="text-lg text-neutral-400">
              {t("noJams", { city: locale === "he" ? cityName.he : cityName.en })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div className="bg-neutral-900 p-8 border-2 border-white relative group hover:border-brand transition-colors">
                  {/* Pink date badge — top left */}
                  <div className="absolute top-0 start-0 bg-brand text-black font-black px-4 py-2">
                    {formatDateBadge(jam.scheduledAt, locale)}
                  </div>
                  <div className="mt-8">
                    <h3 className="text-2xl font-black mb-2">{jam.location}</h3>
                    <p className="text-gray-400 mb-6">{jam.notes || ""}</p>
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-sm font-bold">
                        {locale === "he" ? "רמה:" : "Level:"} {jam.level}
                      </span>
                      <span className="text-brand font-black">
                        {jam.capacity} {locale === "he" ? "מקומות" : "spots"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
