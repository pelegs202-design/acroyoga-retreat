import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MotionProvider } from "@/components/layout/MotionProvider";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import IosBanner from "@/components/pwa/IosBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildOrganizationSchema } from "@/lib/seo/schemas";
import "../globals.css";

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-heebo",
  preload: true,
});

export const metadata: Metadata = {
  title: { default: "AcroHavura", template: "%s | AcroHavura" },
  description: "Find acro partners and events near you",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages for this locale
  const messages = await getMessages();

  // RTL for Hebrew, LTR for all other locales
  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${heebo.variable} antialiased`}>
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        {/* GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BCPEPDR543"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BCPEPDR543');
          `}
        </Script>
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1646755465782002');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.net/tr?id=1646755465782002&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <JsonLd data={buildOrganizationSchema()} />
        <NextIntlClientProvider messages={messages}>
          <MotionProvider>
            <Header />
            {children}
            <Footer />
            <InstallPrompt />
            <IosBanner />
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
