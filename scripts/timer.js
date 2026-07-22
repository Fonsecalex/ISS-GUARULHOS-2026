/**
 * scripts/timer.js — Cronômetro: Pomodoro, Livre e Contagem Regressiva.
 *
 * IMPORTANTE (correção de segundo plano):
 * Navegadores móveis (especialmente Safari/iOS) pausam ou desaceleram
 * `setInterval` quando o app vai para segundo plano — por isso o tempo
 * "parava" ao trocar de aplicativo. A solução é nunca confiar em quantos
 * "tiques" do interval realmente dispararam. Em vez disso, guardamos
 * SEMPRE o horário real (timestamp) de início/fim de cada fase, e a cada
 * atualização recalculamos o tempo decorrido a partir da diferença de
 * relógio (Date.now()) — não de contagem de ticks. Isso significa que,
 * mesmo que o navegador congele o JS por 20 minutos enquanto você estuda
 * em outro app, ao voltar o cronômetro mostra o valor correto na hora.
 *
 * Além disso, o estado ativo (o que está rodando agora) é salvo no
 * localStorage a cada poucos segundos e restaurado ao abrir o app — isso
 * cobre o caso do iOS encerrar a aba completamente em segundo plano.
 */
(function (global) {
  'use strict';
  const U = global.Utils;

  const POMODORO_FOCUS_SEC = 25 * 60;
  const POMODORO_BREAK_SEC = 5 * 60;
  const POMODORO_LONG_BREAK_SEC = 15 * 60;
  const PERSIST_KEY = 'auditorProIbam.v1.activeTimer';

  function createTimer() {
    let mode = 'pomodoro';   // 'pomodoro' | 'livre' | 'contagem'
    let phase = 'foco';      // pomodoro apenas: 'foco' | 'pausa'
    let pomodoroCount = 0;
    let running = false;
    let disciplineId = null, temaId = null;
    let intervalId = null;
    const listeners = new Set();

    // --- Modelo baseado em timestamps (fonte da verdade) ---
    let phaseStartedAt = null;      // epoch ms de quando a fase atual/sessão começou (ou foi retomada)
    let phaseTargetSec = POMODORO_FOCUS_SEC; // duração alvo da fase atual (pomodoro/contagem); irrelevante p/ livre
    let accumulatedBeforePause = 0; // segundos já contabilizados antes da pausa atual, dentro da fase/sessão
    let studySecondsAccumulated = 0; // segundos "de estudo" reais já registrados (soma de fases de foco/livre concluídas)
    let sessionStartedAt = null;     // início da sessão inteira (para o registro no histórico)
    let phaseTargetSecForCountdown = 30 * 60; // duração escolhida p/ modo Contagem Regressiva

    function emit() { listeners.forEach(fn => fn(getState())); }
    function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

    /** Segundos decorridos na fase atual, calculados a partir do relógio real */
    function elapsedInPhase() {
      if (!running || !phaseStartedAt) return accumulatedBeforePause;
      return accumulatedBeforePause + Math.floor((Date.now() - phaseStartedAt) / 1000);
    }

    function getState() {
      const elapsed = elapsedInPhase();
      const remainingSec = Math.max(0, phaseTargetSec - elapsed);
      const elapsedSec = elapsed; // usado no modo livre
      return {
        mode, phase, pomodoroCount, running, elapsedSec, remainingSec,
        countdownTargetSec: phaseTargetSec, disciplineId, temaId,
        studySecondsAccumulated: studySecondsAccumulated + (phase === 'foco' || mode === 'livre' ? elapsed : 0)
      };
    }

    function setContext(dId, tId) { disciplineId = dId; temaId = tId; persistState(); }

    function setMode(newMode) {
      stop(false);
      mode = newMode;
      phase = 'foco';
      pomodoroCount = 0;
      phaseTargetSec = mode === 'pomodoro' ? POMODORO_FOCUS_SEC : (mode === 'contagem' ? phaseTargetSecForCountdown : Infinity);
      studySecondsAccumulated = 0;
      accumulatedBeforePause = 0;
      phaseStartedAt = null;
      emit();
    }

    function setCountdownMinutes(min) {
      phaseTargetSecForCountdown = min * 60;
      if (mode === 'contagem' && !running) { phaseTargetSec = min * 60; accumulatedBeforePause = 0; }
      emit();
    }

    function start() {
      if (running) return;
      running = true;
      phaseStartedAt = Date.now();
      sessionStartedAt = sessionStartedAt || new Date().toISOString();
      if (mode === 'livre') phaseTargetSec = Infinity;
      intervalId = setInterval(tick, 1000);
      persistState();
      emit();
    }

    function pause() {
      if (running) accumulatedBeforePause = elapsedInPhase();
      running = false;
      phaseStartedAt = null;
      clearInterval(intervalId);
      persistState();
      emit();
    }

    /** Chamado a cada segundo (relógio) apenas para atualizar a UI e detectar fim de fase */
    function tick() {
      const st = getState();
      if (mode !== 'livre' && st.remainingSec <= 0) {
        handlePhaseEnd();
        return;
      }
      emit();
    }

    function handlePhaseEnd() {
      if (mode === 'pomodoro') {
        if (phase === 'foco') {
          studySecondsAccumulated += phaseTargetSec;
          pomodoroCount++;
          phase = 'pausa';
          phaseTargetSec = (pomodoroCount % 4 === 0) ? POMODORO_LONG_BREAK_SEC : POMODORO_BREAK_SEC;
          global.UI && global.UI.toast('Ciclo concluído! Hora da pausa.', 'success');
        } else {
          phase = 'foco';
          phaseTargetSec = POMODORO_FOCUS_SEC;
          global.UI && global.UI.toast('Pausa encerrada. Volte ao foco!', 'success');
        }
        accumulatedBeforePause = 0;
        phaseStartedAt = running ? Date.now() : null;
        persistState();
        emit();
      } else if (mode === 'contagem') {
        finish();
      }
    }

    /** Encerra a sessão (fim natural da contagem regressiva) e grava no histórico */
    function finish() {
      const st = getState(); // captura o tempo total real (baseado em relógio) antes de zerar
      studySecondsAccumulated = st.studySecondsAccumulated;
      commitSession();
      resetInternal();
      emit();
    }

    /** Para o cronômetro; se registrar=true (padrão), grava o tempo já estudado no histórico */
    function stop(registrar) {
      if (registrar === undefined) registrar = true;
      const st = getState(); // captura o tempo total real (baseado em relógio) antes de zerar
      studySecondsAccumulated = st.studySecondsAccumulated;
      if (registrar) commitSession();
      resetInternal();
      emit();
    }

    function resetInternal() {
      pause();
      phase = 'foco';
      phaseTargetSec = mode === 'pomodoro' ? POMODORO_FOCUS_SEC : (mode === 'contagem' ? phaseTargetSecForCountdown : Infinity);
      accumulatedBeforePause = 0;
      phaseStartedAt = null;
      sessionStartedAt = null;
      studySecondsAccumulated = 0;
      clearPersisted();
    }

    function commitSession() {
      if (studySecondsAccumulated < 5) return; // ignora sessões triviais
      global.State.addSession({
        id: U.uid('sess'),
        disciplineId, temaId,
        seconds: Math.round(studySecondsAccumulated),
        type: mode,
        startedAt: sessionStartedAt || new Date().toISOString(),
        endedAt: new Date().toISOString()
      });
    }

    // --- Persistência para sobreviver a suspensão total do app (iOS) ---
    function persistState() {
      try {
        localStorage.setItem(PERSIST_KEY, JSON.stringify({
          mode, phase, pomodoroCount, running, disciplineId, temaId,
          phaseStartedAt, phaseTargetSec, accumulatedBeforePause,
          studySecondsAccumulated, sessionStartedAt
        }));
      } catch (e) { /* armazenamento indisponível — não é crítico */ }
    }
    function clearPersisted() {
      try { localStorage.removeItem(PERSIST_KEY); } catch (e) { /* ignore */ }
    }

    /** Restaura uma sessão em andamento salva antes do app ser suspenso/recarregado */
    function restore() {
      let raw;
      try { raw = localStorage.getItem(PERSIST_KEY); } catch (e) { return false; }
      if (!raw) return false;
      try {
        const s = JSON.parse(raw);
        mode = s.mode; phase = s.phase; pomodoroCount = s.pomodoroCount;
        disciplineId = s.disciplineId; temaId = s.temaId;
        // Infinity não sobrevive ao JSON.stringify/parse (vira null) — reconstrói pelo modo.
        phaseTargetSec = mode === 'livre' ? Infinity : s.phaseTargetSec;
        accumulatedBeforePause = s.accumulatedBeforePause;
        studySecondsAccumulated = s.studySecondsAccumulated; sessionStartedAt = s.sessionStartedAt;
        running = false; // sempre retoma pausado; o usuário decide continuar
        if (s.running && s.phaseStartedAt) {
          // estava rodando quando o app "sumiu" — soma o tempo que passou até agora antes de pausar
          accumulatedBeforePause += Math.floor((Date.now() - s.phaseStartedAt) / 1000);
        }
        phaseStartedAt = null;
        if (intervalId) clearInterval(intervalId);
        persistState();
        return true;
      } catch (e) { return false; }
    }

    // Recalcula/atualiza a UI imediatamente ao voltar do segundo plano
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') emit();
      });
      // salva periodicamente enquanto roda, cobrindo o caso de encerramento abrupto
      setInterval(() => { if (running) persistState(); }, 5000);
    }

    return {
      subscribe, getState, setContext, setMode, setCountdownMinutes,
      start, pause, stop, finish, restore,
      constants: { POMODORO_FOCUS_SEC, POMODORO_BREAK_SEC, POMODORO_LONG_BREAK_SEC }
    };
  }

  global.Timer = createTimer();
})(window);
