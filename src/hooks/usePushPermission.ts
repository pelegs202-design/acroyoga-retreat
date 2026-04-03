"use client";

import { useState, useEffect } from "react";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export function usePushPermission() {
  const [permissionState, setPermissionState] = useState<PermissionState>("unsupported");

  useEffect(() => {
    // Detect browser push support on mount
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setPermissionState("unsupported");
      return;
    }

    setPermissionState(Notification.permission as PermissionState);
  }, []);

  async function promptForPush(): Promise<void> {
    if (typeof window === "undefined") return;

    // Check push API support
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }

    // Already denied — cannot prompt again
    if (Notification.permission === "denied") {
      setPermissionState("denied");
      return;
    }

    // Already granted — re-subscribe in case subscription was lost
    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    setPermissionState(permission as PermissionState);

    if (permission !== "granted") return;

    try {
      const reg = await navigator.serviceWorker.ready;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn("[usePushPermission] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set");
        return;
      }

      // Convert VAPID public key from base64 to Uint8Array (applicationServerKey format)
      const keyData = atob(vapidPublicKey.replace(/-/g, "+").replace(/_/g, "/"));
      const keyArray = new Uint8Array(keyData.length);
      for (let i = 0; i < keyData.length; i++) {
        keyArray[i] = keyData.charCodeAt(i);
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyArray,
      });

      // Extract p256dh and auth keys as base64 strings
      const p256dhBuffer = subscription.getKey("p256dh");
      const authBuffer = subscription.getKey("auth");

      if (!p256dhBuffer || !authBuffer) {
        console.warn("[usePushPermission] Missing push subscription keys");
        return;
      }

      const p256dh = btoa(
        String.fromCharCode(...new Uint8Array(p256dhBuffer))
      );
      const auth = btoa(
        String.fromCharCode(...new Uint8Array(authBuffer))
      );

      // POST subscription to server
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh,
          auth,
        }),
      });
    } catch (err) {
      console.error("[usePushPermission] Failed to subscribe:", err);
    }
  }

  return { promptForPush, permissionState };
}
