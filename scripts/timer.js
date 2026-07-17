/**
 * scripts/timer.js — Cronômetro: Pomodoro, Livre e Contagem Regressiva.
 * Registra automaticamente a sessão em State.addSession ao finalizar/pausar-parar.
 */
(function (global) {
  'use strict';
  const U = global.Utils;

  const POMODORO_FOCUS_SEC = 25 * 60;
  const POMODORO_BREAK_SEC = 5 * 60;
  const POMODORO_LONG_BREAK_SEC = 15 * 60;

  function createTimer() {
    let mode = 'pomodoro'; // 'pomodoro' | 'livre' | 'contagem'
    let phase = 'foco';    // pomodoro apenas: 'foco' | 'pausa'
    let pomodoroCount = 0;
    let running = false;
    let elapsedSec = 0;         // usado em modo 'livre' (conta pra cima)
    let remainingSec = POMODORO_FOCUS_SEC; // usado em pomodoro/contagem (conta pra baixo)
    let countdownTargetSec = 30 * 60;
    let disciplineId = null, temaId = null;
    let intervalId = null;
    let sessionStartedAt = null;
    let studySecondsAccumulated = 0; // segundos "de estudo" reais nesta sessão (exclui pausas do pomodoro)
    const listeners = new Set();

    function emit() { listeners.forEach(fn => fn(getState())); }
    function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

    function getState() {
      return {
        mode, phase, pomodoroCount, running, elapsedSec, remainingSec,
        countdownTargetSec, disciplineId, temaId, studySecondsAccumulated
      };
    }

    function setContext(dId, tId) { disciplineId = dId; temaId = tId; }

    function setMode(newMode) {
      stop(false);
      mode = newMode;
      phase = 'foco';
      pomodoroCount = 0;
      elapsedSec = 0;
      remainingSec = mode === 'pomodoro' ? POMODORO_FOCUS_SEC : countdownTargetSec;
      studySecondsAccumulated = 0;
      emit();
    }

    function setCountdownMinutes(min) {
      countdownTargetSec = min * 60;
      if (mode === 'contagem' && !running) remainingSec = countdownTargetSec;
      emit();
    }

    function start() {
      if (running) return;
      running = true;
      sessionStartedAt = sessionStartedAt || new Date().toISOString();
      intervalId = setInterval(tick, 1000);
      emit();
    }

    function pause() {
      running = false;
      clearInterval(intervalId);
      emit();
    }

    function tick() {
      if (mode === 'livre') {
        elapsedSec++; studySecondsAccumulated++;
      } else {
        remainingSec--;
        if (phase === 'foco') studySecondsAccumulated++;
        if (remainingSec <= 0) {
          if (mode === 'pomodoro') {
            if (phase === 'foco') {
              pomodoroCount++;
              phase = 'pausa';
              remainingSec = (pomodoroCount % 4 === 0) ? POMODORO_LONG_BREAK_SEC : POMODORO_BREAK_SEC;
              global.UI && global.UI.toast('Ciclo concluído! Hora da pausa.', 'success');
            } else {
              phase = 'foco';
              remainingSec = POMODORO_FOCUS_SEC;
              global.UI && global.UI.toast('Pausa encerrada. Volte ao foco!', 'success');
            }
          } else if (mode === 'contagem') {
            finish();
            return;
          }
        }
      }
      emit();
    }

    /** Encerra a sessão e grava no histórico via State */
    function finish() {
      commitSession();
      pause();
      remainingSec = mode === 'pomodoro' ? POMODORO_FOCUS_SEC : countdownTargetSec;
      elapsedSec = 0;
      phase = 'foco';
      sessionStartedAt = null;
      studySecondsAccumulated = 0;
      emit();
    }

    /** Para o cronômetro; se registrar=true, grava o tempo já estudado */
    function stop(registrar) {
      if (registrar === undefined) registrar = true;
      if (registrar) commitSession();
      pause();
      remainingSec = mode === 'pomodoro' ? POMODORO_FOCUS_SEC : countdownTargetSec;
      elapsedSec = 0; phase = 'foco'; sessionStartedAt = null; studySecondsAccumulated = 0;
      emit();
    }

    function commitSession() {
      if (studySecondsAccumulated < 5) return; // ignora sessões triviais
      global.State.addSession({
        id: U.uid('sess'),
        disciplineId, temaId,
        seconds: studySecondsAccumulated,
        type: mode,
        startedAt: sessionStartedAt || new Date().toISOString(),
        endedAt: new Date().toISOString()
      });
    }

    return {
      subscribe, getState, setContext, setMode, setCountdownMinutes,
      start, pause, stop, finish,
      constants: { POMODORO_FOCUS_SEC, POMODORO_BREAK_SEC, POMODORO_LONG_BREAK_SEC }
    };
  }

  global.Timer = createTimer();
})(window);
