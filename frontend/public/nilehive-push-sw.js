self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "NileHive notification",
      body: event.data ? event.data.text() : ""
    };
  }

  const title = payload.title || "NileHive notification";
  const options = {
    body: payload.body || "You have a new Club Services update.",
    data: {
      url: payload.url || "/notifications"
    },
    icon: "/nile-university-logo.png",
    badge: "/nile-university-favicon.png",
    tag: payload.notification_id || payload.type || "nilehive-notification"
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || "/notifications", self.location.origin).href;

  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    for (const client of windowClients) {
      if ("focus" in client) {
        await client.focus();
        if ("navigate" in client) {
          await client.navigate(targetUrl);
        }
        return;
      }
    }

    await self.clients.openWindow(targetUrl);
  })());
});
