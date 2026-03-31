import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getAuthSession } from "@/lib/auth-guard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Require authenticated session
  const session = await getAuthSession();
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }

  const user = session!.user as {
    name?: string | null;
    tosAcceptedAt?: string | null;
  };

  // Require TOS acceptance
  if (!user.tosAcceptedAt) {
    redirect({ href: "/tos", locale });
  }

  const t = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <div className="py-8">
      <h1 className="mb-2 text-3xl font-bold text-neutral-100">
        {t("welcome", { name: user.name ?? "Acrobat" })}
      </h1>
      <p className="mb-8 text-lg text-neutral-400">{t("subtitle")}</p>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <p className="text-neutral-300">{t("comingSoon")}</p>
      </div>
    </div>
  );
}
