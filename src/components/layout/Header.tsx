"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const t = useTranslations("common");
  const tAuth = useTranslations("auth");
  const tJams = useTranslations("jams");
  const tMessages = useTranslations("messages");
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for unread message count every 10 seconds
  useEffect(() => {
    if (!session) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/messages/unread");
        if (res.ok) {
          const data = (await res.json()) as { unreadCount: number };
          setUnreadCount(data.unreadCount);
        }
      } catch {
        // Silently fail — badge is non-critical
      }
    };

    fetchUnread(); // Initial fetch
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [session]);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-neutral-800 bg-neutral-900 px-4 sm:px-6">
      {/* App name — leading edge, adapts to RTL/LTR via logical properties */}
      <span className="text-xl font-black tracking-tight text-brand">
        {t("appName")}
      </span>

      {/* Trailing-edge controls: nav links + auth status + language toggle */}
      <div className="ms-auto flex items-center gap-3">
        {/* Auth-gated nav links */}
        {!isPending && session && (
          <>
            <Link
              href="/members"
              className="hidden text-sm text-neutral-300 transition-colors hover:text-neutral-100 sm:block"
            >
              {tAuth("dashboard")}
            </Link>
            <Link
              href="/jams"
              className="hidden text-sm text-neutral-300 transition-colors hover:text-neutral-100 sm:block"
            >
              {tJams("title")}
            </Link>
            {/* Messages link with unread badge */}
            <Link
              href="/messages"
              className="relative hidden text-sm text-neutral-300 transition-colors hover:text-neutral-100 sm:block"
            >
              {tMessages("title")}
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          </>
        )}

        {/* Auth state — hidden while loading to avoid flicker */}
        {!isPending && (
          <>
            {session ? (
              <>
                {/* User name — hidden on very small screens */}
                <span className="hidden truncate text-sm text-neutral-300 sm:block max-w-[120px]">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {tAuth("signOut")}
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {tAuth("signIn")}
              </Link>
            )}
          </>
        )}

        {/* Language toggle — always visible */}
        <LanguageToggle />
      </div>
    </header>
  );
}
