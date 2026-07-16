/**
 * scripts/app.js — Bootstrap da aplicação.
 * Inicializa storage/estado, registra rotas e sobe o roteador.
 * Ponto de entrada único, carregado por último no index.html.
 */
(function (global) {
  'use strict';

  function registerRoutes() {
    const R = global.Router, P = global.Pages;
    R.registerRoute('dashboard', P.dashboard.render);
    R.registerRoute('schedule', P.schedule.render);
    R.registerRoute('disciplines', P.disciplines.render);
    R.registerRoute('discipline', P.discipline.render);
    R.registerRoute('stats', P.stats.render);
    R.registerRoute('more', P.more.render);
    R.registerRoute('questions', P.questions.render);
    R.registerRoute('simulados', P.simulados.render);
    R.registerRoute('checklist', P.checklist.render);
    R.registerRoute('achievements', P.achievements.render);
    R.registerRoute('settings', P.settings.render);
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    // Service workers exigem contexto seguro (https ou localhost).
    // Sob file:// o registro falha silenciosamente — o app continua
    // funcionando normalmente via localStorage, apenas sem cache offline nativo.
    if (location.protocol === 'file:') return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {
        console.warn('[App] Service worker não pôde ser registrado neste contexto.');
      });
    });
  }

  function hideSplash() {
    const splash = document.getElementById('splash');
    if (!splash) return;
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 400);
  }

  function boot() {
    global.Storage.ensureInitialized();
    global.State.loadAll();
    registerRoutes();
    global.Router.init();
    registerServiceWorker();
    hideSplash();
  }

  document.addEventListener('DOMContentLoaded', boot);
})(window);
