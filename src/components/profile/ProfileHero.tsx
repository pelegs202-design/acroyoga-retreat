import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

type Props = {
  name: string;
  image: string | null;
  city: string | null;
  role: string | null;
  level: string | null;
  isOwnProfile: boolean;
  locale: string;
};

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-brand/20 text-4xl font-bold text-brand">
      {initials}
    </div>
  );
}

export default async function ProfileHero({
  name,
  image,
  city,
  role,
  level,
  isOwnProfile,
  locale,
}: Props) {
  const t = await getTranslations({ locale, namespace: "profile" });

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {/* Avatar */}
      {image ? (
        <Image
          src={image}
          alt={name}
          width={160}
          height={160}
          className="h-40 w-40 rounded-full object-cover ring-2 ring-brand/30"
        />
      ) : (
        <InitialsAvatar name={name} />
      )}

      {/* Name */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">{name}</h1>
        {city && (
          <p className="mt-1 text-neutral-400">{city}</p>
        )}
      </div>

      {/* Badges */}
      {(role || level) && (
        <div className="flex flex-wrap justify-center gap-2">
          {role && (
            <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold capitalize text-brand-foreground">
              {role}
            </span>
          )}
          {level && (
            <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold capitalize text-neutral-300">
              {level}
            </span>
          )}
        </div>
      )}

      {/* Edit button (own profile only) */}
      {isOwnProfile && (
        <Link
          href="/profile/edit"
          className="mt-1 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-700"
        >
          {t("editButton")}
        </Link>
      )}
    </div>
  );
}
