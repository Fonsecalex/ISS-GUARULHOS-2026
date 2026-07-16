/**
 * scripts/pages/schedule.js — Cronograma Inteligente: plano diário reorganizado
 * automaticamente conforme o algoritmo de urgência (ver scripts/scheduler.js).
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;

  function weekStrip() {
    const today = new Date();
    const items = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      items.push({
        dow: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        num: d.getDate(),
        isToday: i === 0
      });
    }
    return items;
  }

  function render(container) {
    global.Router.setHeaderTitle('Cronograma Inteligente');
    const S = global.State, Sc = global.Scheduler;
    const settings = S.getSettings();
    const plan = Sc.buildDailyPlan(settings.dailyGoalMinutes);
    const dueReviews = S.dueReviews(2);

    container.innerHTML = `
      <div class="schedule-day">
        ${weekStrip().map(d => `
          <div class="schedule-day__item ${d.isToday ? 'is-today' : ''}">
            <span class="schedule-day__dow">${d.dow}</span>
            <span class="schedule-day__num">${d.num}</span>
          </div>`).join('')}
      </div>

      <div class="section">
        <div class="card--flat card" style="display:flex;align-items:center;gap:14px">
          <div class="grow">
            <div class="type-caption">TEMPO DISPONÍVEL HOJE</div>
            <div class="type-title-2" style="margin-top:2px">${settings.dailyGoalMinutes} min</div>
          </div>
          <button class="btn btn--ghost btn--sm" id="btn-edit-time">Ajustar</button>
          <button class="icon-btn" id="btn-recalc" aria-label="Recalcular">${Icon('refresh')}</button>
        </div>
      </div>

      ${dueReviews.length ? `
      <div class="section">
        <div class="section__head"><div class="type-title-2">Revisões pendentes</div><span class="chip chip--red">${dueReviews.length}</span></div>
        <div class="card card--flat">
          ${dueReviews.slice(0, 5).map(r => `
            <div class="tema-row">
              <div class="seal ${r.atrasado ? 'seal--pending' : 'seal--active'}" style="width:34px;height:34px">${Icon('clock')}</div>
              <div class="tema-row__body">
                <div class="tema-row__title">${U.escapeHtml(r.tema.nome)}</div>
                <div class="tema-row__meta">${U.escapeHtml(r.disc.nome)} · ${r.atrasado ? 'Atrasada' : U.fmtDateShort(r.tema.proximaRevisao)}</div>
              </div>
              <button class="chip chip--blue" data-disc="${r.disc.id}" data-tema="${r.tema.id}">Revisar</button>
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      <div class="section">
        <div class="section__head">
          <div class="type-title-2">Plano de hoje</div>
          <span class="type-footnote">${plan.reduce((s,p)=>s+p.minutos,0)} min alocados</span>
        </div>
        ${plan.length === 0 ? `
          <div class="empty-state">${Icon('calendar')}<div class="type-body">Nenhum tempo disponível configurado.</div></div>
        ` : `
        <div class="card card--flat">
          ${plan.map(item => `
            <div class="plan-item">
              <div class="plan-item__time type-ledger">${item.horario}</div>
              <div class="plan-item__bar" style="background:${item.disc.cor}"></div>
              <div class="plan-item__body">
                <div class="flex items-center gap-2">
                  <span class="type-headline">${U.escapeHtml(item.tema.nome)}</span>
                  ${item.isRevisao ? '<span class="chip chip--red" style="font-size:10px;padding:2px 8px">Revisão</span>' : ''}
                </div>
                <div class="type-footnote">${U.escapeHtml(item.disc.nome)} · ${item.minutos} min</div>
              </div>
              <button class="icon-btn" data-disc="${item.disc.id}" data-tema="${item.tema.id}" aria-label="Iniciar">${Icon('play')}</button>
            </div>
          `).join('')}
        </div>`}
      </div>
    `;

    container.querySelectorAll('[data-disc][data-tema]').forEach(btn => {
      btn.onclick = () => global.Pages.focus.open(btn.dataset.disc, btn.dataset.tema);
    });

    document.getElementById('btn-recalc').onclick = () => { global.UI.toast('Cronograma recalculado', 'success'); global.Router.render(); };
    document.getElementById('btn-edit-time').onclick = openTimeSheet;
  }

  function openTimeSheet() {
    const settings = global.State.getSettings();
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="sheet__title type-title-2">Tempo disponível hoje</div>
      <div class="field">
        <label>Minutos disponíveis</label>
        <input type="number" id="inp-minutes" value="${settings.dailyGoalMinutes}" min="20" step="10" />
      </div>
      <button class="btn btn--primary btn--block" id="btn-save-time">Salvar e recalcular</button>
    `;
    global.UI.openSheet(wrap);
    wrap.querySelector('#btn-save-time').onclick = () => {
      const val = parseInt(wrap.querySelector('#inp-minutes').value, 10) || 60;
      global.State.updateSettings({ dailyGoalMinutes: val });
      global.UI.closeSheet();
      global.Router.render();
    };
  }

  global.Pages = global.Pages || {};
  global.Pages.schedule = { render };
})(window);
