"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import LanguageToggle from "./LanguageToggle";
import MobileMenu from "./MobileMenu";
import { MagneticWrapper } from "@/components/effects/MagneticWrapper";

export default function Header() {
  const t = useTranslations("common");
  const tAuth = useTranslations("auth");
  const tJams = useTranslations("jams");
  const tMessages = useTranslations("messages");
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <>
      {/* ============================================================
          HEADER — Brutalist sticky bar
          Per stitch-screens/header-footer.html:
          - 72px height, semi-transparent bg with backdrop blur
          - Pink bottom border accent
          - Bold logo: pink dot + "Acro" (white) + "Havura" (pink)
          - Uppercase bold nav links with magnetic hover
          - Hamburger on mobile
      ============================================================ */}
      <header className="sticky top-0 z-50 flex h-[72px] w-full items-center border-b border-brand/15 bg-[#0a0a0a]/95 px-4 backdrop-blur-[8px] sm:px-8 lg:px-[8vw]">
        <div className="flex w-full items-center justify-between gap-6">

          {/* Brand wordmark — dominant visual anchor */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-black tracking-tighter"
            aria-label={t("appName")}
          >
            {/* Brutalist pink square dot accent */}
            <span className="h-[6px] w-[6px] shrink-0 bg-brand" aria-hidden="true" />
            <span className="text-2xl text-neutral-100">Acro</span>
            <span className="text-2xl text-brand">Havura</span>
          </Link>

          {/* Desktop nav links — centered, magnetic hover, uppercase bold */}
          <nav className="hidden flex-1 items-center justify-center gap-1 sm:flex" aria-label="Main navigation">
            {!isPending && session && (
              <>
                <MagneticWrapper strength={0.25}>
                  <Link
                    href="/members"
                    className="group relative px-4 py-2 text-sm font-bold uppercase tracking-wide text-neutral-200/60 transition-colors duration-150 hover:text-neutral-100"
                  >
                    {tAuth("dashboard")}
                    {/* Brutalist underline: scales from 0 to full on hover */}
                    <span className="absolute inset-x-4 bottom-0 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-200 group-hover:scale-x-100" aria-hidden="true" />
                  </Link>
                </MagneticWrapper>

                <MagneticWrapper strength={0.25}>
                  <Link
                    href="/jams"
                    className="group relative px-4 py-2 text-sm font-bold uppercase tracking-wide text-neutral-200/60 transition-colors duration-150 hover:text-neutral-100"
                  >
                    {tJams("title")}
                    <span className="absolute inset-x-4 bottom-0 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-200 group-hover:scale-x-100" aria-hidden="true" />
                  </Link>
                </MagneticWrapper>

                <MagneticWrapper strength={0.25}>
                  <Link
                    href="/messages"
                    className="group relative px-4 py-2 text-sm font-bold uppercase tracking-wide text-neutral-200/60 transition-colors duration-150 hover:text-neutral-100"
                  >
                    {tMessages("title")}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-black leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                    <span className="absolute inset-x-4 bottom-0 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-200 group-hover:scale-x-100" aria-hidden="true" />
                  </Link>
                </MagneticWrapper>
              </>
            )}
          </nav>

          {/* Trailing controls: auth + language + hamburger */}
          <div className="flex shrink-0 items-center gap-3">

            {/* Auth state — desktop only (hidden while loading to avoid flicker) */}
            {!isPending && (
              <>
                {session ? (
                  <div className="hidden items-center gap-3 sm:flex">
                    {/* User name */}
                    <span className="hidden truncate text-sm text-neutral-400 sm:block max-w-[120px]">
                      {session.user.name || session.user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="btn-press border border-neutral-700 px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-neutral-300 transition-colors hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      {tAuth("signOut")}
                    </button>
                  </div>
                ) : (
                  <div className="hidden items-center gap-2 sm:flex">
                    <Link
                      href="/sign-in"
                      className="btn-press px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-neutral-300 transition-colors hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      {tAuth("signIn")}
                    </Link>
                    <Link
                      href="/sign-up"
                      className="btn-press bg-brand px-4 py-1.5 text-sm font-black uppercase tracking-wide text-black transition-colors hover:bg-brand-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      {tAuth("signUp")}
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Language toggle — always visible */}
            <LanguageToggle />

            {/* Hamburger button — mobile only, triggers Radix Dialog MobileMenu */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("menu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex flex-col gap-[5px] p-2 sm:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="block h-[2px] w-6 bg-neutral-100 transition-transform duration-200" aria-hidden="true" />
              <span className="block h-[2px] w-6 bg-neutral-100 transition-transform duration-200" aria-hidden="true" />
              <span className="block h-[2px] w-6 bg-neutral-100 transition-transform duration-200" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — Radix Dialog Sheet pattern (DSGN-04: focus trap, escape-to-close, aria-modal, scroll lock) */}
      <MobileMenu
        isOpen={menuOpen}
        onOpenChange={setMenuOpen}
        unreadCount={unreadCount}
      />
    </>
  );
}
