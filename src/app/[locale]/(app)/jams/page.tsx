import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getAuthSession } from "@/lib/auth-guard";
import type { Metadata } from "next";
import JamFeed from "@/components/jams/JamFeed";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "jams" });
  return { title: t("title") };
}

export default async function JamsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getAuthSession();
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }

  return (
    <div className="py-6">
      <JamFeed />
    </div>
  );
}
