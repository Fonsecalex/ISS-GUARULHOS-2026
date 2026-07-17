/**
 * scripts/gamification.js — XP, níveis, sequência (streak), conquistas.
 */
(function (global) {
  'use strict';
  const U = global.Utils;

  const XP_PER_MINUTE_STUDY = 2;
  const XP_PER_QUESTION = 1;
  const XP_PER_CORRECT_BONUS = 0.5;
  const XP_PER_SIMULADO = 60;
  const XP_PER_TEMA_CONCLUIDO = 40;
  const XP_PER_TEMA_DOMINADO = 80;

  const LEVEL_STEP = 300; // xp necessário por nível (progressivo)

  function levelFromXp(xp) {
    let level = 1, threshold = LEVEL_STEP, acc = 0;
    while (xp >= acc + threshold) { acc += threshold; level++; threshold = Math.round(threshold * 1.18); }
    return { level, xpIntoLevel: xp - acc, xpForNextLevel: threshold, xpAcc: acc };
  }

  const BADGES = [
    { id: 'primeiro-passo', label: 'Primeiro Passo', icon: 'flag', cond: g => g.xp > 0 },
    { id: 'streak-3', label: '3 Dias Seguidos', icon: 'flame', cond: g => g.streak >= 3 },
    { id: 'streak-7', label: '7 Dias Seguidos', icon: 'flame', cond: g => g.streak >= 7 },
    { id: 'streak-30', label: '30 Dias Seguidos', icon: 'flame', cond: g => g.streak >= 30 },
    { id: 'nivel-5', label: 'Nível 5', icon: 'star', cond: g => levelFromXp(g.xp).level >= 5 },
    { id: 'nivel-10', label: 'Nível 10', icon: 'trophy', cond: g => levelFromXp(g.xp).level >= 10 },
    { id: 'cem-questoes', label: '100 Questões', icon: 'target', cond: () => global.State.allQuestionStats().total >= 100 },
    { id: 'mil-questoes', label: '1.000 Questões', icon: 'target', cond: () => global.State.allQuestionStats().total >= 1000 },
    { id: 'dez-horas', label: '10h de Estudo', icon: 'timer', cond: () => global.State.totalSecondsAll() >= 10 * 3600 },
    { id: 'cem-horas', label: '100h de Estudo', icon: 'timer', cond: () => global.State.totalSecondsAll() >= 100 * 3600 },
    { id: 'primeiro-simulado', label: 'Primeiro Simulado', icon: 'checklist', cond: () => (global.State.raw().simulados || []).length >= 1 },
    { id: 'tema-dominado', label: 'Tema Dominado', icon: 'seal', cond: () => global.State.getDisciplines().some(d => d.temas.some(t => t.status === 'dominado')) },
    { id: 'edital-25', label: '25% do Edital', icon: 'chart', cond: () => global.State.editalProgress().pct >= 25 },
    { id: 'edital-50', label: '50% do Edital', icon: 'chart', cond: () => global.State.editalProgress().pct >= 50 },
    { id: 'edital-100', label: 'Edital Completo', icon: 'trophy', cond: () => global.State.editalProgress().pct >= 100 }
  ];

  function gam() { return global.State.raw().gamification; }

  function addXp(amount) {
    const g = gam();
    g.xp = Math.round((g.xp + amount) * 10) / 10;
    checkBadges();
    global.State.persist('gamification');
  }

  function registerStudy(seconds) {
    updateStreak();
    addXp((seconds / 60) * XP_PER_MINUTE_STUDY);
  }

  function registerQuestions(qty, acertos) {
    addXp(qty * XP_PER_QUESTION + acertos * XP_PER_CORRECT_BONUS);
  }

  function registerSimulado() { addXp(XP_PER_SIMULADO); }

  function registerTemaStatus(status) {
    if (status === 'concluido') addXp(XP_PER_TEMA_CONCLUIDO);
    if (status === 'dominado') addXp(XP_PER_TEMA_DOMINADO);
  }

  function updateStreak() {
    const g = gam();
    const today = U.todayISO();
    if (g.lastStudyDate === today) return;
    if (g.lastStudyDate && U.daysBetween(g.lastStudyDate, today) === 1) g.streak += 1;
    else g.streak = 1;
    g.lastStudyDate = today;
    global.State.persist('gamification');
  }

  function checkBadges() {
    const g = gam();
    g.badges = g.badges || [];
    let newlyUnlocked = null;
    BADGES.forEach(b => {
      if (!g.badges.includes(b.id) && b.cond(g)) {
        g.badges.push(b.id);
        newlyUnlocked = b;
      }
    });
    if (newlyUnlocked) {
      global.UI && global.UI.toast(`Conquista desbloqueada: ${newlyUnlocked.label}`, 'success');
    }
  }

  function summary() {
    const g = gam();
    const lvl = levelFromXp(g.xp);
    return { xp: g.xp, streak: g.streak, level: lvl.level, xpIntoLevel: lvl.xpIntoLevel, xpForNextLevel: lvl.xpForNextLevel, badges: g.badges || [] };
  }

  global.Gamification = { BADGES, levelFromXp, addXp, registerStudy, registerQuestions, registerSimulado, registerTemaStatus, updateStreak, checkBadges, summary };
})(window);
