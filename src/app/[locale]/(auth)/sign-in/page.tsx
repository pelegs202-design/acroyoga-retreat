import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getAuthSession } from "@/lib/auth-guard";
import SignInForm from "@/components/auth/SignInForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SignInPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // If already authenticated with TOS accepted, redirect to dashboard
  const session = await getAuthSession();
  if (session) {
    const user = session.user as {
      tosAcceptedAt?: string | null;
    };
    if (user.tosAcceptedAt) {
      redirect({ href: "/dashboard", locale });
    }
  }

  return <SignInForm locale={locale} />;
}
