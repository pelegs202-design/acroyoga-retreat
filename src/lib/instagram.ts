/**
 * Instagram Graph API client
 * Server-only — reads INSTAGRAM_ACCESS_TOKEN from process.env (no NEXT_PUBLIC_ prefix)
 * Feed is cached with 6-hour ISR revalidation.
 */

export type IgPost = {
  id: string;
  caption?: string;
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
};

type IgApiResponse = {
  data: IgPost[];
  paging?: {
    cursors?: { before: string; after: string };
    next?: string;
  };
};

/**
 * Fetch the latest posts from @acroshay's Instagram feed.
 * Returns an empty array when the token is missing or the request fails
 * (graceful degradation — never crashes the homepage render).
 */
export async function fetchInstagramFeed(limit = 9): Promise<IgPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    // Graceful degradation: token not configured yet — hide section silently
    return [];
  }

  try {
    const url =
      `https://graph.instagram.com/me/media` +
      `?fields=id,caption,media_url,permalink,thumbnail_url,timestamp,media_type` +
      `&limit=${limit}` +
      `&access_token=${token}`;

    const res = await fetch(url, {
      next: { revalidate: 21600 }, // 6-hour ISR cache
    });

    if (!res.ok) {
      console.error(`[Instagram] Feed fetch failed: ${res.status}`);
      return [];
    }

    const data = (await res.json()) as IgApiResponse;
    return data.data ?? [];
  } catch (err) {
    console.error("[Instagram] Feed fetch error:", err);
    return [];
  }
}

/**
 * Refresh a long-lived Instagram access token before it expires (60-day rolling window).
 * Call this from an admin route or cron job — not in the render path.
 * Returns the new access_token string, or null on failure.
 */
export async function refreshInstagramToken(): Promise<string | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;

  try {
    const url =
      `https://graph.instagram.com/refresh_access_token` +
      `?grant_type=ig_refresh_token` +
      `&access_token=${token}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[Instagram] Token refresh failed: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch (err) {
    console.error("[Instagram] Token refresh error:", err);
    return null;
  }
}
