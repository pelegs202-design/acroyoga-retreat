import { getTranslations } from "next-intl/server";

type Props = {
  bio: string | null;
  isOwnProfile: boolean;
  locale: string;
};

export default async function ProfileBio({ bio, isOwnProfile, locale }: Props) {
  const t = await getTranslations({ locale, namespace: "profile" });

  const hasBio = bio && bio.trim().length > 0;

  // Non-owner viewing empty profile — show nothing
  if (!hasBio && !isOwnProfile) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-neutral-100">{t("bio")}</h2>
      {hasBio ? (
        <p className="text-neutral-300 leading-relaxed">{bio}</p>
      ) : (
        // Own profile, empty bio — show nudge
        <p className="text-sm italic text-neutral-500">{t("bioEmpty")}</p>
      )}
    </section>
  );
}
