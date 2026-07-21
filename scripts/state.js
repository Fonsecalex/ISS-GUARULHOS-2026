/**
 * scripts/state.js — store central: espelho em memória do Storage + operações de domínio
 */
(function (global) {
  'use strict';
  const { Storage } = global;
  const U = global.Utils;
  const listeners = new Set();
  let data = {};

  function loadAll() { Object.values(Storage.KEYS).forEach(k => { data[k] = Storage.get(k); }); }
  function persist(key) { Storage.set(key, data[key]); notify(key); }
  function notify(key) { listeners.forEach(fn => fn(key)); }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  function getDisciplines() { return data.disciplines; }
  function getDiscipline(id) { return data.disciplines.find(d => d.id === id); }
  function getTema(disciplineId, temaId) { const disc = getDiscipline(disciplineId); return disc ? disc.temas.find(t => t.id === temaId) : null; }
  function findTemaGlobal(temaId) {
    for (const disc of data.disciplines) { const t = disc.temas.find(t => t.id === temaId); if (t) return { disc, tema: t }; }
    return null;
  }

  function setTemaStatus(disciplineId, temaId, status) {
    const tema = getTema(disciplineId, temaId);
    if (!tema) return;
    tema.status = status;
    if (status === 'concluido' || status === 'dominado') scheduleNextReview(disciplineId, temaId, true);
    persist('disciplines');
    global.Gamification && global.Gamification.registerTemaStatus(status);
  }

  function updateTema(disciplineId, temaId, patch) {
    const tema = getTema(disciplineId, temaId);
    if (!tema) return;
    Object.assign(tema, patch);
    persist('disciplines');
  }

  function addSession(session) {
    data.sessions.push(session);
    persist('sessions');
    if (session.disciplineId && session.temaId) {
      const tema = getTema(session.disciplineId, session.temaId);
      if (tema) {
        tema.tempoEstudadoSeg += session.seconds;
        if (tema.status === 'nao_iniciado') tema.status = 'em_andamento';
        persist('disciplines');
      }
    }
    global.Gamification && global.Gamification.registerStudy(session.seconds);
  }

  /** Corrige uma sessão registrada por engano (ex: minutos errados). Ajusta o tempo agregado do tema. */
  function updateSession(id, patch) {
    const s = data.sessions.find(x => x.id === id);
    if (!s) return;
    const oldSeconds = s.seconds;
    Object.assign(s, patch);
    persist('sessions');
    if (s.disciplineId && s.temaId && patch.seconds !== undefined && patch.seconds !== oldSeconds) {
      const tema = getTema(s.disciplineId, s.temaId);
      if (tema) {
        tema.tempoEstudadoSeg = Math.max(0, tema.tempoEstudadoSeg - oldSeconds + s.seconds);
        persist('disciplines');
      }
    }
  }

  /** Remove uma sessão registrada por engano. Ajusta o tempo agregado do tema. */
  function deleteSession(id) {
    const s = data.sessions.find(x => x.id === id);
    if (!s) return;
    data.sessions = data.sessions.filter(x => x.id !== id);
    persist('sessions');
    if (s.disciplineId && s.temaId) {
      const tema = getTema(s.disciplineId, s.temaId);
      if (tema) {
        tema.tempoEstudadoSeg = Math.max(0, tema.tempoEstudadoSeg - s.seconds);
        persist('disciplines');
      }
    }
  }

  function totalSecondsToday() {
    const today = U.todayISO();
    return data.sessions.filter(s => (s.endedAt || s.startedAt || '').slice(0, 10) === today).reduce((sum, s) => sum + s.seconds, 0);
  }
  function totalSecondsInRange(startISO, endISO) {
    return data.sessions.filter(s => { const d = (s.endedAt || s.startedAt || '').slice(0, 10); return d >= startISO && d <= endISO; })
      .reduce((sum, s) => sum + s.seconds, 0);
  }
  function totalSecondsAll() { return data.sessions.reduce((sum, s) => sum + s.seconds, 0); }

  function addQuestionRecord(rec) {
    data.questions.push(rec);
    persist('questions');
    if (rec.disciplineId && rec.temaId) {
      const tema = getTema(rec.disciplineId, rec.temaId);
      if (tema) {
        tema.questoes += rec.quantidade; tema.acertos += rec.acertos; tema.erros += rec.erros;
        const taxaErro = rec.quantidade > 0 ? rec.erros / rec.quantidade : 0;
        if (taxaErro >= 0.4) scheduleNextReview(rec.disciplineId, rec.temaId, false, true);
        persist('disciplines');
      }
    }
    global.Gamification && global.Gamification.registerQuestions(rec.quantidade, rec.acertos);
  }

  function allQuestionStats() {
    const total = data.questions.reduce((a, q) => a + q.quantidade, 0);
    const acertos = data.questions.reduce((a, q) => a + q.acertos, 0);
    const erros = data.questions.reduce((a, q) => a + q.erros, 0);
    return { total, acertos, erros, taxa: U.pct(acertos, total) };
  }

  function addSimulado(sim) { data.simulados.push(sim); persist('simulados'); global.Gamification && global.Gamification.registerSimulado(); }

  const REVIEW_INTERVALS = [1, 3, 7, 15, 30, 60, 90];

  function scheduleNextReview(disciplineId, temaId, advance, penalize) {
    const tema = getTema(disciplineId, temaId);
    if (!tema) return;
    if (penalize) tema.revisaoEtapa = Math.max(0, tema.revisaoEtapa - 2);
    else if (advance) tema.revisaoEtapa = U.clamp(tema.revisaoEtapa + 1, 0, REVIEW_INTERVALS.length - 1);
    const dias = REVIEW_INTERVALS[tema.revisaoEtapa] || REVIEW_INTERVALS[0];
    tema.ultimaRevisao = U.todayISO();
    tema.proximaRevisao = U.addDays(U.todayISO(), dias);
    persist('disciplines');
  }

  function dueReviews(daysAhead) {
    daysAhead = daysAhead || 0;
    const limit = U.addDays(U.todayISO(), daysAhead);
    const out = [];
    data.disciplines.forEach(disc => disc.temas.forEach(t => {
      if (t.proximaRevisao && t.proximaRevisao <= limit) out.push({ disc, tema: t, atrasado: t.proximaRevisao < U.todayISO() });
    }));
    return out.sort((a, b) => (a.tema.proximaRevisao || '').localeCompare(b.tema.proximaRevisao || ''));
  }
  function nextReview() { const due = dueReviews(3650); return due.length ? due[0] : null; }

  function toggleChecklistItem(id) { const item = data.checklist.find(c => c.id === id); if (!item) return; item.done = !item.done; persist('checklist'); }
  function checklistProgress() { const total = data.checklist.length; const done = data.checklist.filter(c => c.done).length; return { total, done, pct: U.pct(done, total) }; }

  function addNote(note) { data.notes.push(note); persist('notes'); }
  function updateNote(id, patch) { const n = data.notes.find(n => n.id === id); if (n) { Object.assign(n, patch); persist('notes'); } }
  function deleteNote(id) { data.notes = data.notes.filter(n => n.id !== id); persist('notes'); }
  function notesFor(temaId) { return data.notes.filter(n => n.temaId === temaId); }
  /** Todas as notas (Caderno geral), mais recentes primeiro. Inclui notas gerais (temaId nulo) e vinculadas a temas. */
  function allNotes() { return [...data.notes].sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || '')); }

  function addFlashcard(fc) {
    data.flashcards.push(fc); persist('flashcards');
    const found = findTemaGlobal(fc.temaId);
    if (found) { found.tema.flashcardsCount = (found.tema.flashcardsCount || 0) + 1; persist('disciplines'); }
  }
  function flashcardsFor(temaId) { return data.flashcards.filter(f => f.temaId === temaId); }
  function deleteFlashcard(id) {
    const fc = data.flashcards.find(f => f.id === id);
    data.flashcards = data.flashcards.filter(f => f.id !== id);
    persist('flashcards');
    if (fc) { const found = findTemaGlobal(fc.temaId); if (found) { found.tema.flashcardsCount = Math.max(0, (found.tema.flashcardsCount || 1) - 1); persist('disciplines'); } }
  }

  function editalProgress() {
    let totalTemas = 0, concluidos = 0, dominados = 0, pesoTotal = 0, pesoConcluido = 0;
    data.disciplines.forEach(disc => disc.temas.forEach(t => {
      totalTemas++; pesoTotal += disc.peso;
      if (t.status === 'concluido' || t.status === 'dominado') { concluidos++; pesoConcluido += disc.peso; }
      if (t.status === 'dominado') dominados++;
    }));
    return { totalTemas, concluidos, dominados, pct: U.pct(concluidos, totalTemas), pctPonderado: U.pct(pesoConcluido, pesoTotal) };
  }

  function disciplineProgress(disc) {
    const total = disc.temas.length;
    const concluidos = disc.temas.filter(t => t.status === 'concluido' || t.status === 'dominado').length;
    const tempo = disc.temas.reduce((s, t) => s + t.tempoEstudadoSeg, 0);
    const questoes = disc.temas.reduce((s, t) => s + t.questoes, 0);
    const acertos = disc.temas.reduce((s, t) => s + t.acertos, 0);
    return { total, concluidos, pct: U.pct(concluidos, total), tempo, questoes, acertos, taxa: U.pct(acertos, questoes) };
  }

  function currentStreak() { return (data.gamification && data.gamification.streak) || 0; }
  function getSettings() { return data.settings; }
  function updateSettings(patch) { Object.assign(data.settings, patch); persist('settings'); }
  function daysUntilExam() { if (!data.settings.examDate) return null; return U.daysBetween(U.todayISO(), data.settings.examDate); }

  global.State = {
    loadAll, persist, subscribe, raw: () => data,
    getDisciplines, getDiscipline, getTema, findTemaGlobal, setTemaStatus, updateTema,
    addSession, updateSession, deleteSession, totalSecondsToday, totalSecondsInRange, totalSecondsAll,
    addQuestionRecord, allQuestionStats, addSimulado,
    REVIEW_INTERVALS, scheduleNextReview, dueReviews, nextReview,
    toggleChecklistItem, checklistProgress,
    addNote, updateNote, deleteNote, notesFor, allNotes,
    addFlashcard, flashcardsFor, deleteFlashcard,
    editalProgress, disciplineProgress, currentStreak,
    getSettings, updateSettings, daysUntilExam
  };
})(window);
