"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import LanguageToggle from "./LanguageToggle";
import MobileMenu from "./MobileMenu";

// Quiz funnel paths where we hide the header to reduce distractions
const FUNNEL_PATHS = ["/quiz/challenge"];

/**
 * Header — Brutalist fixed nav bar matching Stitch-generated design.
 *
 * @see stitch-screens/header-footer.html
 * @see stitch-screens/header-footer.png
 */
export default function Header() {
  const t = useTranslations("common");
  const tAuth = useTranslations("auth");
  const tJams = useTranslations("jams");
  const tMessages = useTranslations("messages");
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide header on funnel pages to prevent accidental navigation
  const isInFunnel = FUNNEL_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!session || isInFunnel) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/messages/unread");
        if (res.ok) {
          const data = (await res.json()) as { unreadCount: number };
          setUnreadCount(data.unreadCount);
        }
      } catch {
        // Silent
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [session, isInFunnel]);

  if (isInFunnel) return null;

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center bg-[#0a0a0a]/90 backdrop-blur-md border-b-2 border-neutral-800 px-6 lg:px-12">
        <div className="container mx-auto flex items-center justify-between">
          {/* Wordmark */}
          <Link
            href="/"
            className="text-2xl font-black tracking-tighter uppercase"
            aria-label={t("appName")}
          >
            <span className="text-brand">Acro</span>
            <span className="text-white">Havura</span>
          </Link>

          {/* Center nav — desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest">
            {!isPending && session && (
              <>
                <Link
                  href="/jams"
                  className="text-white/70 hover:text-brand transition-colors"
                >
                  {tJams("title")}
                </Link>
                <Link
                  href="/members"
                  className="text-white/70 hover:text-brand transition-colors"
                >
                  {tAuth("dashboard")}
                </Link>
                <Link
                  href="/messages"
                  className="relative text-white/70 hover:text-brand transition-colors"
                >
                  {tMessages("title")}
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -end-3 flex h-4 min-w-4 items-center justify-center bg-brand px-1 text-[10px] font-bold text-black leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            {!isPending && !session && (
              <>
                <Link href="/jams" className="text-white/70 hover:text-brand transition-colors">
                  {tJams("title")}
                </Link>
                <Link href="/members" className="text-white/70 hover:text-brand transition-colors">
                  {tAuth("dashboard")}
                </Link>
                <Link href="/quiz/challenge" className="text-white/70 hover:text-brand transition-colors">
                  {t("challenge") ?? "אתגר 30 יום"}
                </Link>
              </>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-6">
            <LanguageToggle />

            {!isPending && (
              <>
                {session ? (
                  <div className="hidden sm:flex items-center gap-4">
                    <span className="hidden lg:block truncate text-sm text-gray-400 max-w-[120px]">
                      {session.user.name || session.user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="btn-press border-2 border-neutral-700 px-4 py-1.5 text-sm font-bold uppercase text-neutral-300 hover:border-brand hover:text-brand transition-colors"
                    >
                      {tAuth("signOut")}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    className="hidden sm:block btn-press bg-brand text-[#0a0a0a] px-6 py-2 font-black text-sm uppercase border-2 border-brand hover:bg-transparent hover:text-brand transition-all duration-300"
                  >
                    {tAuth("signIn")}
                  </Link>
                )}
              </>
            )}

            {/* Hamburger — mobile */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("menu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex flex-col gap-[5px] p-2 sm:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="block h-[2px] w-6 bg-brand" aria-hidden="true" />
              <span className="block h-[2px] w-6 bg-brand" aria-hidden="true" />
              <span className="block h-[2px] w-6 bg-brand" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onOpenChange={setMenuOpen} unreadCount={unreadCount} />
    </>
  );
}
