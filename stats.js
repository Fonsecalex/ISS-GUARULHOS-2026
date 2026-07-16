/**
 * scripts/pages/search.js — Busca global: temas, disciplinas, revisões e notas.
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;
  let overlay;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
      <div class="search-overlay__head">
        <button class="icon-btn" id="search-close">${Icon('chevron-left')}</button>
        <input type="text" class="search-overlay__input" id="search-input" placeholder="Pesquisar temas, disciplinas, notas..." />
      </div>
      <div class="search-overlay__results" id="search-results"></div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#search-close').onclick = close;
    const input = overlay.querySelector('#search-input');
    input.addEventListener('input', U.debounce(() => runSearch(input.value), 150));
    return overlay;
  }

  function open() {
    ensureOverlay();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => overlay.querySelector('#search-input').focus(), 300);
    runSearch('');
  }
  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function runSearch(qRaw) {
    const q = qRaw.trim().toLowerCase();
    const S = global.State;
    const results = document.getElementById('search-results');
    if (!q) { results.innerHTML = `<div class="empty-state">${Icon('search')}<div class="type-body">Digite para buscar em disciplinas, temas, revisões e notas.</div></div>`; return; }

    const items = [];
    S.getDisciplines().forEach(disc => {
      if (disc.nome.toLowerCase().includes(q)) items.push({ kind: 'Disciplina', title: disc.nome, sub: `${disc.temas.length} temas`, action: () => { close(); global.Router.navigate('discipline', [disc.id]); } });
      disc.temas.forEach(t => {
        if (t.nome.toLowerCase().includes(q)) items.push({ kind: 'Tema', title: t.nome, sub: disc.nome, action: () => { close(); global.Router.navigate('discipline', [disc.id]); } });
      });
    });
    S.raw().notes.forEach(n => {
      if (n.texto.toLowerCase().includes(q)) {
        const found = S.findTemaGlobal(n.temaId);
        items.push({ kind: 'Nota', title: n.texto, sub: found ? found.tema.nome : '', action: () => { close(); if (found) global.Router.navigate('discipline', [found.disc.id]); } });
      }
    });

    if (!items.length) { results.innerHTML = `<div class="empty-state">${Icon('search')}<div class="type-body">Nenhum resultado para "${U.escapeHtml(qRaw)}".</div></div>`; return; }

    results.innerHTML = '';
    items.slice(0, 40).forEach(it => {
      const row = document.createElement('div');
      row.className = 'list-row';
      row.innerHTML = `
        <div class="list-row__body">
          <div class="type-caption">${it.kind}</div>
          <div class="list-row__title">${U.escapeHtml(it.title)}</div>
          <div class="list-row__meta">${U.escapeHtml(it.sub)}</div>
        </div>
        <div class="list-row__chevron">${Icon('chevron-right')}</div>
      `;
      row.onclick = it.action;
      results.appendChild(row);
    });
  }

  global.Pages = global.Pages || {};
  global.Pages.search = { open, close };
})(window);
