import MemberCard from "./MemberCard";

type Member = {
  id: string;
  name: string;
  image: string | null;
  city: string | null;
  role: string | null;
  level: string | null;
  skills: string[];
};

type Props = {
  members: Member[];
  /** Active filters — used to suggest which to remove on zero results */
  filters: {
    city?: string;
    role?: string;
    level?: string;
  };
  noResultsHint: string;
  noResultsLabel: string;
};

/**
 * Determine the most restrictive active filter to suggest removing.
 * Priority: level > role > city (level is most specific, city is least)
 */
function getMostRestrictiveFilter(filters: Props["filters"]): string | null {
  if (filters.level) return "level";
  if (filters.role) return "role";
  if (filters.city) return "city";
  return null;
}

export default function MembersGrid({
  members,
  filters,
  noResultsHint,
  noResultsLabel,
}: Props) {
  if (members.length === 0) {
    const activeFilter = getMostRestrictiveFilter(filters);
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium text-neutral-300">{noResultsLabel}</p>
        {activeFilter && (
          <p className="mt-2 text-sm text-neutral-500">
            {noResultsHint.replace("__filter__", activeFilter)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <MemberCard key={member.id} {...member} />
      ))}
    </div>
  );
}
