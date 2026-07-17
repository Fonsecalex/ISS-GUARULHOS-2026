/**
 * scripts/scheduler.js — algoritmo do Cronograma Inteligente
 * Pontua cada tema por urgência (peso da disciplina, dias sem estudar,
 * dias sem revisar, taxa de erro, dificuldade, proximidade da prova)
 * e monta o plano diário alocando o tempo disponível em blocos.
 */
(function (global) {
  'use strict';
  const U = global.Utils;

  const WEIGHTS = { peso: 3.0, diasSemEstudar: 1.4, diasSemRevisar: 2.2, taxaErro: 2.6, dificuldade: 1.1, statusBonus: 1.0 };

  function daysSinceStudied(tema) {
    if (!tema.ultimaRevisao && tema.tempoEstudadoSeg === 0) return 30;
    if (!tema.ultimaRevisao) return 14;
    return U.clamp(U.daysBetween(tema.ultimaRevisao, U.todayISO()), 0, 120);
  }
  function daysOverdueForReview(tema) {
    if (!tema.proximaRevisao) return 0;
    const d = U.daysBetween(tema.proximaRevisao, U.todayISO());
    return d > 0 ? d : 0;
  }
  function examProximityFactor(daysUntilExam) {
    if (daysUntilExam === null || daysUntilExam === undefined) return 1;
    if (daysUntilExam <= 7) return 1.9;
    if (daysUntilExam <= 30) return 1.5;
    if (daysUntilExam <= 60) return 1.2;
    return 1;
  }

  function scoreTema(disc, tema, examFactor) {
    const errRate = tema.questoes > 0 ? tema.erros / tema.questoes : 0.15;
    const statusBonus = { nao_iniciado: 1.0, em_andamento: 0.6, concluido: 0.25, dominado: 0.05 }[tema.status] || 0.5;
    let score = 0;
    score += disc.peso * WEIGHTS.peso;
    score += Math.min(30, daysSinceStudied(tema)) * WEIGHTS.diasSemEstudar;
    score += Math.min(30, daysOverdueForReview(tema)) * WEIGHTS.diasSemRevisar;
    score += (tema.dificuldade || 3) * WEIGHTS.dificuldade;
    score += errRate * 100 * WEIGHTS.taxaErro / 10;
    score += statusBonus * 10 * WEIGHTS.statusBonus;
    score *= examFactor;
    return Math.round(score * 10) / 10;
  }

  function rankAllTemas() {
    const disciplines = global.State.getDisciplines();
    const examFactor = examProximityFactor(global.State.daysUntilExam());
    const ranked = [];
    disciplines.forEach(disc => disc.temas.forEach(tema => ranked.push({ disc, tema, score: scoreTema(disc, tema, examFactor) })));
    ranked.sort((a, b) => b.score - a.score);
    return ranked;
  }

  function buildDailyPlan(availableMinutes) {
    availableMinutes = availableMinutes || global.State.getSettings().dailyGoalMinutes || 120;
    const ranked = rankAllTemas();
    const plan = [];
    let remaining = availableMinutes;
    let cursorMinutes = 8 * 60;
    const overdue = ranked.filter(r => daysOverdueForReview(r.tema) > 0);
    const rest = ranked.filter(r => daysOverdueForReview(r.tema) === 0);
    const ordered = [...overdue, ...rest];
    for (const item of ordered) {
      if (remaining < 20) break;
      const block = remaining >= 50 ? 50 : (remaining >= 25 ? 25 : remaining);
      plan.push({ disc: item.disc, tema: item.tema, minutos: block, horario: minutesToClock(cursorMinutes), isRevisao: daysOverdueForReview(item.tema) > 0, score: item.score });
      cursorMinutes += block + 10;
      remaining -= block;
      if (plan.length >= 8) break;
    }
    return plan;
  }

  function minutesToClock(totalMin) {
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    return `${U.pad(h)}:${U.pad(m)}`;
  }

  function nextSuggestedTema() { const ranked = rankAllTemas(); return ranked.length ? ranked[0] : null; }

  global.Scheduler = { rankAllTemas, buildDailyPlan, nextSuggestedTema, scoreTema, examProximityFactor };
})(window);
