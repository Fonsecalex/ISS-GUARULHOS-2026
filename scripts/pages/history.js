/**
 * scripts/pages/history.js — Histórico de Estudos.
 * Mostra todas as sessões registradas (cronômetro) agrupadas por dia,
 * com edição de duração e exclusão — para corrigir registros errados.
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;

  const TYPE_LABEL = { pomodoro: 'Pomodoro', livre: 'Livre', contagem: 'Contagem' };

  function groupByDay(sessions) {
    const groups = {};
    sessions.forEach(s => {
      const day = (s.endedAt || s.startedAt || '').slice(0, 10);
      (groups[day] = groups[day] || []).push(s);
    });
    return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(day => ({ day, items: groups[day] }));
  }

  function render(container) {
    global.Router.setHeaderTitle('Histórico de Estudos');
    const S = global.State;
    const sessions = [...S.raw().sessions].sort((a, b) => (b.endedAt || b.startedAt || '').localeCompare(a.endedAt || a.startedAt || ''));
    const groups = groupByDay(sessions);

    const totalSeg = sessions.reduce((s, x) => s + x.seconds, 0);

    container.innerHTML = `
      <div class="metrics-grid" style="margin-bottom:20px">
        <div class="metric"><span class="metric__value">${sessions.length}</span><span class="metric__label">Sessões registradas</span></div>
        <div class="metric"><span class="metric__value">${U.fmtDuration(totalSeg)}</span><span class="metric__label">Tempo total</span></div>
      </div>
      <div id="history-groups"></div>
    `;

    const wrap = document.getElementById('history-groups');
    if (!groups.length) {
      wrap.innerHTML = `<div class="empty-state">${Icon('timer')}<div class="type-body">Nenhuma sessão de estudo registrada ainda.</div></div>`;
      return;
    }

    groups.forEach(g => {
      const section = document.createElement('div');
      section.className = 'section';
      const dayTotal = g.items.reduce((s, x) => s + x.seconds, 0);
      section.innerHTML = `
        <div class="checklist-group__title">
          <span class="type-headline">${formatDay(g.day)}</span>
          <span class="type-footnote type-ledger">${U.fmtDuration(dayTotal)}</span>
        </div>
        <div class="card card--flat" id="grp-${g.day}"></div>
      `;
      wrap.appendChild(section);
      const body = section.querySelector(`#grp-${g.day}`);
      g.items.forEach(s => body.appendChild(renderRow(s)));
    });
  }

  function formatDay(iso) {
    if (iso === U.todayISO()) return 'Hoje';
    if (iso === U.addDays(U.todayISO(), -1)) return 'Ontem';
    return U.fmtDateFull(iso);
  }

  function renderRow(session) {
    const S = global.State;
    const found = session.temaId ? S.findTemaGlobal(session.temaId) : null;
    const row = U.el('div', { class: 'list-row', onclick: () => openEditSheet(session) }, []);
    row.innerHTML = `
      <div class="list-row__body">
        <div class="list-row__title">${found ? U.escapeHtml(found.tema.nome) : 'Estudo livre / sem tema'}</div>
        <div class="list-row__meta">${found ? U.escapeHtml(found.disc.nome) + ' · ' : ''}${TYPE_LABEL[session.type] || session.type} · ${U.fmtDuration(session.seconds)}</div>
      </div>
      <div class="list-row__chevron">${Icon('chevron-right')}</div>
    `;
    return row;
  }

  function openEditSheet(session) {
    const S = global.State;
    const found = session.temaId ? S.findTemaGlobal(session.temaId) : null;
    const minutosAtuais = Math.round(session.seconds / 60);

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="sheet__title">
        <div class="type-caption">${found ? U.escapeHtml(found.disc.nome) : 'SEM DISCIPLINA'}</div>
        <div class="type-title-2">${found ? U.escapeHtml(found.tema.nome) : 'Estudo livre'}</div>
      </div>
      <div class="type-footnote" style="margin-bottom:16px">${TYPE_LABEL[session.type] || session.type} · ${U.fmtDateFull((session.endedAt || session.startedAt || '').slice(0,10))}</div>
      <div class="field">
        <label>Duração (minutos)</label>
        <input type="number" id="inp-minutos" value="${minutosAtuais}" min="1" />
      </div>
      <button class="btn btn--primary btn--block" id="btn-save-session" style="margin-bottom:12px">Salvar correção</button>
      <button class="btn btn--danger btn--block" id="btn-delete-session">${Icon('trash')} Excluir registro</button>
    `;
    global.UI.openSheet(wrap);

    wrap.querySelector('#btn-save-session').onclick = () => {
      const min = parseInt(wrap.querySelector('#inp-minutos').value, 10);
      if (!min || min < 1) { global.UI.toast('Informe uma duração válida', 'error'); return; }
      S.updateSession(session.id, { seconds: min * 60 });
      global.UI.closeSheet();
      global.UI.toast('Registro corrigido', 'success');
      global.Router.render();
    };

    wrap.querySelector('#btn-delete-session').onclick = () => {
      global.UI.confirmDialog({
        title: 'Excluir registro?',
        message: 'Esse tempo será descontado do total estudado no tema. Não pode ser desfeito.',
        confirmLabel: 'Excluir', danger: true,
        onConfirm: () => {
          S.deleteSession(session.id);
          global.UI.closeSheet();
          global.UI.toast('Registro excluído', 'success');
          global.Router.render();
        }
      });
    };
  }

  global.Pages = global.Pages || {};
  global.Pages.history = { render };
})(window);
