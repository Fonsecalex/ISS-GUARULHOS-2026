/**
 * scripts/pages/stats.js — Painel de estatísticas com gráficos em canvas puro.
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;

  function lastNMonthsLabels(n) {
    const out = [];
    const d = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      out.push({ label: m.toLocaleDateString('pt-BR', { month: 'short' }), start: m, end: new Date(m.getFullYear(), m.getMonth() + 1, 0) });
    }
    return out;
  }

  function render(container) {
    global.Router.setHeaderTitle('Estatísticas');
    const S = global.State;
    const disciplines = S.getDisciplines();
    const qStats = S.allQuestionStats();
    const edital = S.editalProgress();

    // horas por disciplina (top 6)
    const hoursByDisc = disciplines.map(d => ({ nome: d.nome, cor: d.cor, seg: S.disciplineProgress(d).tempo }))
      .sort((a, b) => b.seg - a.seg);

    // horas por mês (últimos 6 meses)
    const months = lastNMonthsLabels(6);
    const hoursByMonth = months.map(m => S.totalSecondsInRange(m.start.toISOString().slice(0,10), m.end.toISOString().slice(0,10)) / 3600);

    // velocidade média (questões/hora) e estimativa de conclusão
    const totalHoras = S.totalSecondsAll() / 3600;
    const velocidade = totalHoras > 0 ? Math.round(qStats.total / totalHoras) : 0;
    const temasRestantes = edital.totalTemas - edital.concluidos;
    const settings = S.getSettings();
    const horasPorTemaMedia = edital.concluidos > 0 ? totalHoras / Math.max(1, edital.concluidos) : 3;
    const horasRestantesEstimadas = Math.round(temasRestantes * horasPorTemaMedia);
    const diasEstimados = settings.dailyGoalMinutes > 0 ? Math.ceil((horasRestantesEstimadas * 60) / settings.dailyGoalMinutes) : null;

    container.innerHTML = `
      <div class="section">
        <div class="card" style="text-align:center">
          <canvas id="donut-edital" style="margin:0 auto 12px"></canvas>
          <div class="type-headline">Progresso ponderado do edital</div>
          <div class="flex justify-between" style="margin-top:14px">
            <div class="legend-row"><span class="legend-dot" style="background:var(--gold)"></span>Concluído</div>
            <div class="legend-row"><span class="legend-dot" style="background:var(--paper-2)"></span>Pendente</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="metrics-grid metrics-grid--3">
          <div class="metric"><span class="metric__value">${velocidade}</span><span class="metric__label">Questões / hora</span></div>
          <div class="metric"><span class="metric__value">${horasRestantesEstimadas}h</span><span class="metric__label">Estimativa restante</span></div>
          <div class="metric"><span class="metric__value">${diasEstimados !== null ? diasEstimados + 'd' : '—'}</span><span class="metric__label">P/ concluir no ritmo atual</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section__head"><div class="type-title-2">Horas por mês</div></div>
        <div class="card chart-card"><canvas id="chart-months"></canvas></div>
      </div>

      <div class="section">
        <div class="section__head"><div class="type-title-2">Questões: acertos x erros</div></div>
        <div class="card" style="text-align:center">
          <canvas id="donut-questoes" style="margin:0 auto 12px"></canvas>
          <div class="flex justify-between">
            <div class="legend-row"><span class="legend-dot" style="background:var(--seal-green)"></span>Acertos (${qStats.acertos})</div>
            <div class="legend-row"><span class="legend-dot" style="background:var(--stamp-red)"></span>Erros (${qStats.erros})</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section__head"><div class="type-title-2">Ranking de disciplinas por tempo</div></div>
        <div class="card card--flat" id="rank-list"></div>
      </div>
    `;

    requestAnimationFrame(() => {
      global.Charts.donutChart(document.getElementById('donut-edital'), [edital.pctPonderado, 100 - edital.pctPonderado], [getVar('--gold'), getVar('--paper-2')], { size: 140, centerText: edital.pctPonderado + '%', centerSub: 'concluído' });
      global.Charts.donutChart(document.getElementById('donut-questoes'), [qStats.acertos || 0, qStats.erros || 0.0001], [getVar('--seal-green'), getVar('--stamp-red')], { size: 140, centerText: qStats.taxa + '%', centerSub: 'acerto' });
      global.Charts.barChart(document.getElementById('chart-months'), months.map(m => m.label), hoursByMonth, { height: 150 });
    });

    const rankList = document.getElementById('rank-list');
    hoursByDisc.slice(0, 10).forEach((d, i) => {
      const row = document.createElement('div');
      row.className = 'rank-row';
      row.innerHTML = `
        <div class="rank-row__num">${i + 1}</div>
        <div class="grow">
          <div class="type-callout">${U.escapeHtml(d.nome)}</div>
          <div class="progress progress--thin" style="margin-top:4px"><div class="progress__fill" style="width:${U.pct(d.seg, hoursByDisc[0].seg || 1)}%;background:${d.cor}"></div></div>
        </div>
        <div class="type-ledger type-footnote">${U.fmtDuration(d.seg)}</div>
      `;
      rankList.appendChild(row);
    });
  }

  function getVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  global.Pages = global.Pages || {};
  global.Pages.stats = { render };
})(window);
