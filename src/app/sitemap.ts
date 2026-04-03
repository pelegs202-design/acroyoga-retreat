import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { jamSessions } from "@/lib/db/schema";
import { gte } from "drizzle-orm";

const BASE_URL = "https://acroretreat.co.il";
const LOCALES = ["he", "en"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/cities/tel-aviv", "/cities/kfar-saba"];

  const staticEntries = LOCALES.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1.0 : 0.8,
    }))
  );

  // Only future jams — past jams have no search value
  const upcomingJams = await db
    .select({ id: jamSessions.id, scheduledAt: jamSessions.scheduledAt })
    .from(jamSessions)
    .where(gte(jamSessions.scheduledAt, new Date()));

  const jamEntries = upcomingJams.flatMap((jam) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/jams/${jam.id}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }))
  );

  return [...staticEntries, ...jamEntries];
}
