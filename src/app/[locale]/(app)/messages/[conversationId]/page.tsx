import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getAuthSession } from "@/lib/auth-guard";
import ChatThread from "@/components/messages/ChatThread";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; conversationId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "messages" });
  return { title: t("chatTitle") };
}

export default async function ChatPage({ params }: Props) {
  const { locale, conversationId } = await params;
  setRequestLocale(locale);

  const session = await getAuthSession();
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }

  return <ChatThread conversationId={conversationId} />;
}
