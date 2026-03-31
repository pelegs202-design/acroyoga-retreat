import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getAuthSession } from "@/lib/auth-guard";
import TosAcceptance from "@/components/auth/TosAcceptance";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Must be authenticated to view TOS
  const session = await getAuthSession();
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }

  // Already accepted TOS — send to dashboard
  const user = session!.user as { tosAcceptedAt?: string | null };
  if (user.tosAcceptedAt) {
    redirect({ href: "/dashboard", locale });
  }

  return <TosAcceptance locale={locale} />;
}
