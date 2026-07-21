/**
 * service-worker.js — Cache offline-first para o Auditor Pro IBAM.
 * Estratégia: "cache first, network fallback" para o app shell,
 * garantindo funcionamento 100% offline após o primeiro carregamento.
 * Nenhuma chamada de rede é feita a servidores próprios — tudo estático.
 */
const CACHE_NAME = 'auditor-pro-ibam-v3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './styles/tokens.css',
  './styles/base.css',
  './styles/components.css',
  './styles/pages.css',
  './assets/icons.js',
  './data/disciplines.js',
  './data/access-codes.js',
  './scripts/access-gate.js',
  './scripts/storage.js',
  './scripts/utils.js',
  './scripts/state.js',
  './scripts/scheduler.js',
  './scripts/timer.js',
  './scripts/gamification.js',
  './scripts/charts.js',
  './scripts/notebook-db.js',
  './scripts/ui.js',
  './scripts/router.js',
  './scripts/app.js',
  './scripts/pages/dashboard.js',
  './scripts/pages/schedule.js',
  './scripts/pages/disciplines.js',
  './scripts/pages/discipline-detail.js',
  './scripts/pages/focus.js',
  './scripts/pages/questions.js',
  './scripts/pages/simulados.js',
  './scripts/pages/stats.js',
  './scripts/pages/checklist.js',
  './scripts/pages/search.js',
  './scripts/pages/settings.js',
  './scripts/pages/achievements.js',
  './scripts/pages/more.js',
  './scripts/pages/history.js',
  './scripts/pages/notebook.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached);
    })
  );
});
