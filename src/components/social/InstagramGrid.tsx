/**
 * InstagramGrid — Server Component
 * Fetches @acroshay's Instagram feed and renders a 3-column grid.
 * Renders nothing when the token is missing or the feed is empty.
 */

import { fetchInstagramFeed } from "@/lib/instagram";
import type { IgPost } from "@/lib/instagram";

const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/acroshay/";

function PostTile({ post }: { post: IgPost }) {
  const isVideo = post.media_type === "VIDEO";
  const imgSrc = isVideo ? (post.thumbnail_url ?? post.media_url) : post.media_url;

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-square overflow-hidden border-2 border-neutral-800 hover:border-brand transition-colors duration-200"
      aria-label={post.caption ? post.caption.slice(0, 80) : "Instagram post"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={post.caption ? post.caption.slice(0, 80) : "Instagram post"}
        loading="lazy"
        className="h-full w-full object-cover transition-[filter] duration-200 group-hover:brightness-90"
      />

      {/* Video play indicator */}
      {isVideo && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <svg
            viewBox="0 0 24 24"
            fill="white"
            className="h-10 w-10 drop-shadow"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      )}
    </a>
  );
}

export async function InstagramGrid() {
  const posts = await fetchInstagramFeed(9);

  // Graceful degradation — hide section when no posts available
  if (posts.length === 0) return null;

  return (
    <section className="w-full border-t-2 border-neutral-800 pt-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Section heading */}
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-bold uppercase tracking-widest text-neutral-100">
            Follow us on Instagram
          </h2>
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-brand hover:underline"
          >
            @acroshay
          </a>
        </div>

        {/* Grid: always 3 columns (3×3 desktop, 3×2 if fewer posts) */}
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post) => (
            <PostTile key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
