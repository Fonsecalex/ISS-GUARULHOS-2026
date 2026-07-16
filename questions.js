/** scripts/utils.js — funções utilitárias puras */
(function (global) {
  'use strict';
  function pad(n) { return String(n).padStart(2, '0'); }

  function fmtDuration(totalSeconds) {
    totalSeconds = Math.max(0, Math.round(totalSeconds || 0));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${pad(m)}min`;
    if (m > 0) return `${m}min ${pad(s)}s`;
    return `${s}s`;
  }

  function fmtClock(totalSeconds) {
    totalSeconds = Math.max(0, Math.round(totalSeconds || 0));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  function fmtDateShort(iso) { if (!iso) return '—'; return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); }
  function fmtDateFull(iso) { if (!iso) return '—'; return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function daysBetween(a, b) {
    const A = new Date(a); const B = new Date(b);
    A.setHours(0,0,0,0); B.setHours(0,0,0,0);
    return Math.round((B - A) / 86400000);
  }
  function addDays(iso, n) { const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function pct(part, total) { return total > 0 ? clamp(Math.round((part / total) * 100), 0, 100) : 0; }
  function uid(prefix) { return `${prefix || 'id'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (v !== null && v !== undefined) node.setAttribute(k, v);
      });
    }
    (children || []).forEach(c => {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function debounce(fn, wait) {
    let t;
    return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function starRow(count, max) {
    max = max || 5;
    let html = '<span class="stars">';
    for (let i = 1; i <= max; i++) html += global.Icon('star', { fill: i <= count ? 'currentColor' : 'none', weight: 1.6 });
    return html + '</span>';
  }

  const STATUS_LABEL = { nao_iniciado: 'Não iniciado', em_andamento: 'Em andamento', concluido: 'Concluído', dominado: 'Dominado' };
  const STATUS_ORDER = ['nao_iniciado', 'em_andamento', 'concluido', 'dominado'];

  global.Utils = { fmtDuration, fmtClock, fmtDateShort, fmtDateFull, todayISO, daysBetween, addDays, clamp, pct, uid, el, debounce, escapeHtml, starRow, STATUS_LABEL, STATUS_ORDER, pad };
})(window);
