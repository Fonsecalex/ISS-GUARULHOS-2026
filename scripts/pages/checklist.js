/**
 * scripts/pages/checklist.js — Edital transformado em checklist navegável.
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;

  function render(container) {
    global.Router.setHeaderTitle('Checklist do Edital');
    const S = global.State;
    const disciplines = S.getDisciplines();
    const overall = S.checklistProgress();
    const checklist = S.raw().checklist;

    container.innerHTML = `
      <div class="card" style="margin-bottom:20px">
        <div class="flex justify-between" style="margin-bottom:8px">
          <span class="type-headline">Progresso geral</span>
          <span class="type-ledger type-headline">${overall.done}/${overall.total}</span>
        </div>
        <div class="progress"><div class="progress__fill" style="width:${overall.pct}%"></div></div>
      </div>
      <div id="checklist-groups"></div>
    `;

    const groupsWrap = document.getElementById('checklist-groups');
    disciplines.forEach(disc => {
      const items = checklist.filter(c => c.disciplineId === disc.id);
      const done = items.filter(c => c.done).length;
      const group = document.createElement('div');
      group.className = 'section';
      group.innerHTML = `
        <div class="checklist-group__title">
          <span class="type-headline">${U.escapeHtml(disc.nome)}</span>
          <span class="type-footnote">${done}/${items.length}</span>
        </div>
        <div class="card card--flat" id="grp-${disc.id}"></div>
      `;
      groupsWrap.appendChild(group);
      const body = group.querySelector(`#grp-${disc.id}`);
      items.forEach(item => {
        const tema = disc.temas.find(t => t.id === item.temaId);
        const row = document.createElement('div');
        row.className = 'checkbox-row';
        row.innerHTML = `
          <button class="checkbox ${item.done ? 'is-checked' : ''}" data-id="${item.id}">${Icon('check')}</button>
          <span class="type-callout grow" style="${item.done ? 'text-decoration:line-through;opacity:.5' : ''}">${tema ? U.escapeHtml(tema.nome) : ''}</span>
        `;
        row.querySelector('.checkbox').onclick = () => {
          S.toggleChecklistItem(item.id);
          global.Router.render();
        };
        body.appendChild(row);
      });
    });
  }

  global.Pages = global.Pages || {};
  global.Pages.checklist = { render };
})(window);
