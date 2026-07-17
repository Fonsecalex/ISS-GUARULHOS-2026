/**
 * scripts/router.js — roteador hash-based leve + shell da aplicação
 * (header, bottom navigation, outlet de páginas, busca, modo foco).
 */
(function (global) {
  'use strict';
  const Icon = global.Icon;

  const NAV_ITEMS = [
    { route: 'dashboard', label: 'Início', icon: 'home' },
    { route: 'schedule', label: 'Plano', icon: 'calendar' },
    { route: 'disciplines', label: 'Matérias', icon: 'book' },
    { route: 'stats', label: 'Painel', icon: 'chart' },
    { route: 'more', label: 'Mais', icon: 'dots' }
  ];

  const routes = {}; // routeName -> render(container, params)
  function registerRoute(name, renderFn) { routes[name] = renderFn; }

  function parseHash() {
    const raw = (location.hash || '#/dashboard').replace(/^#\//, '');
    const [route, ...rest] = raw.split('/');
    return { route: route || 'dashboard', params: rest };
  }

  function currentRouteName() { return parseHash().route; }

  function navigate(route, params) {
    const suffix = params && params.length ? '/' + params.join('/') : '';
    location.hash = `#/${route}${suffix}`;
  }

  function renderShell() {
    document.getElementById('app-shell').innerHTML = `
      <header class="app-header">
        <div class="app-header__row">
          <div>
            <div class="type-caption" id="header-eyebrow">AUDITOR PRO IBAM</div>
            <div class="type-title-2" id="header-title">Início</div>
          </div>
          <div class="app-header__actions">
            <button class="icon-btn" id="btn-search" aria-label="Buscar">${Icon('search')}</button>
            <button class="icon-btn" id="btn-theme" aria-label="Alternar tema">${Icon('sun')}</button>
          </div>
        </div>
      </header>
      <main id="page-outlet"></main>
      <div class="ptr-indicator" id="ptr-indicator">${Icon('refresh')}</div>
      <nav class="bottom-nav">
        <div class="bottom-nav__inner" id="bottom-nav-inner"></div>
      </nav>
      <div class="focus-screen" id="focus-screen"></div>
    `;
    renderBottomNav();
    document.getElementById('btn-search').onclick = () => global.Pages.search.open();
    document.getElementById('btn-theme').onclick = toggleTheme;
    applyThemeIcon();
  }

  function renderBottomNav() {
    const wrap = document.getElementById('bottom-nav-inner');
    wrap.innerHTML = NAV_ITEMS.map(item => `
      <button class="nav-item" data-route="${item.route}">
        ${Icon(item.icon)}
        <span>${item.label}</span>
      </button>
    `).join('');
    wrap.querySelectorAll('.nav-item').forEach(btn => {
      btn.onclick = () => navigate(btn.dataset.route);
    });
  }

  function updateActiveNav(route) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.route === route);
    });
  }

  function setHeaderTitle(title, eyebrow) {
    const t = document.getElementById('header-title');
    const e = document.getElementById('header-eyebrow');
    if (t) t.textContent = title;
    if (e) e.textContent = eyebrow || 'AUDITOR PRO IBAM';
  }

  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'auto';
    const next = current === 'dark' ? 'light' : current === 'light' ? 'auto' : 'dark';
    if (next === 'auto') html.removeAttribute('data-theme'); else html.setAttribute('data-theme', next);
    global.State.updateSettings({ theme: next });
    applyThemeIcon();
  }

  function applyThemeIcon() {
    const btn = document.getElementById('btn-theme');
    if (!btn) return;
    const current = document.documentElement.getAttribute('data-theme') || 'auto';
    btn.innerHTML = current === 'dark' ? Icon('moon') : current === 'light' ? Icon('sun') : Icon('gear');
  }

  function render() {
    const { route, params } = parseHash();
    const outlet = document.getElementById('page-outlet');
    const fn = routes[route] || routes['dashboard'];
    outlet.classList.remove('page-enter');
    outlet.innerHTML = '';
    fn(outlet, params);
    void outlet.offsetWidth; // reflow para reiniciar animação
    outlet.classList.add('page-enter');
    updateActiveNav(route);
    outlet.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function init() {
    // aplica tema salvo
    const settings = global.State.getSettings();
    if (settings.theme && settings.theme !== 'auto') document.documentElement.setAttribute('data-theme', settings.theme);
    renderShell();
    window.addEventListener('hashchange', render);
    render();

    // pull to refresh (recalcula cronograma / atualiza dashboard)
    const outlet = document.getElementById('page-outlet');
    global.UI.enablePullToRefresh(outlet, document.getElementById('ptr-indicator'), () => {
      global.UI.toast('Atualizado', 'success');
      render();
    });
  }

  global.Router = { registerRoute, navigate, currentRouteName, setHeaderTitle, init, render };
})(window);
