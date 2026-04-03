import type { Thing, WithContext } from "schema-dts";

// Generic JSON-LD script injector — RSC (React Server Component).
// Source: nextjs.org/docs/app/guides/json-ld — this is the official Next.js pattern.
//
// SAFETY: The payload comes exclusively from server-side schema builders
// (buildOrganizationSchema, buildEventSchema, etc.) which produce typed,
// controlled JSON objects — never from user-supplied input.
// JSON.stringify + replacing '<' with '\u003c' is the standard defense
// against JSON injection in script tags; the script type is
// application/ld+json (parsed as JSON, not executed as JavaScript).
// Therefore dangerouslySetInnerHTML is safe here.
export function JsonLd<T extends Thing>({
  data,
}: {
  data: WithContext<T>;
}) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }} // SAFE: server-only typed JSON-LD, see comment above
    />
  );
}
