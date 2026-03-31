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

serwist.addEventListeners();
