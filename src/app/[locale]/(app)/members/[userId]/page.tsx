import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
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
  const tMessages = await getTranslations({ locale, namespace: "messages" });

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

        {/* Message + Review — only visible when viewing someone else's profile */}
        {!isOwnProfile && (
          <div className="space-y-4">
            {/* Message button — navigates to /messages?with=userId */}
            <div>
              <Link
                href={`/messages?with=${userId}`}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-400 hover:text-neutral-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z"
                    clipRule="evenodd"
                  />
                </svg>
                {tMessages("messageButton")}
              </Link>
            </div>

            <ReviewForm revieweeId={userId} />
          </div>
        )}
      </div>
    </div>
  );
}
