/**
 * Offline fallback page — served by Serwist when the user navigates to
 * a document URL while offline and the URL is not cached.
 *
 * This page is locale-agnostic — it lives outside [locale] so it can be
 * pre-cached and served without locale detection overhead.
 * It uses English only as a reliable fallback regardless of locale.
 *
 * No JavaScript required — pure HTML/CSS, static, always loadable from cache.
 */

export default function OfflinePage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AcroHavura — Offline</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#0a0a0a",
          color: "#f5f5f5",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "2rem",
            maxWidth: "480px",
            width: "100%",
          }}
        >
          <div
            style={{
              border: "2px solid #f5f5f5",
              padding: "3rem 2.5rem",
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "2rem",
                opacity: 0.45,
              }}
            >
              AcroHavura
            </div>

            <div
              role="img"
              aria-label="No connection"
              style={{
                fontSize: "2.5rem",
                marginBottom: "1.5rem",
                opacity: 0.6,
              }}
            >
              ✕
            </div>

            <h1
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                margin: "0 0 1.25rem",
              }}
            >
              You&apos;re Offline
            </h1>

            <div
              style={{
                width: "2rem",
                height: "2px",
                backgroundColor: "#f5f5f5",
                margin: "0 auto 1.25rem",
                opacity: 0.5,
              }}
            />

            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.6,
                opacity: 0.7,
                margin: "0 0 1.5rem",
              }}
            >
              Connect to the internet to continue
            </p>

            <p
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.35,
                margin: 0,
              }}
            >
              Try again when connected
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
