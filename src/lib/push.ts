import webpush from "web-push";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(
    "mailto:shai@acroretreat.co.il",
    VAPID_PUBLIC,
    VAPID_PRIVATE,
  );
}

export interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

export async function sendPushToUser(
  subscription: PushSubscription,
  payload: PushPayload,
): Promise<void> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload),
      {
        TTL: 86400, // 24 hours
        urgency: "normal",
      },
    );
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    if (error.statusCode === 410) {
      const expired = new Error("Push subscription expired or invalid");
      (expired as NodeJS.ErrnoException & { code: string }).code =
        "SUBSCRIPTION_EXPIRED";
      throw expired;
    }
    throw err;
  }
}
