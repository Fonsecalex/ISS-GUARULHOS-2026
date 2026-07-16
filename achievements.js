/**
 * scripts/pages/questions.js — Registro de questões respondidas.
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;

  function render(container) {
    global.Router.setHeaderTitle('Questões');
    const S = global.State;
    const stats = S.allQuestionStats();
    const history = [...S.raw().questions].sort((a, b) => b.date.localeCompare(a.date));

    container.innerHTML = `
      <div class="metrics-grid" style="margin-bottom:20px">
        <div class="metric"><span class="metric__value">${stats.total}</span><span class="metric__label">Total respondidas</span></div>
        <div class="metric"><span class="metric__value">${stats.taxa}%</span><span class="metric__label">Taxa de acerto</span></div>
      </div>
      <button class="btn btn--primary btn--block" id="btn-add-question" style="margin-bottom:24px">${Icon('plus')} Registrar questões</button>
      <div class="section__head"><div class="type-title-2">Histórico</div></div>
      <div id="q-history"></div>
    `;

    const list = document.getElementById('q-history');
    if (!history.length) {
      list.innerHTML = `<div class="empty-state">${Icon('checklist')}<div class="type-body">Nenhum registro ainda.</div></div>`;
    } else {
      history.forEach(rec => {
        const found = S.findTemaGlobal(rec.temaId);
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = `
          <div class="list-row__body">
            <div class="list-row__title">${found ? U.escapeHtml(found.tema.nome) : 'Tema removido'}</div>
            <div class="list-row__meta">${found ? U.escapeHtml(found.disc.nome) : ''} · ${U.fmtDateShort(rec.date)} · ${rec.quantidade} questões</div>
          </div>
          <span class="chip ${U.pct(rec.acertos, rec.quantidade) >= 70 ? 'chip--green' : 'chip--red'}">${U.pct(rec.acertos, rec.quantidade)}%</span>
        `;
        list.appendChild(row);
      });
    }

    document.getElementById('btn-add-question').onclick = openForm;
  }

  function openForm() {
    const S = global.State;
    const disciplines = S.getDisciplines();
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="sheet__title type-title-2">Registrar questões</div>
      <div class="field">
        <label>Disciplina</label>
        <select id="sel-disc">${disciplines.map(d => `<option value="${d.id}">${U.escapeHtml(d.nome)}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label>Tema</label>
        <select id="sel-tema"></select>
      </div>
      <div class="card-grid">
        <div class="field"><label>Quantidade</label><input type="number" id="inp-qtd" value="10" min="1"/></div>
        <div class="field"><label>Acertos</label><input type="number" id="inp-acertos" value="7" min="0"/></div>
      </div>
      <div class="field"><label>Tempo gasto (minutos)</label><input type="number" id="inp-tempo" value="15" min="0"/></div>
      <button class="btn btn--primary btn--block" id="btn-save-q">Salvar registro</button>
    `;
    global.UI.openSheet(wrap);

    const selDisc = wrap.querySelector('#sel-disc');
    const selTema = wrap.querySelector('#sel-tema');
    function fillTemas() {
      const disc = S.getDiscipline(selDisc.value);
      selTema.innerHTML = disc.temas.map(t => `<option value="${t.id}">${U.escapeHtml(t.nome)}</option>`).join('');
    }
    fillTemas();
    selDisc.onchange = fillTemas;

    wrap.querySelector('#btn-save-q').onclick = () => {
      const qtd = parseInt(wrap.querySelector('#inp-qtd').value, 10) || 0;
      const acertos = U.clamp(parseInt(wrap.querySelector('#inp-acertos').value, 10) || 0, 0, qtd);
      const tempoMin = parseInt(wrap.querySelector('#inp-tempo').value, 10) || 0;
      S.addQuestionRecord({
        id: U.uid('q'), date: U.todayISO(),
        disciplineId: selDisc.value, temaId: selTema.value,
        quantidade: qtd, acertos, erros: qtd - acertos, tempoSeg: tempoMin * 60
      });
      global.UI.closeSheet();
      global.UI.toast('Registro salvo', 'success');
      global.Router.render();
    };
  }

  global.Pages = global.Pages || {};
  global.Pages.questions = { render };
})(window);
