/**
 * scripts/pages/focus.js — Modo Foco: tela limpa com cronômetro (Pomodoro,
 * Livre, Contagem Regressiva), disciplina/tema atual e progresso.
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;
  let unsubscribe = null;

  function open(disciplineId, temaId) {
    const screen = document.getElementById('focus-screen');
    const disc = global.State.getDiscipline(disciplineId);
    const tema = disc ? disc.temas.find(t => t.id === temaId) : null;

    global.Timer.setContext(disciplineId, temaId);
    if (global.Timer.getState().mode !== 'pomodoro') global.Timer.setMode('pomodoro');

    renderScreen(screen, disc, tema);
    screen.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    if (unsubscribe) unsubscribe();
    unsubscribe = global.Timer.subscribe(() => updateDynamic(screen));
  }

  function close() {
    const screen = document.getElementById('focus-screen');
    screen.classList.remove('is-open');
    document.body.style.overflow = '';
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  }

  function renderScreen(screen, disc, tema) {
    const st = global.Timer.getState();
    screen.innerHTML = `
      <button class="icon-btn focus-screen__close" id="focus-close">${Icon('close')}</button>

      <div class="focus-screen__discipline">${disc ? U.escapeHtml(disc.nome) : 'Estudo livre'}</div>
      <div class="focus-screen__tema type-title-1">${tema ? U.escapeHtml(tema.nome) : 'Selecione um tema no plano'}</div>

      <div class="segmented" style="width:100%;max-width:300px;margin-bottom:24px" id="focus-mode-seg">
        <button data-mode="pomodoro" class="${st.mode==='pomodoro'?'is-active':''}">Pomodoro</button>
        <button data-mode="livre" class="${st.mode==='livre'?'is-active':''}">Livre</button>
        <button data-mode="contagem" class="${st.mode==='contagem'?'is-active':''}">Contagem</button>
      </div>

      <div class="timer-ring">
        <svg viewBox="0 0 240 240" width="240" height="240">
          <circle class="timer-ring__bg" cx="120" cy="120" r="106"/>
          <circle class="timer-ring__fg" id="ring-fg" cx="120" cy="120" r="106"
            stroke-dasharray="${2*Math.PI*106}" stroke-dashoffset="0"/>
        </svg>
        <div class="timer-ring__label">
          <div class="timer-ring__time" id="ring-time">00:00</div>
          <div class="type-footnote" id="ring-phase">—</div>
        </div>
      </div>

      <div class="focus-screen__controls">
        <button class="secondary" id="focus-stop" aria-label="Parar">${Icon('stop')}</button>
        <button class="play" id="focus-toggle" aria-label="Iniciar/Pausar">${Icon(st.running ? 'pause' : 'play')}</button>
        <button class="secondary" id="focus-skip" aria-label="Concluir ciclo">${Icon('check')}</button>
      </div>

      <div class="focus-screen__progress">
        <div class="type-footnote flex justify-between" style="margin-bottom:6px">
          <span id="focus-status-label">Pronto</span>
          <span id="focus-count-label"></span>
        </div>
        <button class="chip chip--blue" id="focus-note-btn" style="margin:14px auto 0;display:flex">${Icon('notebook')} Nota rápida</button>
      </div>
    `;

    document.getElementById('focus-close').onclick = close;
    document.getElementById('focus-note-btn').onclick = () => {
      if (global.Pages.notebook) global.Pages.notebook.openQuickNoteSheet(disc ? disc.id : null, tema ? tema.id : null);
    };
    document.getElementById('focus-toggle').onclick = () => {
      const s = global.Timer.getState();
      s.running ? global.Timer.pause() : global.Timer.start();
    };
    document.getElementById('focus-stop').onclick = () => {
      global.Timer.stop(true);
      global.UI.toast('Sessão registrada', 'success');
      global.Router.render();
    };
    document.getElementById('focus-skip').onclick = () => {
      global.Timer.finish();
      global.UI.toast('Ciclo concluído e registrado', 'success');
      global.Router.render();
    };
    screen.querySelectorAll('#focus-mode-seg button').forEach(btn => {
      btn.onclick = () => {
        global.Timer.setMode(btn.dataset.mode);
        screen.querySelectorAll('#focus-mode-seg button').forEach(b => b.classList.toggle('is-active', b === btn));
        updateDynamic(screen);
      };
    });

    updateDynamic(screen);
  }

  function updateDynamic(screen) {
    if (!screen.classList.contains('is-open')) return;
    const st = global.Timer.getState();
    const timeEl = document.getElementById('ring-time');
    const phaseEl = document.getElementById('ring-phase');
    const ring = document.getElementById('ring-fg');
    const toggleBtn = document.getElementById('focus-toggle');
    const statusLabel = document.getElementById('focus-status-label');
    const countLabel = document.getElementById('focus-count-label');
    if (!timeEl) return;

    let seconds, totalForRing, label;
    if (st.mode === 'livre') {
      seconds = st.elapsedSec; totalForRing = Math.max(seconds, 25*60); label = 'Estudo livre';
    } else if (st.mode === 'pomodoro') {
      seconds = st.remainingSec;
      totalForRing = st.phase === 'foco' ? global.Timer.constants.POMODORO_FOCUS_SEC : (st.pomodoroCount % 4 === 0 ? global.Timer.constants.POMODORO_LONG_BREAK_SEC : global.Timer.constants.POMODORO_BREAK_SEC);
      label = st.phase === 'foco' ? 'Foco' : 'Pausa';
    } else {
      seconds = st.remainingSec; totalForRing = st.countdownTargetSec || 1; label = 'Contagem regressiva';
    }

    timeEl.textContent = U.fmtClock(seconds);
    phaseEl.textContent = label;
    statusLabel.textContent = st.running ? 'Em andamento' : 'Pausado';
    countLabel.textContent = st.mode === 'pomodoro' ? `Ciclos: ${st.pomodoroCount}` : `Estudado: ${U.fmtClock(st.studySecondsAccumulated)}`;

    const c = 2 * Math.PI * 106;
    const pctDone = st.mode === 'livre' ? Math.min(1, seconds / totalForRing) : 1 - (seconds / totalForRing);
    ring.style.strokeDashoffset = c - U.clamp(pctDone, 0, 1) * c;
    toggleBtn.innerHTML = Icon(st.running ? 'pause' : 'play');
  }

  global.Pages = global.Pages || {};
  global.Pages.focus = { open, close };
})(window);
