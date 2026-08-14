(() => {
  'use strict';
  if (document.getElementById('fixaHomeGoalsStreakProtectionV1Loader')) return;
  const script = document.createElement('script');
  script.id = 'fixaHomeGoalsStreakProtectionV1Loader';
  script.src = 'src/fixes/home-goals-streak-protection-v1.js?v=20260814-streak-goals-v1';
  script.defer = true;
  document.head.appendChild(script);
})();
