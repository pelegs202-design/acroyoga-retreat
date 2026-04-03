import { setRequestLocale } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Public route group layout — no auth guard.
 * Crawlable by search bots. Wraps city landing pages, etc.
 * The outer [locale]/layout.tsx provides html/body, Header, NextIntlClientProvider.
 */
export default async function PublicLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {children}
    </main>
  );
}
