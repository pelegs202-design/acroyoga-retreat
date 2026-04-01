import Image from "next/image";
import { Link } from "@/i18n/navigation";

type MemberCardProps = {
  id: string;
  name: string;
  image: string | null;
  city: string | null;
  role: string | null;
  level: string | null;
  skills: string[];
};

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/20 text-lg font-bold text-brand">
      {initials}
    </div>
  );
}

export default function MemberCard({
  id,
  name,
  image,
  city,
  role,
  level,
  skills,
}: MemberCardProps) {
  const topSkills = skills.slice(0, 3);

  return (
    <Link
      href={`/members/${id}` as Parameters<typeof Link>[0]["href"]}
      className="group flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-700"
    >
      {/* Avatar + name row */}
      <div className="flex items-center gap-3">
        {image ? (
          <Image
            src={image}
            alt={name}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <InitialsAvatar name={name} />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-neutral-100">{name}</p>
          {city && (
            <p className="truncate text-sm text-neutral-400">{city}</p>
          )}
        </div>
      </div>

      {/* Badges */}
      {(role || level) && (
        <div className="flex flex-wrap gap-1.5">
          {role && (
            <span className="rounded-full bg-brand/20 px-2.5 py-0.5 text-xs font-medium capitalize text-brand">
              {role}
            </span>
          )}
          {level && (
            <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-300">
              {level}
            </span>
          )}
        </div>
      )}

      {/* Top 3 skills */}
      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {topSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-xs text-brand"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
