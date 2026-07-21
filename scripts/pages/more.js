/**
 * scripts/pages/more.js — Hub com acesso a Questões, Simulados, Checklist,
 * Conquistas e Configurações (itens que não cabem na barra inferior).
 */
(function (global) {
  'use strict';
  const Icon = global.Icon;

  const ITEMS = [
    { route: 'notebook', label: 'Caderno', desc: 'Anotações e áudios em tempo real', icon: 'notebook', color: 'var(--teal)' },
    { route: 'history', label: 'Histórico de Estudos', desc: 'Veja e corrija sessões registradas', icon: 'clock', color: 'var(--ledger-blue)' },
    { route: 'questions', label: 'Questões', desc: 'Registrar e revisar seu desempenho', icon: 'target', color: 'var(--ledger-blue)' },
    { route: 'simulados', label: 'Simulados', desc: 'Cadastre notas e acompanhe a evolução', icon: 'checklist', color: 'var(--seal-green)' },
    { route: 'checklist', label: 'Checklist do Edital', desc: 'Todo o edital em formato de lista', icon: 'checklist', color: 'var(--gold)' },
    { route: 'achievements', label: 'Conquistas', desc: 'XP, nível, sequência e medalhas', icon: 'trophy', color: 'var(--violet)' },
    { route: 'settings', label: 'Configurações', desc: 'Metas, aparência e backup', icon: 'gear', color: 'var(--ink-1)' }
  ];

  function render(container) {
    global.Router.setHeaderTitle('Mais');
    container.innerHTML = `<div id="more-list"></div>`;
    const list = document.getElementById('more-list');
    ITEMS.forEach(item => {
      const row = document.createElement('div');
      row.className = 'list-row';
      row.innerHTML = `
        <div class="discipline-tile__icon" style="background:${item.color}">${Icon(item.icon)}</div>
        <div class="list-row__body">
          <div class="list-row__title">${item.label}</div>
          <div class="list-row__meta">${item.desc}</div>
        </div>
        <div class="list-row__chevron">${Icon('chevron-right')}</div>
      `;
      row.onclick = () => global.Router.navigate(item.route);
      list.appendChild(row);
    });
  }

  global.Pages = global.Pages || {};
  global.Pages.more = { render };
})(window);
