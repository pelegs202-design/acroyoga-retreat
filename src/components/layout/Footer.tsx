"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const FUNNEL_PATHS = ["/quiz/challenge"];

/**
 * Footer — Brutalist footer matching Stitch-generated design.
 *
 * Three columns: Navigation | Contact/Social | Brand wordmark
 * Pink section headings, bordered social icon squares with fill-on-hover,
 * thick border-t-2, copyright bar at bottom.
 *
 * @see stitch-screens/header-footer.html (MainFooter section)
 * @see stitch-screens/header-footer.png
 */
export default function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();

  if (FUNNEL_PATHS.some((p) => pathname.startsWith(p))) return null;

  return (
    <footer className="bg-[#0a0a0a] border-t-2 border-neutral-800 pt-20 pb-10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          {/* Column 1: Navigation */}
          <div>
            <h4 className="text-brand font-black uppercase tracking-widest mb-6 text-sm">
              {t("nav.platform")}
            </h4>
            <ul className="space-y-4 font-bold text-sm">
              <li>
                <Link href="/" className="text-white/70 hover:text-brand transition-colors">
                  {t("nav.quiz")}
                </Link>
              </li>
              <li>
                <Link href="/jams" className="text-white/70 hover:text-brand transition-colors">
                  {t("nav.community")}
                </Link>
              </li>
              <li>
                <Link href="/cities/tel-aviv" className="text-white/70 hover:text-brand transition-colors">
                  {t("nav.telAviv")}
                </Link>
              </li>
              <li>
                <Link href="/cities/kfar-saba" className="text-white/70 hover:text-brand transition-colors">
                  {t("nav.kfarSaba")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Social & Contact */}
          <div className="flex flex-col items-start">
            <h4 className="text-brand font-black uppercase tracking-widest mb-6 text-sm">
              {t("nav.community")}
            </h4>
            <p className="text-gray-400 mb-6 font-mono text-sm">info@acrohavura.co.il</p>
            <div className="flex gap-4">
              {/* Instagram */}
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-12 h-12 border-2 border-brand flex items-center justify-center hover:bg-brand transition-all group"
              >
                <svg className="w-5 h-5 stroke-brand group-hover:stroke-[#0a0a0a]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-12 h-12 border-2 border-brand flex items-center justify-center hover:bg-brand transition-all group"
              >
                <svg className="w-5 h-5 stroke-brand group-hover:stroke-[#0a0a0a]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-12 h-12 border-2 border-brand flex items-center justify-center hover:bg-brand transition-all group"
              >
                <svg className="w-5 h-5 stroke-brand group-hover:stroke-[#0a0a0a]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 3: Brand */}
          <div className="text-end">
            <div className="text-4xl font-black tracking-tighter uppercase mb-4">
              <span className="text-brand">Acro</span><span>Havura</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t("tagline")}
            </p>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-gray-500">
          <div>{t("copyright")}</div>
          <div className="flex gap-6">
            <Link href="/tos" className="hover:text-white transition-colors">
              {t("nav.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
