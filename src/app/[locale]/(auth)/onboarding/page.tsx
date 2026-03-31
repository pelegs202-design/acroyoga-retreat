import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getAuthSession } from "@/lib/auth-guard";
import OnboardingWizard from "@/components/auth/OnboardingWizard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OnboardingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Must be authenticated with TOS accepted
  const session = await getAuthSession();
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }

  const user = session!.user as {
    tosAcceptedAt?: string | null;
    city?: string | null;
    role?: string | null;
    level?: string | null;
  };

  // Redirect to TOS if not yet accepted
  if (!user.tosAcceptedAt) {
    redirect({ href: "/tos", locale });
  }

  // If onboarding already complete, skip to dashboard
  if (user.city && user.role && user.level) {
    redirect({ href: "/dashboard", locale });
  }

  return <OnboardingWizard locale={locale} />;
}
