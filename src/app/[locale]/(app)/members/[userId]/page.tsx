import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { user, reviews } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileBio from "@/components/profile/ProfileBio";
import SkillsDisplay from "@/components/profile/SkillsDisplay";
import { ReviewForm } from "@/components/profile/ReviewForm";

type Props = {
  params: Promise<{ locale: string; userId: string }>;
};

export default async function MemberProfilePage({ params }: Props) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  const session = await getAuthSession();
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }

  const [member] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!member) {
    notFound();
  }

  const isOwnProfile = session!.user.id === userId;

  // Count reviews received (private — only shown to profile owner)
  const [reviewRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(eq(reviews.revieweeId, userId));

  const feedbackCount = reviewRow?.count ?? 0;

  const t = await getTranslations({ locale, namespace: "profile" });

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="space-y-8">
        {/* Hero: photo, name, city, role/level, edit button */}
        <ProfileHero
          name={member.name}
          image={member.image}
          city={member.city}
          role={member.role}
          level={member.level}
          isOwnProfile={isOwnProfile}
          locale={locale}
        />

        {/* Bio: text or nudge (own) or hidden (other, empty) */}
        <ProfileBio
          bio={member.bio}
          isOwnProfile={isOwnProfile}
          locale={locale}
        />

        {/* Skills: chips with expand, or nudge (own) or hidden (other, empty) */}
        <SkillsDisplay
          skills={member.skills}
          isOwnProfile={isOwnProfile}
        />

        {/* Feedback count — private, only visible to owner */}
        {isOwnProfile && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-neutral-100">
              {t("reviews")}
            </h2>
            <p className="text-neutral-300">
              {t("reviewCount", { count: feedbackCount })}
            </p>
          </section>
        )}

        {/* Review form — only visible when viewing someone else's profile */}
        {!isOwnProfile && (
          <ReviewForm revieweeId={userId} />
        )}
      </div>
    </div>
  );
}
