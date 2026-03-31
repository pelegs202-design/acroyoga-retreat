"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const t = useTranslations("common");
  const tAuth = useTranslations("auth");
  const { data: session, isPending } = useSession();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-neutral-800 bg-neutral-900 px-4 sm:px-6">
      {/* App name — leading edge, adapts to RTL/LTR via logical properties */}
      <span className="text-lg font-bold tracking-tight text-neutral-100">
        {t("appName")}
      </span>

      {/* Trailing-edge controls: auth status + language toggle */}
      <div className="ms-auto flex items-center gap-3">
        {/* Auth state — hidden while loading to avoid flicker */}
        {!isPending && (
          <>
            {session ? (
              <>
                {/* User name — hidden on very small screens, icon implied by context */}
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
