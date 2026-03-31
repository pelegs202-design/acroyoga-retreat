import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Server-side session validation helper for protected pages.
 *
 * CRITICAL: This is the ONLY safe way to check auth in Next.js.
 * Do NOT rely on middleware for security (CVE-2025-29927).
 * Every protected Server Component must call this function.
 *
 * Returns the full session object (including user) or null if not authenticated.
 */
export async function getAuthSession() {
  return auth.api.getSession({ headers: await headers() });
}
