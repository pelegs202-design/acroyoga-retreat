"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession } from "@/lib/auth-client";

const HIDDEN_PATH_PREFIXES = [
  "/quiz",
  "/sign-in",
  "/sign-up",
  "/admin",
  "/dashboard",
  "/messages",
  "/profile",
  "/settings",
  "/members",
];

export default function MobileStickyCta() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const { data: session } = useSession();

  if (session) return null;
  if (HIDDEN_PATH_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 sm:hidden border-t-2 border-brand bg-[#0a0a0a]/95 backdrop-blur-md px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
      role="region"
      aria-label={t("stickyCta.aria")}
    >
      <Link
        href="/quiz"
        className="btn-press flex items-center justify-center gap-2 w-full bg-brand text-black font-black uppercase tracking-wide py-3 text-base border-2 border-brand active:translate-y-0.5 transition-transform"
      >
        <span>{t("stickyCta.label")}</span>
        <span aria-hidden="true">←</span>
      </Link>
    </div>
  );
}
