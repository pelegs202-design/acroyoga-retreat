import { setRequestLocale } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Auth Layout — Brutalist framing per stitch-screens/auth-signin.html design spec.
 *
 * Provides:
 * - Dark #0a0a0a full-screen background
 * - Centered card with thick 2px pink (brand) border
 * - Asymmetric pink decorative accent bar behind the card
 * - Generous p-8 sm:p-12 internal padding
 * - RTL-safe using CSS logical properties
 */
export default async function AuthLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-12">
      {/* Asymmetric brutalist decoration: thick vertical pink line rotated behind card */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Diagonal pink accent line (per auth-signin.html .auth-brand-panel::before) */}
        <div className="absolute left-[40%] top-[-100px] h-[200%] w-[2px] -translate-x-1/2 rotate-[20deg] bg-gradient-to-b from-transparent via-brand/30 to-transparent" />
        {/* Large ghosted "ACRO" background text */}
        <div className="absolute -bottom-16 -end-10 text-[18vw] font-black leading-none text-brand/[0.04] select-none">
          ACRO
        </div>
      </div>

      {/* Brutalist bordered card */}
      <div className="relative z-10 w-full max-w-md border-2 border-brand bg-neutral-900 p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.5)] sm:p-12">
        {children}
      </div>
    </div>
  );
}
