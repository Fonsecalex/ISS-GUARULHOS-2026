/**
 * scripts/storage.js — camada única de persistência (localStorage)
 */
(function (global) {
  'use strict';
  const NS = 'auditorProIbam.v1';
  const SCHEMA_VERSION = 1;

  const KEYS = {
    disciplines: 'disciplines', sessions: 'sessions', questions: 'questions',
    simulados: 'simulados', reviews: 'reviews', checklist: 'checklist',
    gamification: 'gamification', settings: 'settings', notes: 'notes',
    flashcards: 'flashcards', meta: 'meta'
  };

  function fullKey(key) { return `${NS}.${key}`; }

  function get(key, fallback) {
    try {
      const raw = localStorage.getItem(fullKey(key));
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (e) { console.error('[Storage] erro ao ler', key, e); return fallback; }
  }

  function set(key, value) {
    try { localStorage.setItem(fullKey(key), JSON.stringify(value)); return true; }
    catch (e) {
      console.error('[Storage] erro ao gravar', key, e);
      global.UI && global.UI.toast('Armazenamento cheio ou indisponível', 'error');
      return false;
    }
  }

  function remove(key) { localStorage.removeItem(fullKey(key)); }

  function ensureInitialized() {
    if (!get(KEYS.meta)) set(KEYS.meta, { schemaVersion: SCHEMA_VERSION, createdAt: new Date().toISOString(), installId: cryptoId() });

    if (!get(KEYS.disciplines)) {
      const seeded = global.DISCIPLINES_SEED.map(disc => ({
        id: disc.id, nome: disc.nome, peso: disc.peso, cor: disc.cor, icon: disc.icon,
        temas: disc.temas.map(t => ({
          id: t.id, nome: t.nome, status: 'nao_iniciado', tempoEstudadoSeg: 0,
          questoes: 0, acertos: 0, erros: 0, resumo: '', flashcardsCount: 0,
          prioridade: disc.peso, dificuldade: 3,
          ultimaRevisao: null, proximaRevisao: null, revisaoEtapa: 0
        }))
      }));
      set(KEYS.disciplines, seeded);
    }
    if (!get(KEYS.sessions)) set(KEYS.sessions, []);
    if (!get(KEYS.questions)) set(KEYS.questions, []);
    if (!get(KEYS.simulados)) set(KEYS.simulados, []);
    if (!get(KEYS.reviews)) set(KEYS.reviews, []);
    if (!get(KEYS.checklist)) set(KEYS.checklist, buildChecklistFromDisciplines());
    if (!get(KEYS.gamification)) set(KEYS.gamification, { xp: 0, level: 1, streak: 0, lastStudyDate: null, badges: [] });
    if (!get(KEYS.settings)) {
      const d = new Date(); d.setDate(d.getDate() + 90);
      set(KEYS.settings, {
        theme: 'auto', examDate: d.toISOString().slice(0, 10),
        dailyGoalMinutes: 120, weeklyGoalMinutes: 720, monthlyGoalMinutes: 2880,
        dailyGoalQuestions: 30, notifications: true
      });
    }
    if (!get(KEYS.notes)) set(KEYS.notes, []);
    if (!get(KEYS.flashcards)) set(KEYS.flashcards, []);
  }

  function buildChecklistFromDisciplines() {
    const list = [];
    global.DISCIPLINES_SEED.forEach(disc => {
      disc.temas.forEach(t => list.push({ id: `chk-${t.id}`, disciplineId: disc.id, temaId: t.id, done: false, obs: '' }));
    });
    return list;
  }

  function cryptoId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function exportAll() {
    const data = { _app: 'Auditor Pro IBAM', _exportedAt: new Date().toISOString(), _schema: SCHEMA_VERSION };
    Object.values(KEYS).forEach(k => { data[k] = get(k, null); });
    return data;
  }

  function importAll(data) {
    if (!data || typeof data !== 'object') throw new Error('Arquivo inválido');
    Object.values(KEYS).forEach(k => { if (Object.prototype.hasOwnProperty.call(data, k)) set(k, data[k]); });
    return true;
  }

  function resetAll() {
    Object.values(KEYS).forEach(k => remove(k));
    ensureInitialized();
  }

  global.Storage = { KEYS, get, set, remove, ensureInitialized, exportAll, importAll, resetAll, cryptoId };
})(window);
