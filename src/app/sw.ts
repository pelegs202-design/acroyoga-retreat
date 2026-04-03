import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const self: any & {
  __SW_MANIFEST: { url: string; revision: string | null }[];
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }: { request: Request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// MUST come BEFORE serwist.addEventListeners()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener("push", (event: any) => {
  if (!event.data) return;
  const data = event.data.json() as { title: string; body: string; url: string };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data: { url: data.url },
      dir: "auto", // browser auto-detects RTL for Hebrew
    }),
  );
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  const targetUrl = (event.notification.data?.url as string) ?? "/";
  event.waitUntil(
    self.clients
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .matchAll({ type: "window", includeUncontrolled: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((clients: any[]) => {
        const existing = clients.find((c) => c.url.includes(targetUrl));
        if (existing) return existing.focus();
        return self.clients.openWindow(targetUrl);
      }),
  );
});

serwist.addEventListeners();
