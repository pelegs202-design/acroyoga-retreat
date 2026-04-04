// Performance budget (Phase 10 — Lighthouse 90+ mobile):
// LCP < 2.5s, CLS < 0.1, FCP < 1.8s, TBT < 200ms
// Animate ONLY: transform, opacity (compositor-safe)
// Hero image: CSS gradient background — no <img> LCP element
// Mobile: no parallax (ParallaxLayer disables useScroll < 768px), no horizontal scroll
// Fonts: Heebo via next/font/google — preload=true, display=swap, latin+hebrew subsets
// 3rd-party scripts: GA4 + Meta Pixel use strategy="afterInteractive" (no render-block)
// Decorative aria-hidden elements exempted from WCAG 1.4.3 (non-text content exception)

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";
import crypto from "crypto";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const revision = crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default withSerwist(withNextIntl(nextConfig));
