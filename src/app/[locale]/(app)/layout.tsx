import { setRequestLocale } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Authenticated app route group layout.
 * The outer [locale]/layout.tsx already provides Header, NextIntlClientProvider, and html/body.
 * This layout handles the app-specific container and any authenticated-only chrome.
 */
export default async function AppLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {children}
    </main>
  );
}
