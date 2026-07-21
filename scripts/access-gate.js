/**
 * scripts/access-gate.js
 * -----------------------------------------------------------------------
 * Portão de acesso do app. Antes de o Auditor Pro IBAM inicializar,
 * verifica se o navegador já tem um código válido salvo. Se não tiver,
 * mostra uma tela de bloqueio pedindo o código de acesso.
 *
 * Funciona 100% no navegador (sem servidor): o código digitado é
 * transformado em hash (SHA-256) e comparado com a lista de hashes
 * válidos em data/access-codes.js. Isso evita que o código real fique
 * visível no código-fonte do site, mas não impede alguém de tentar
 * adivinhar códigos ou de compartilhar um código válido com outra
 * pessoa — não há como impedir isso sem um servidor.
 * -----------------------------------------------------------------------
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'auditorProIbam.v1.accessGranted';

  async function sha256Hex(text) {
    const enc = new TextEncoder().encode(text.trim());
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function alreadyGranted() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; }
    catch (e) { return false; }
  }

  function grantAccess() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* ignore */ }
  }

  /** Usado pela tela de Configurações para bloquear o acesso novamente neste aparelho */
  function revokeAccess() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    location.reload();
  }

  function renderGateScreen(onSuccess) {
    const splash = document.getElementById('splash');
    if (splash) splash.remove();

    const wrap = document.createElement('div');
    wrap.id = 'access-gate';
    wrap.style.cssText = `
      position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center;
      background: var(--paper-0, #0B0E14); padding: 24px;
    `;
    wrap.innerHTML = `
      <div class="card" style="max-width:360px; width:100%; text-align:center">
        <div class="seal seal--active" style="margin:0 auto 20px">${global.Icon ? global.Icon('seal') : ''}</div>
        <div class="type-title-2" style="margin-bottom:6px">Acesso restrito</div>
        <div class="type-footnote" style="margin-bottom:24px">Digite o código de acesso que você recebeu para liberar o Auditor Pro IBAM.</div>
        <div class="field" style="text-align:left">
          <input type="text" id="gate-input" placeholder="Código de acesso" autocomplete="off" autocapitalize="characters" style="text-align:center; letter-spacing:0.04em; font-weight:600" />
        </div>
        <div id="gate-error" class="type-footnote" style="color:var(--stamp-red,#B3261E); min-height:18px; margin-bottom:10px"></div>
        <button class="btn btn--gold btn--block" id="gate-submit">Desbloquear</button>
      </div>
    `;
    document.body.appendChild(wrap);

    const input = wrap.querySelector('#gate-input');
    const errorEl = wrap.querySelector('#gate-error');
    const submitBtn = wrap.querySelector('#gate-submit');
    input.focus();

    async function attempt() {
      const code = input.value.trim();
      if (!code) { errorEl.textContent = 'Digite um código.'; return; }
      if (!global.isSecureContext) {
        errorEl.textContent = 'Este navegador não suporta verificação segura. Abra pelo link https do site.';
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verificando…';
      const hash = await sha256Hex(code);
      const valid = (global.ACCESS_HASHES || []).includes(hash);
      if (valid) {
        grantAccess();
        wrap.remove();
        onSuccess();
      } else {
        errorEl.textContent = 'Código inválido. Verifique e tente novamente.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Desbloquear';
        input.select();
      }
    }

    submitBtn.onclick = attempt;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });
  }

  /** Ponto de entrada: chama onGranted() imediatamente se já houver acesso, senão mostra a tela de bloqueio */
  function init(onGranted) {
    if (alreadyGranted()) { onGranted(); return; }
    renderGateScreen(onGranted);
  }

  global.AccessGate = { init, revokeAccess };
})(window);
