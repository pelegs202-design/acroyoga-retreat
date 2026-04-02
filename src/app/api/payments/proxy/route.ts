import { NextResponse } from "next/server";

const MORNING_PAYMENT_URL =
  process.env.NEXT_PUBLIC_MORNING_PAYMENT_URL || "https://mrng.to/c1Syv3Bh2l";

// Proxy the Morning payment page through our domain
// This makes it same-origin so the parent page can detect success text
export async function GET() {
  try {
    const res = await fetch(MORNING_PAYMENT_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    const html = await res.text();

    // Inject a script that monitors the page for success text
    // and sends a message to the parent window when found
    const successDetector = `
    <script>
      (function() {
        var observer = new MutationObserver(function() {
          if (document.body && document.body.innerText.includes('התשלום בוצע בהצלחה')) {
            window.parent.postMessage({ type: 'PAYMENT_SUCCESS' }, '*');
            observer.disconnect();
          }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
        // Also check immediately and periodically
        setInterval(function() {
          if (document.body && document.body.innerText.includes('התשלום בוצע בהצלחה')) {
            window.parent.postMessage({ type: 'PAYMENT_SUCCESS' }, '*');
          }
        }, 1000);
      })();
    </script>
    `;

    // Inject our script before </head>
    const modifiedHtml = html.replace("</head>", successDetector + "</head>");

    return new NextResponse(modifiedHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("[payments/proxy] Error:", err);
    return NextResponse.json({ error: "Failed to load payment form" }, { status: 500 });
  }
}
