import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getAuthSession } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { and, eq, ilike, isNotNull, ne } from "drizzle-orm";
import MemberFilters from "@/components/members/MemberFilters";
import MembersGrid from "@/components/members/MembersGrid";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ city?: string; role?: string; level?: string }>;
};

export default async function MembersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getAuthSession();
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }

  const { city, role, level } = await searchParams;

  const t = await getTranslations({ locale, namespace: "members" });

  const conditions = [
    isNotNull(user.tosAcceptedAt),
    ne(user.id, session!.user.id),
    eq(user.status, 'active'),
    city ? ilike(user.city, `%${city}%`) : undefined,
    role ? eq(user.role, role) : undefined,
    level ? eq(user.level, level) : undefined,
  ].filter(Boolean) as Parameters<typeof and>;

  const members = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      city: user.city,
      role: user.role,
      level: user.level,
      skills: user.skills,
    })
    .from(user)
    .where(and(...conditions))
    .limit(50);

  return (
    <>
      <MemberFilters city={city} role={role} level={level} />
      <div className="py-6">
        <h1 className="mb-6 text-2xl font-bold text-neutral-100">
          {t("title")}
        </h1>
        <MembersGrid
          members={members}
          filters={{ city, role, level }}
          noResultsLabel={t("noResults")}
          noResultsHint={t("noResultsHint")}
        />
      </div>
    </>
  );
}
