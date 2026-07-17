/**
 * scripts/pages/dashboard.js — Painel inicial com visão geral do progresso.
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;

  function ringSvg(pct, size, stroke, colorVar) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="${stroke}"/>
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${colorVar}" stroke-width="${stroke}"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
          transform="rotate(-90 ${size/2} ${size/2})" style="transition: stroke-dashoffset .6s ease"/>
      </svg>`;
  }

  function render(container) {
    global.Router.setHeaderTitle('Início');
    const S = global.State, Sc = global.Scheduler, G = global.Gamification;

    const edital = S.editalProgress();
    const todaySec = S.totalSecondsToday();
    const totalSec = S.totalSecondsAll();
    const qStats = S.allQuestionStats();
    const gam = G.summary();
    const nextRev = S.nextReview();
    const settings = S.getSettings();
    const daysExam = S.daysUntilExam();
    const suggestion = Sc.nextSuggestedTema();
    const avgSessionSec = (() => {
      const sessions = S.raw().sessions;
      return sessions.length ? totalSec / sessions.length : 0;
    })();

    container.innerHTML = `
      <div class="hero-card">
        <div class="hero-card__top">
          <div>
            <div class="type-caption" style="color:rgba(255,255,255,.6)">PROGRESSO DO EDITAL</div>
            <div class="type-display" style="margin-top:4px">${edital.pctPonderado}%</div>
            <div class="type-footnote" style="color:rgba(255,255,255,.55)">${edital.concluidos}/${edital.totalTemas} temas concluídos</div>
          </div>
          <div class="hero-card__ring">
            ${ringSvg(edital.pctPonderado, 64, 7, 'var(--gold)')}
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">${edital.pctPonderado}%</div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="hero-card__streak">${Icon('flame')} ${gam.streak} dia${gam.streak === 1 ? '' : 's'} seguidos</div>
          <div class="hero-card__streak">${Icon('star')} Nível ${gam.level}</div>
        </div>
        <div class="hero-card__grid">
          <div class="hero-card__stat"><b>${U.fmtDuration(todaySec)}</b><span>Hoje</span></div>
          <div class="hero-card__stat"><b>${qStats.total}</b><span>Questões</span></div>
          <div class="hero-card__stat"><b>${qStats.taxa}%</b><span>Acertos</span></div>
        </div>
      </div>

      ${suggestion ? `
      <div class="section">
        <div class="card" style="display:flex;align-items:center;gap:16px" id="suggestion-card">
          <div class="seal seal--active">${Icon('target')}</div>
          <div class="grow">
            <div class="type-caption text-blue">PRÓXIMA AÇÃO RECOMENDADA</div>
            <div class="type-headline" style="margin-top:2px">${U.escapeHtml(suggestion.tema.nome)}</div>
            <div class="type-footnote">${U.escapeHtml(suggestion.disc.nome)}</div>
          </div>
          <button class="btn btn--primary btn--sm" id="btn-start-suggestion">Estudar</button>
        </div>
      </div>` : ''}

      <div class="section">
        <div class="section__head"><div class="type-title-2">Metas</div></div>
        <div class="metrics-grid metrics-grid--3">
          <div class="metric">
            <span class="metric__value">${U.fmtDuration(todaySec)}</span>
            <span class="metric__label">Meta diária (${U.fmtDuration(settings.dailyGoalMinutes * 60)})</span>
            <div class="progress progress--thin" style="margin-top:8px"><div class="progress__fill" style="width:${U.pct(todaySec, settings.dailyGoalMinutes*60)}%"></div></div>
          </div>
          <div class="metric">
            <span class="metric__value">${U.fmtDuration(S.totalSecondsInRange(weekStartISO(), U.todayISO()))}</span>
            <span class="metric__label">Meta semanal (${U.fmtDuration(settings.weeklyGoalMinutes*60)})</span>
            <div class="progress progress--thin" style="margin-top:8px"><div class="progress__fill" style="width:${U.pct(S.totalSecondsInRange(weekStartISO(), U.todayISO()), settings.weeklyGoalMinutes*60)}%"></div></div>
          </div>
          <div class="metric">
            <span class="metric__value">${U.fmtDuration(S.totalSecondsInRange(monthStartISO(), U.todayISO()))}</span>
            <span class="metric__label">Meta mensal (${U.fmtDuration(settings.monthlyGoalMinutes*60)})</span>
            <div class="progress progress--thin" style="margin-top:8px"><div class="progress__fill" style="width:${U.pct(S.totalSecondsInRange(monthStartISO(), U.todayISO()), settings.monthlyGoalMinutes*60)}%"></div></div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section__head"><div class="type-title-2">Visão Geral</div></div>
        <div class="metrics-grid">
          <div class="metric"><span class="metric__value">${U.fmtDuration(totalSec)}</span><span class="metric__label">Horas estudadas (total)</span></div>
          <div class="metric"><span class="metric__value">${daysExam !== null ? daysExam + ' dias' : '—'}</span><span class="metric__label">Tempo restante p/ prova</span></div>
          <div class="metric"><span class="metric__value">${qStats.acertos}</span><span class="metric__label">Acertos</span></div>
          <div class="metric"><span class="metric__value">${qStats.erros}</span><span class="metric__label">Erros</span></div>
          <div class="metric"><span class="metric__value">${U.fmtDuration(avgSessionSec)}</span><span class="metric__label">Tempo médio por sessão</span></div>
          <div class="metric"><span class="metric__value">${gam.xp} XP</span><span class="metric__label">Experiência total</span></div>
        </div>
      </div>

      ${nextRev ? `
      <div class="section">
        <div class="section__head">
          <div class="type-title-2">Próxima Revisão</div>
          <a class="section__link" href="#/schedule">Ver plano</a>
        </div>
        <div class="card card--flat next-review-card">
          <div class="seal ${nextRev.atrasado ? 'seal--pending' : 'seal--active'}">${Icon('clock')}</div>
          <div class="next-review-card__body">
            <div class="type-headline">${U.escapeHtml(nextRev.tema.nome)}</div>
            <div class="type-footnote">${U.escapeHtml(nextRev.disc.nome)} · ${nextRev.atrasado ? 'Atrasada' : 'Prevista para ' + U.fmtDateShort(nextRev.tema.proximaRevisao)}</div>
          </div>
          <button class="chip chip--blue" id="btn-review-now">Revisar</button>
        </div>
      </div>` : ''}

      <div class="section">
        <div class="section__head"><div class="type-title-2">Foco Atual</div></div>
        <div class="card-grid">
          <div class="card card--flat">
            <div class="type-caption">DISCIPLINA</div>
            <div class="type-headline" style="margin-top:4px">${suggestion ? U.escapeHtml(suggestion.disc.nome) : '—'}</div>
          </div>
          <div class="card card--flat">
            <div class="type-caption">TEMA</div>
            <div class="type-headline" style="margin-top:4px">${suggestion ? U.escapeHtml(suggestion.tema.nome) : '—'}</div>
          </div>
        </div>
      </div>
    `;

    const btnSug = document.getElementById('btn-start-suggestion');
    if (btnSug) btnSug.onclick = () => global.Pages.focus.open(suggestion.disc.id, suggestion.tema.id);
    const btnRev = document.getElementById('btn-review-now');
    if (btnRev) btnRev.onclick = () => global.Pages.focus.open(nextRev.disc.id, nextRev.tema.id);
  }

  function weekStartISO() {
    const d = new Date();
    const day = d.getDay() === 0 ? 7 : d.getDay();
    d.setDate(d.getDate() - day + 1);
    return d.toISOString().slice(0, 10);
  }
  function monthStartISO() {
    const d = new Date(); d.setDate(1);
    return d.toISOString().slice(0, 10);
  }

  global.Pages = global.Pages || {};
  global.Pages.dashboard = { render };
})(window);
