import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getAuthSession } from "@/lib/auth-guard";
import SignUpForm from "@/components/auth/SignUpForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SignUpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // If already authenticated, redirect appropriately
  const session = await getAuthSession();
  if (session) {
    const user = session.user as {
      tosAcceptedAt?: string | null;
    };
    if (!user.tosAcceptedAt) {
      redirect({ href: "/tos", locale });
    } else {
      redirect({ href: "/dashboard", locale });
    }
  }

  return <SignUpForm locale={locale} />;
}
