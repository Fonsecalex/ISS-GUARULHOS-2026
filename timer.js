/**
 * scripts/ui.js — utilidades de interface: toasts, sheets, modais, menus
 * contextuais, swipe-to-reveal e pull-to-refresh. Não conhece regras de
 * negócio — apenas manipula o DOM.
 */
(function (global) {
  'use strict';
  const Icon = global.Icon;

  // ---------------- Toast ----------------
  let toastWrap;
  function ensureToastWrap() {
    if (!toastWrap) {
      toastWrap = document.createElement('div');
      toastWrap.className = 'toast-wrap';
      document.body.appendChild(toastWrap);
    }
    return toastWrap;
  }
  function toast(msg, kind) {
    const wrap = ensureToastWrap();
    const t = document.createElement('div');
    t.className = 'toast';
    const iconName = kind === 'error' ? 'close' : kind === 'warn' ? 'bell' : 'check';
    t.innerHTML = `${Icon(iconName)}<span>${global.Utils.escapeHtml(msg)}</span>`;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('is-visible'));
    setTimeout(() => { t.classList.remove('is-visible'); setTimeout(() => t.remove(), 300); }, 2600);
  }

  // ---------------- Bottom Sheet ----------------
  let sheetOverlay, sheetBody;
  function ensureSheet() {
    if (!sheetOverlay) {
      sheetOverlay = document.createElement('div');
      sheetOverlay.className = 'sheet-overlay';
      sheetOverlay.innerHTML = `<div class="sheet"><div class="sheet__handle"></div><div class="sheet__content"></div></div>`;
      document.body.appendChild(sheetOverlay);
      sheetBody = sheetOverlay.querySelector('.sheet__content');
      sheetOverlay.addEventListener('click', e => { if (e.target === sheetOverlay) closeSheet(); });
      let startY = null;
      const sheetEl = sheetOverlay.querySelector('.sheet');
      sheetEl.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
      sheetEl.addEventListener('touchmove', e => {
        if (startY === null) return;
        const dy = e.touches[0].clientY - startY;
        if (dy > 0 && sheetEl.scrollTop <= 0) sheetEl.style.transform = `translateY(${dy}px)`;
      }, { passive: true });
      sheetEl.addEventListener('touchend', e => {
        const dy = e.changedTouches[0].clientY - (startY || 0);
        sheetEl.style.transform = '';
        if (dy > 90) closeSheet();
        startY = null;
      });
    }
    return sheetBody;
  }
  function openSheet(contentNodeOrHtml) {
    const body = ensureSheet();
    body.innerHTML = '';
    if (typeof contentNodeOrHtml === 'string') body.innerHTML = contentNodeOrHtml;
    else body.appendChild(contentNodeOrHtml);
    sheetOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    if (sheetOverlay) sheetOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // ---------------- Modal central ----------------
  let modalOverlay;
  function ensureModal() {
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';
      modalOverlay.innerHTML = `<div class="modal"></div>`;
      document.body.appendChild(modalOverlay);
      modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
    }
    return modalOverlay.querySelector('.modal');
  }
  function closeModal() { if (modalOverlay) modalOverlay.classList.remove('is-open'); }

  function confirmDialog({ title, message, confirmLabel, danger, onConfirm }) {
    const modal = ensureModal();
    modal.innerHTML = `
      <div class="type-title-2" style="margin-bottom:8px">${global.Utils.escapeHtml(title || 'Confirmar')}</div>
      <div class="type-body text-ink-1">${global.Utils.escapeHtml(message || '')}</div>
      <div class="modal__actions">
        <button class="btn btn--ghost btn--block" data-act="cancel">Cancelar</button>
        <button class="btn ${danger ? 'btn--danger' : 'btn--primary'} btn--block" data-act="ok">${global.Utils.escapeHtml(confirmLabel || 'Confirmar')}</button>
      </div>`;
    modal.querySelector('[data-act="cancel"]').onclick = closeModal;
    modal.querySelector('[data-act="ok"]').onclick = () => { closeModal(); onConfirm && onConfirm(); };
    modalOverlay.classList.add('is-open');
  }

  // ---------------- Menu contextual ----------------
  let ctxMenuEl;
  function ensureCtxMenu() {
    if (!ctxMenuEl) {
      ctxMenuEl = document.createElement('div');
      ctxMenuEl.className = 'ctx-menu';
      document.body.appendChild(ctxMenuEl);
      document.addEventListener('click', e => {
        if (ctxMenuEl.classList.contains('is-open') && !ctxMenuEl.contains(e.target)) closeCtxMenu();
      });
    }
    return ctxMenuEl;
  }
  function openCtxMenu(x, y, items) {
    const menu = ensureCtxMenu();
    menu.innerHTML = items.map((it, i) =>
      `<button class="ctx-menu__item ${it.danger ? 'is-danger' : ''}" data-i="${i}">${Icon(it.icon || 'dots')}<span>${global.Utils.escapeHtml(it.label)}</span></button>`
    ).join('');
    const vw = window.innerWidth, vh = window.innerHeight;
    menu.style.left = Math.min(x, vw - 210) + 'px';
    menu.style.top = Math.min(y, vh - items.length * 44 - 20) + 'px';
    items.forEach((it, i) => { menu.querySelector(`[data-i="${i}"]`).onclick = () => { closeCtxMenu(); it.action(); }; });
    requestAnimationFrame(() => menu.classList.add('is-open'));
  }
  function closeCtxMenu() { if (ctxMenuEl) ctxMenuEl.classList.remove('is-open'); }

  // ---------------- Swipe-to-reveal ----------------
  function enableSwipe(rowEl, surfaceEl) {
    let startX = 0, currentX = 0, dragging = false;
    const MAX = 148;
    surfaceEl.addEventListener('touchstart', e => { startX = e.touches[0].clientX; dragging = true; }, { passive: true });
    surfaceEl.addEventListener('touchmove', e => {
      if (!dragging) return;
      currentX = e.touches[0].clientX - startX;
      currentX = Math.max(-MAX, Math.min(0, currentX));
      surfaceEl.style.transform = `translateX(${currentX}px)`;
    }, { passive: true });
    surfaceEl.addEventListener('touchend', () => {
      dragging = false;
      surfaceEl.style.transform = currentX < -MAX / 2 ? `translateX(-${MAX}px)` : 'translateX(0)';
      currentX = 0;
    });
  }

  // ---------------- Pull to refresh ----------------
  function enablePullToRefresh(scrollContainer, indicatorEl, onRefresh) {
    let startY = null, pulling = false;
    scrollContainer.addEventListener('touchstart', e => {
      if (scrollContainer.scrollTop <= 0) startY = e.touches[0].clientY;
    }, { passive: true });
    scrollContainer.addEventListener('touchmove', e => {
      if (startY === null) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        pulling = true;
        const h = Math.min(64, dy * 0.5);
        indicatorEl.style.height = h + 'px';
        indicatorEl.querySelector('svg').style.transform = `rotate(${Math.min(180, dy)}deg)`;
      }
    }, { passive: true });
    scrollContainer.addEventListener('touchend', () => {
      if (pulling && parseInt(indicatorEl.style.height || '0') > 50) onRefresh();
      indicatorEl.style.height = '0px';
      startY = null; pulling = false;
    });
  }

  global.UI = { toast, openSheet, closeSheet, confirmDialog, closeModal, openCtxMenu, closeCtxMenu, enableSwipe, enablePullToRefresh };
})(window);
