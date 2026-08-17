self.addEventListener('push', event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = { body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Fixa';
  const options = {
    body: payload.body || 'Você tem uma nova notificação.',
    icon: './favicon.svg',
    badge: './favicon.svg',
    tag: payload.tag || 'fixa-notification',
    renotify: false,
    data: { url: payload.url || './' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || './', self.registration.scope).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      const existing = windowClients.find(client => client.url.startsWith(self.registration.scope));
      if (existing) return existing.focus();
      return clients.openWindow(targetUrl);
    })
  );
});
