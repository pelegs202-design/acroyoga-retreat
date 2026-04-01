"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const INITIAL_DISPLAY = 8;

type Props = {
  skills: string[];
  isOwnProfile: boolean;
};

export default function SkillsDisplay({ skills, isOwnProfile }: Props) {
  const t = useTranslations("profile");
  const [expanded, setExpanded] = useState(false);

  const hasSkills = skills.length > 0;

  // Non-owner viewing empty skills — show nothing
  if (!hasSkills && !isOwnProfile) {
    return null;
  }

  if (!hasSkills) {
    // Own profile, empty skills — show nudge
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-100">
          {t("skills")}
        </h2>
        <p className="text-sm italic text-neutral-500">
          {t("skillsEmpty")}{" "}
          <Link
            href="/profile/edit"
            className="text-brand underline underline-offset-2 hover:no-underline"
          >
            {t("editButton")}
          </Link>
        </p>
      </section>
    );
  }

  const visible = expanded ? skills : skills.slice(0, INITIAL_DISPLAY);
  const remaining = skills.length - INITIAL_DISPLAY;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-neutral-100">
        {t("skills")}
      </h2>
      <div className="flex flex-wrap gap-2">
        {visible.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-sm text-brand"
          >
            {skill}
          </span>
        ))}
        {!expanded && remaining > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-sm text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-200"
          >
            {t("andMore", { count: remaining })}
          </button>
        )}
      </div>
    </section>
  );
}
