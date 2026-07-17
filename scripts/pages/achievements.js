/**
 * scripts/pages/achievements.js — Gamificação: nível, XP, sequência e conquistas.
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;

  function render(container) {
    global.Router.setHeaderTitle('Conquistas');
    const G = global.Gamification;
    const gam = G.summary();
    const pctLevel = U.pct(gam.xpIntoLevel, gam.xpForNextLevel);

    container.innerHTML = `
      <div class="card level-card" style="margin-bottom:24px">
        <div class="level-card__ring">
          <svg viewBox="0 0 100 100" width="96" height="96">
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--paper-2)" stroke-width="8"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--gold)" stroke-width="8" stroke-linecap="round"
              stroke-dasharray="${2*Math.PI*44}" stroke-dashoffset="${2*Math.PI*44 - (pctLevel/100)*2*Math.PI*44}"
              transform="rotate(-90 50 50)"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
            <span class="type-title-1">${gam.level}</span>
            <span class="type-caption">NÍVEL</span>
          </div>
        </div>
        <div class="type-headline">${gam.xp} XP total</div>
        <div class="type-footnote">${gam.xpIntoLevel} / ${gam.xpForNextLevel} XP para o próximo nível</div>
        <div class="flex items-center justify-between" style="margin-top:16px">
          <div class="chip chip--gold">${Icon('flame')} ${gam.streak} dias seguidos</div>
          <div class="chip chip--blue">${Icon('trophy')} ${gam.badges.length}/${G.BADGES.length} conquistas</div>
        </div>
      </div>

      <div class="section__head"><div class="type-title-2">Conquistas</div></div>
      <div class="badges-grid" id="badges-grid"></div>
    `;

    const grid = document.getElementById('badges-grid');
    G.BADGES.forEach(b => {
      const unlocked = gam.badges.includes(b.id);
      const tile = document.createElement('div');
      tile.className = `badge-tile ${unlocked ? '' : 'is-locked'}`;
      tile.innerHTML = `<div class="badge-tile__icon">${Icon(b.icon)}</div><div class="badge-tile__label">${U.escapeHtml(b.label)}</div>`;
      grid.appendChild(tile);
    });
  }

  global.Pages = global.Pages || {};
  global.Pages.achievements = { render };
})(window);
