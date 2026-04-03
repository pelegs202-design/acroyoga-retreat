"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePushPermission } from "@/hooks/usePushPermission";

export type JamData = {
  id: string;
  scheduledAt: string;
  location: string;
  capacity: number;
  level: string;
  notes: string | null;
  hostId: string;
  hostName: string | null;
  hostImage: string | null;
  confirmedCount: number;
  userRsvpStatus: string | null;
  attendees?: Array<{
    userId: string;
    name: string | null;
    image: string | null;
  }>;
  isPast?: boolean;
};

type Props = {
  jam: JamData;
  onRsvpChange?: (jamId: string, newStatus: string | null) => void;
};

const CANCEL_LOCK_MS = 4 * 60 * 60 * 1000;

function levelColor(level: string): string {
  switch (level) {
    case "beginner":
      return "bg-green-900 text-green-300 border-green-700";
    case "intermediate":
      return "bg-yellow-900 text-yellow-300 border-yellow-700";
    case "advanced":
      return "bg-red-900 text-red-300 border-red-700";
    default:
      return "bg-neutral-800 text-neutral-300 border-neutral-600";
  }
}

function levelLabel(level: string, t: ReturnType<typeof useTranslations>): string {
  switch (level) {
    case "beginner":
      return t("levelBeginner");
    case "intermediate":
      return t("levelIntermediate");
    case "advanced":
      return t("levelAdvanced");
    default:
      return t("levelAll");
  }
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function JamCard({ jam, onRsvpChange }: Props) {
  const t = useTranslations("jams");
  const { promptForPush, permissionState } = usePushPermission();
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(
    jam.userRsvpStatus
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheduledDate = new Date(jam.scheduledAt);
  const isFull = jam.confirmedCount >= jam.capacity;
  const isWithinLock =
    !jam.isPast && Date.now() > scheduledDate.getTime() - CANCEL_LOCK_MS;

  const dateStr = scheduledDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = scheduledDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleRsvp(action: "join" | "cancel") {
    setIsLoading(true);
    setError(null);

    // Optimistic update
    const prevStatus = optimisticStatus;
    if (action === "join") {
      setOptimisticStatus(isFull ? "waitlist" : "confirmed");
    } else {
      setOptimisticStatus(null);
    }

    try {
      const res = await fetch(`/api/jams/${jam.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        setOptimisticStatus(prevStatus);
        setError(data.error ?? t("rsvpError"));
        return;
      }

      const data = await res.json();
      const newStatus = action === "cancel" ? null : data.status;
      setOptimisticStatus(newStatus);
      onRsvpChange?.(jam.id, newStatus);

      // Prompt for push permission after first successful RSVP join (fire-and-forget)
      if (action === "join" && permissionState === "default") {
        void promptForPush();
      }
    } catch {
      setOptimisticStatus(prevStatus);
      setError(t("rsvpError"));
    } finally {
      setIsLoading(false);
    }
  }

  const attendees = jam.attendees ?? [];
  const visibleAttendees = attendees.slice(0, 4);
  const extraCount = attendees.length - visibleAttendees.length;

  return (
    <article className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-700">
      {/* Header: date + level */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-neutral-100">
            {dateStr} &middot; {timeStr}
          </p>
          <p className="mt-0.5 text-sm text-neutral-400">{jam.location}</p>
        </div>
        <span
          className={`shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${levelColor(jam.level)}`}
        >
          {levelLabel(jam.level, t)}
        </span>
      </div>

      {/* Host */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-700 text-[10px] font-bold text-neutral-300">
          {jam.hostImage ? (
            <Image
              src={jam.hostImage}
              alt={jam.hostName ?? ""}
              width={24}
              height={24}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(jam.hostName)
          )}
        </div>
        <p className="text-xs text-neutral-400">
          {t("hostedBy", { name: jam.hostName ?? "?" })}
        </p>
      </div>

      {/* Spots + Attendee avatars */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-neutral-300">
          {t("spotsRemaining", {
            confirmed: jam.confirmedCount,
            capacity: jam.capacity,
          })}
        </p>

        {attendees.length > 0 && (
          <div className="flex items-center">
            {visibleAttendees.map((a, i) => (
              <div
                key={a.userId}
                className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-neutral-900 bg-neutral-700"
                style={{ marginLeft: i > 0 ? "-8px" : "0" }}
              >
                {a.image ? (
                  <Image
                    src={a.image}
                    alt={a.name ?? ""}
                    width={24}
                    height={24}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[9px] font-bold text-neutral-300">
                    {getInitials(a.name)}
                  </span>
                )}
              </div>
            ))}
            {extraCount > 0 && (
              <p
                className="ml-1 text-xs text-neutral-500"
                style={{ marginLeft: "-4px" }}
              >
                {t("andMore", { count: extraCount })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      {jam.notes && (
        <p className="mb-3 line-clamp-2 text-xs text-neutral-500">{jam.notes}</p>
      )}

      {/* Error */}
      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

      {/* RSVP button */}
      {!jam.isPast && (
        <div className="mt-1">
          {optimisticStatus === "confirmed" ? (
            <button
              onClick={() => handleRsvp("cancel")}
              disabled={isLoading || isWithinLock}
              title={isWithinLock ? t("locked") : undefined}
              className="w-full rounded border border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isWithinLock ? t("locked") : t("cancelRsvp")}
            </button>
          ) : optimisticStatus === "waitlist" ? (
            <button
              onClick={() => handleRsvp("cancel")}
              disabled={isLoading || isWithinLock}
              title={isWithinLock ? t("locked") : undefined}
              className="w-full rounded border border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isWithinLock ? t("locked") : t("cancelWaitlist")}
            </button>
          ) : (
            <button
              onClick={() => handleRsvp("join")}
              disabled={isLoading}
              className="w-full rounded bg-brand px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFull ? t("joinWaitlist") : t("join")}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
