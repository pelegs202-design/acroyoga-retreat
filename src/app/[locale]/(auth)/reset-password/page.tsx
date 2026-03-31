import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ResetPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Wrap in Suspense because ResetPasswordForm uses useSearchParams
  return (
    <Suspense fallback={<div className="text-neutral-400">Loading...</div>}>
      <ResetPasswordForm locale={locale} />
    </Suspense>
  );
}
