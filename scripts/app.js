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
    R.registerRoute('history', P.history.render);
    R.registerRoute('notebook', P.notebook.render);
  }

  function restoreTimerIfNeeded() {
    if (!global.Timer || !global.Timer.restore) return;
    const restored = global.Timer.restore();
    if (!restored) return;
    const st = global.Timer.getState();
    if (st.studySecondsAccumulated >= 5) {
      global.UI.toast(`Cronômetro retomado: ${global.Utils.fmtClock(st.studySecondsAccumulated)} já estudados`, 'success');
    }
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
    restoreTimerIfNeeded();
    registerServiceWorker();
    hideSplash();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.AccessGate) global.AccessGate.init(boot);
    else boot(); // fallback caso o portão de acesso não esteja presente
  });
})(window);
