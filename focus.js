/**
 * scripts/pages/disciplines.js — Lista de disciplinas do edital.
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;

  function render(container) {
    global.Router.setHeaderTitle('Disciplinas');
    const S = global.State;
    const disciplines = [...S.getDisciplines()].sort((a, b) => b.peso - a.peso);

    container.innerHTML = `
      <div class="section">
        <div class="metrics-grid" style="margin-bottom:20px">
          <div class="metric"><span class="metric__value">${disciplines.length}</span><span class="metric__label">Disciplinas</span></div>
          <div class="metric"><span class="metric__value">${disciplines.reduce((s,d)=>s+d.temas.length,0)}</span><span class="metric__label">Temas no edital</span></div>
        </div>
        <div id="discipline-list"></div>
      </div>
    `;

    const list = document.getElementById('discipline-list');
    disciplines.forEach(disc => {
      const prog = S.disciplineProgress(disc);
      const row = document.createElement('div');
      row.className = 'discipline-tile';
      row.innerHTML = `
        <div class="discipline-tile__icon" style="background:${disc.cor}">${Icon(disc.icon)}</div>
        <div class="discipline-tile__body">
          <div class="flex items-center justify-between">
            <span class="type-headline">${U.escapeHtml(disc.nome)}</span>
            ${U.starRow(disc.peso)}
          </div>
          <div class="type-footnote">${prog.concluidos}/${prog.total} temas · ${U.fmtDuration(prog.tempo)}</div>
          <div class="discipline-tile__progress progress progress--thin">
            <div class="progress__fill" style="width:${prog.pct}%;background:${disc.cor}"></div>
          </div>
        </div>
        <div class="list-row__chevron">${Icon('chevron-right')}</div>
      `;
      row.onclick = () => global.Router.navigate('discipline', [disc.id]);
      list.appendChild(row);
    });
  }

  global.Pages = global.Pages || {};
  global.Pages.disciplines = { render };
})(window);
