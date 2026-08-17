(() => {
  'use strict';
  if (window.FixaWebPushV1Loader) return;
  window.FixaWebPushV1Loader = true;
  const script = document.createElement('script');
  script.src = 'src/notifications/web-push-v1.js?v=20260817-push-stage5-v1';
  script.async = false;
  document.head.appendChild(script);
})();
