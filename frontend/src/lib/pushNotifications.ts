import {
  getPushConfig,
  registerPushSubscription,
  removePushSubscription
} from "@/lib/api";
import { getWebPushPublicKey } from "@/lib/env";

const SERVICE_WORKER_PATH = "/nilehive-push-sw.js";

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    typeof navigator.serviceWorker !== "undefined" &&
    typeof window.PushManager !== "undefined" &&
    typeof window.Notification !== "undefined"
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

async function getServiceWorkerRegistration() {
  const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
  await navigator.serviceWorker.ready;
  return registration;
}

export async function getCurrentPushSubscription() {
  if (!isPushSupported()) {
    return null;
  }

  const registration = await getServiceWorkerRegistration();
  return registration.pushManager.getSubscription();
}

export async function enablePushNotifications() {
  if (!isPushSupported()) {
    throw new Error("This browser does not support phone-style web notifications.");
  }

  const permission = await window.Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted for this device.");
  }

  const config = await getPushConfig();
  const publicKey = config.public_key || getWebPushPublicKey();

  if (!config.enabled || !publicKey) {
    throw new Error("Push notifications are not configured yet.");
  }

  const registration = await getServiceWorkerRegistration();
  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription = existingSubscription ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });

  await registerPushSubscription(subscription.toJSON());

  return subscription;
}

export async function disablePushNotifications() {
  if (!isPushSupported()) {
    return { removed: true };
  }

  const subscription = await getCurrentPushSubscription();

  if (!subscription) {
    return { removed: true };
  }

  await removePushSubscription(subscription.endpoint);
  await subscription.unsubscribe();

  return { removed: true };
}
