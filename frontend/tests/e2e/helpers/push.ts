import type { Page } from "@playwright/test";

const DEFAULT_ENDPOINT = "https://push.example.test/e2e-subscription";

export async function mockBrowserPushSupport(
  page: Page,
  options: {
    permission?: NotificationPermission;
    initiallySubscribed?: boolean;
    endpoint?: string;
  } = {}
) {
  await page.addInitScript(
    ({ permission, initiallySubscribed, endpoint }) => {
      const subscriptionJson = {
        endpoint,
        expirationTime: null,
        keys: {
          p256dh: "e2e-p256dh-key",
          auth: "e2e-auth-key"
        }
      };
      let currentSubscription = initiallySubscribed
        ? {
            endpoint,
            toJSON: () => subscriptionJson,
            unsubscribe: async () => {
              currentSubscription = null;
              return true;
            }
          }
        : null;

      const createSubscription = () => ({
        endpoint,
        toJSON: () => subscriptionJson,
        unsubscribe: async () => {
          currentSubscription = null;
          return true;
        }
      });

      const registration = {
        pushManager: {
          getSubscription: async () => currentSubscription,
          subscribe: async () => {
            currentSubscription = createSubscription();
            return currentSubscription;
          }
        }
      };

      Object.defineProperty(window, "Notification", {
        configurable: true,
        value: {
          permission,
          requestPermission: async () => permission
        }
      });
      Object.defineProperty(window, "PushManager", {
        configurable: true,
        value: function PushManager() {}
      });
      Object.defineProperty(navigator, "serviceWorker", {
        configurable: true,
        value: {
          register: async () => registration,
          ready: Promise.resolve(registration)
        }
      });
    },
    {
      permission: options.permission ?? "granted",
      initiallySubscribed: options.initiallySubscribed ?? false,
      endpoint: options.endpoint ?? DEFAULT_ENDPOINT
    }
  );
}

export async function mockBrowserPushUnsupported(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: undefined
    });
    Object.defineProperty(window, "PushManager", {
      configurable: true,
      value: undefined
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: undefined
    });
  });
}
