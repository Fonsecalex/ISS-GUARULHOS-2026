/**
 * scripts/pages/simulados.js — Cadastro de simulados e evolução de notas.
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;

  function render(container) {
    global.Router.setHeaderTitle('Simulados');
    const S = global.State;
    const simulados = [...S.raw().simulados].sort((a, b) => a.data.localeCompare(b.data));

    container.innerHTML = `
      <button class="btn btn--primary btn--block" id="btn-add-sim" style="margin-bottom:20px">${Icon('plus')} Cadastrar simulado</button>
      ${simulados.length ? `
      <div class="card chart-card" style="margin-bottom:24px">
        <div class="type-headline" style="margin-bottom:10px">Evolução da nota (%)</div>
        <canvas id="sim-chart"></canvas>
      </div>` : ''}
      <div class="section__head"><div class="type-title-2">Histórico</div></div>
      <div id="sim-list"></div>
    `;

    if (simulados.length) {
      requestAnimationFrame(() => {
        global.Charts.lineChart(
          document.getElementById('sim-chart'),
          simulados.map(s => U.fmtDateShort(s.data)),
          simulados.map(s => U.pct(s.acertos, s.totalQuestoes)),
          { height: 150 }
        );
      });
    }

    const list = document.getElementById('sim-list');
    if (!simulados.length) {
      list.innerHTML = `<div class="empty-state">${Icon('checklist')}<div class="type-body">Nenhum simulado registrado.</div></div>`;
    } else {
      [...simulados].reverse().forEach(s => {
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = `
          <div class="list-row__body">
            <div class="list-row__title">${U.escapeHtml(s.nome)}</div>
            <div class="list-row__meta">${U.fmtDateShort(s.data)} · ${s.acertos}/${s.totalQuestoes} · ${U.fmtDuration(s.tempoSeg)}</div>
          </div>
          <span class="chip ${U.pct(s.acertos, s.totalQuestoes) >= 70 ? 'chip--green' : 'chip--red'}">${U.pct(s.acertos, s.totalQuestoes)}%</span>
        `;
        list.appendChild(row);
      });
    }

    document.getElementById('btn-add-sim').onclick = openForm;
  }

  function openForm() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="sheet__title type-title-2">Cadastrar simulado</div>
      <div class="field"><label>Nome do simulado</label><input type="text" id="inp-nome" placeholder="Ex: Simulado IBAM #3"/></div>
      <div class="field"><label>Data</label><input type="date" id="inp-data" value="${U.todayISO()}"/></div>
      <div class="card-grid">
        <div class="field"><label>Total de questões</label><input type="number" id="inp-total" value="50" min="1"/></div>
        <div class="field"><label>Acertos</label><input type="number" id="inp-acertos" value="35" min="0"/></div>
      </div>
      <div class="field"><label>Tempo gasto (minutos)</label><input type="number" id="inp-tempo" value="180" min="0"/></div>
      <button class="btn btn--primary btn--block" id="btn-save-sim">Salvar simulado</button>
    `;
    global.UI.openSheet(wrap);

    wrap.querySelector('#btn-save-sim').onclick = () => {
      const nome = wrap.querySelector('#inp-nome').value.trim() || 'Simulado';
      const data = wrap.querySelector('#inp-data').value || U.todayISO();
      const total = parseInt(wrap.querySelector('#inp-total').value, 10) || 0;
      const acertos = U.clamp(parseInt(wrap.querySelector('#inp-acertos').value, 10) || 0, 0, total);
      const tempoMin = parseInt(wrap.querySelector('#inp-tempo').value, 10) || 0;
      global.State.addSimulado({
        id: U.uid('sim'), nome, data, totalQuestoes: total, acertos, erros: total - acertos, tempoSeg: tempoMin * 60
      });
      global.UI.closeSheet();
      global.UI.toast('Simulado registrado', 'success');
      global.Router.render();
    };
  }

  global.Pages = global.Pages || {};
  global.Pages.simulados = { render };
})(window);
