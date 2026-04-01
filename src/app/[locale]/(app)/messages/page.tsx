import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getAuthSession } from "@/lib/auth-guard";
import ConversationList from "@/components/messages/ConversationList";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ with?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "messages" });
  return { title: t("title") };
}

export default async function MessagesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getAuthSession();
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }

  const { with: withUserId } = await searchParams;

  return <ConversationList withUserId={withUserId} />;
}
