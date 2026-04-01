"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import JamCard, { type JamData } from "./JamCard";

type ApiResponse = {
  upcoming: JamData[];
  past: JamData[];
  isJamHost?: boolean;
};

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-36 rounded bg-neutral-800" />
          <div className="h-3 w-24 rounded bg-neutral-800" />
        </div>
        <div className="h-5 w-20 rounded bg-neutral-800" />
      </div>
      <div className="mb-3 flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-neutral-800" />
        <div className="h-3 w-28 rounded bg-neutral-800" />
      </div>
      <div className="mb-3 h-3 w-16 rounded bg-neutral-800" />
      <div className="h-8 w-full rounded bg-neutral-800" />
    </div>
  );
}

export default function JamFeed() {
  const t = useTranslations("jams");

  const [upcoming, setUpcoming] = useState<JamData[]>([]);
  const [past, setPast] = useState<JamData[]>([]);
  const [isJamHost, setIsJamHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pastLoading, setPastLoading] = useState(false);
  const [pastOpen, setPastOpen] = useState(false);
  const [pastFetched, setPastFetched] = useState(false);

  const [cityFilter, setCityFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const buildUrl = useCallback(
    (includePast: boolean) => {
      const params = new URLSearchParams();
      if (cityFilter) params.set("city", cityFilter);
      if (levelFilter) params.set("level", levelFilter);
      if (includePast) params.set("past", "true");
      const qs = params.toString();
      return `/api/jams${qs ? `?${qs}` : ""}`;
    },
    [cityFilter, levelFilter]
  );

  const fetchUpcoming = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl(false));
      if (!res.ok) return;
      const data: ApiResponse = await res.json();
      setUpcoming(data.upcoming ?? []);
      if (data.isJamHost !== undefined) setIsJamHost(data.isJamHost);
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  const fetchPast = useCallback(async () => {
    setPastLoading(true);
    try {
      const res = await fetch(buildUrl(true));
      if (!res.ok) return;
      const data: ApiResponse = await res.json();
      setPast((data.past ?? []).map((j) => ({ ...j, isPast: true })));
    } finally {
      setPastLoading(false);
      setPastFetched(true);
    }
  }, [buildUrl]);

  // Fetch upcoming on mount and when filters change
  useEffect(() => {
    fetchUpcoming();
    // Reset past state when filters change
    setPastFetched(false);
    setPast([]);
    if (pastOpen) {
      fetchPast();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFilter, levelFilter]);

  // Initial fetch
  useEffect(() => {
    fetchUpcoming();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePastToggle() {
    const next = !pastOpen;
    setPastOpen(next);
    if (next && !pastFetched) {
      fetchPast();
    }
  }

  function handleRsvpChange(jamId: string, newStatus: string | null) {
    setUpcoming((prev) =>
      prev.map((j) =>
        j.id === jamId ? { ...j, userRsvpStatus: newStatus } : j
      )
    );
  }

  // Debounced city filter — wait 300ms after user stops typing
  const [debouncedCity, setDebouncedCity] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setCityFilter(debouncedCity), 300);
    return () => clearTimeout(timer);
  }, [debouncedCity]);

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-100">{t("title")}</h1>
        {isJamHost && (
          <Link
            href="/jams/new"
            className="rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-muted"
          >
            {t("postJam")}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={debouncedCity}
          onChange={(e) => setDebouncedCity(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-brand focus:outline-none"
        />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 focus:border-brand focus:outline-none"
        >
          <option value="">{t("filterAll")}</option>
          <option value="beginner">{t("levelBeginner")}</option>
          <option value="intermediate">{t("levelIntermediate")}</option>
          <option value="advanced">{t("levelAdvanced")}</option>
        </select>
      </div>

      {/* Upcoming jams */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-neutral-200">
          {t("upcoming")}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-neutral-400">
              {isJamHost ? t("noUpcomingHost") : t("noUpcoming")}
            </p>
            {isJamHost && (
              <Link
                href="/jams/new"
                className="mt-4 inline-block rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-muted"
              >
                {t("postJam")}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((jam) => (
              <JamCard key={jam.id} jam={jam} onRsvpChange={handleRsvpChange} />
            ))}
          </div>
        )}
      </section>

      {/* Past jams — collapsible */}
      <section>
        <button
          onClick={handlePastToggle}
          className="mb-4 flex w-full items-center gap-2 text-left text-sm font-medium text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <span
            className={`inline-block transition-transform ${pastOpen ? "rotate-90" : ""}`}
          >
            &#9654;
          </span>
          {past.length > 0
            ? t("pastCount", { count: past.length })
            : t("past")}
        </button>

        {pastOpen && (
          <div>
            {pastLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : past.length === 0 ? (
              <p className="text-sm text-neutral-600">{t("noUpcoming")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((jam) => (
                  <JamCard key={jam.id} jam={jam} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
