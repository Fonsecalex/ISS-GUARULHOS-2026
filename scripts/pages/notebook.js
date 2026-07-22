/**
 * scripts/pages/notebook.js — Caderno: anotações em tempo real (texto e
 * áudio) enquanto o usuário estuda. Notas podem ser gerais ou vinculadas
 * a um tema específico (quando criadas a partir do Modo Foco).
 *
 * Áudio: gravado via MediaRecorder (microfone do navegador) e guardado
 * no IndexedDB local (ver scripts/notebook-db.js) — nunca sai do
 * aparelho. Não é incluído no backup JSON (ver aviso na própria tela).
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;

  // Player de áudio único ativo por vez (evita sobrepor reproduções)
  let activeAudio = null; // { el, btn, clipId }

  function pickMimeType() {
    const candidates = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
    for (const c of candidates) {
      if (global.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) return c;
    }
    return '';
  }

  // ---------------------------------------------------------------------
  // Composer (caixa de "nova nota") — reutilizado na página principal e
  // no sheet rápido acionado a partir do Modo Foco.
  // ---------------------------------------------------------------------
  function buildComposer(target, opts) {
    opts = opts || {};
    const supported = global.NotebookDB && global.NotebookDB.isSupported();

    target.innerHTML = `
      <div class="card" style="margin-bottom:20px">
        ${opts.temaId ? `<div class="type-caption" style="margin-bottom:8px">ANOTANDO EM: ${U.escapeHtml(opts.temaNome || '')}</div>` : ''}
        <textarea id="composer-text" placeholder="O que você está estudando agora?" rows="3"
          style="width:100%;background:var(--paper-1);border:1px solid var(--glass-border);border-radius:var(--r-md);padding:12px 14px;font-size:15px;resize:vertical"></textarea>
        <div id="composer-audio-area" style="margin-top:10px"></div>
        <div class="flex items-center justify-between" style="margin-top:12px">
          <button class="icon-btn ${supported ? '' : 'hidden'}" id="composer-mic-btn" aria-label="Gravar áudio">${Icon('mic')}</button>
          <button class="btn btn--primary btn--sm" id="composer-save-btn">Salvar nota</button>
        </div>
        ${supported ? '' : '<div class="type-footnote" style="margin-top:8px">Gravação de áudio não é suportada neste navegador.</div>'}
      </div>
    `;

    const textEl = target.querySelector('#composer-text');
    const micBtn = target.querySelector('#composer-mic-btn');
    const audioArea = target.querySelector('#composer-audio-area');
    const saveBtn = target.querySelector('#composer-save-btn');

    let mediaRecorder = null, mediaStream = null, mediaChunks = [];
    let recordStartTs = null, recordTimerId = null;
    let pendingClipId = null, pendingDurationSec = 0;

    function renderIdle() { audioArea.innerHTML = ''; }

    function renderRecording(seconds) {
      audioArea.innerHTML = `
        <div class="flex items-center gap-2" style="padding:8px 0">
          <span class="rec-dot"></span>
          <span class="type-footnote text-red type-ledger">Gravando ${U.fmtClock(seconds)}</span>
          <button class="btn btn--ghost btn--sm" id="composer-stop-btn" style="margin-left:auto">${Icon('stop')} Parar</button>
        </div>
      `;
      audioArea.querySelector('#composer-stop-btn').onclick = stopRecording;
    }

    function renderRecorded(durationSec) {
      audioArea.innerHTML = `
        <div class="flex items-center gap-2" style="padding:8px 0">
          ${Icon('mic')}
          <span class="type-footnote">Áudio gravado · ${U.fmtClock(durationSec)}</span>
          <button class="chip" id="composer-discard-btn" style="margin-left:auto">Descartar</button>
        </div>
      `;
      audioArea.querySelector('#composer-discard-btn').onclick = discardRecording;
    }

    async function startRecording() {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        global.UI.toast('Permissão de microfone negada', 'error');
        return;
      }
      const mimeType = pickMimeType();
      try {
        mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);
      } catch (e) {
        global.UI.toast('Não foi possível iniciar a gravação', 'error');
        mediaStream.getTracks().forEach(t => t.stop());
        return;
      }
      mediaChunks = [];
      mediaRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) mediaChunks.push(e.data); };
      mediaRecorder.start();
      recordStartTs = Date.now();
      micBtn.classList.add('hidden');
      renderRecording(0);
      recordTimerId = setInterval(() => renderRecording(Math.floor((Date.now() - recordStartTs) / 1000)), 500);
    }

    function stopRecording() {
      if (!mediaRecorder) return;
      clearInterval(recordTimerId);
      mediaRecorder.onstop = async () => {
        const durationSec = Math.max(1, Math.round((Date.now() - recordStartTs) / 1000));
        const blob = new Blob(mediaChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        mediaStream.getTracks().forEach(t => t.stop());
        mediaRecorder = null; mediaStream = null;

        pendingClipId = U.uid('clip');
        pendingDurationSec = durationSec;
        try {
          await global.NotebookDB.saveClip(pendingClipId, blob);
          renderRecorded(durationSec);
        } catch (e) {
          global.UI.toast('Não foi possível salvar o áudio', 'error');
          pendingClipId = null;
          renderIdle();
        }
        micBtn.classList.remove('hidden');
      };
      mediaRecorder.stop();
    }

    function discardRecording() {
      if (pendingClipId) global.NotebookDB.deleteClip(pendingClipId).catch(() => {});
      pendingClipId = null; pendingDurationSec = 0;
      renderIdle();
    }

    micBtn.onclick = startRecording;

    saveBtn.onclick = () => {
      const texto = textEl.value.trim();
      if (!texto && !pendingClipId) { global.UI.toast('Escreva algo ou grave um áudio', 'error'); return; }
      const note = {
        id: U.uid('note'),
        temaId: opts.temaId || null,
        texto,
        audioClipId: pendingClipId,
        audioDurationSec: pendingClipId ? pendingDurationSec : 0,
        criadoEm: new Date().toISOString()
      };
      global.State.addNote(note);
      textEl.value = '';
      pendingClipId = null; pendingDurationSec = 0;
      renderIdle();
      global.UI.toast('Nota salva', 'success');
      opts.onSaved && opts.onSaved(note);
    };
  }

  // ---------------------------------------------------------------------
  // Lista de notas
  // ---------------------------------------------------------------------
  function fmtNoteTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const hoje = U.todayISO();
    const dia = iso.slice(0, 10);
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (dia === hoje) return `Hoje, ${hora}`;
    return `${U.fmtDateShort(iso)}, ${hora}`;
  }

  // Cache de URLs de áudio já carregadas do IndexedDB nesta sessão, para que o
  // toque em "play" chame audioEl.play() o mais próximo possível do gesto do
  // usuário — o Safari pode rejeitar silenciosamente a reprodução se ela for
  // disparada depois de uma operação assíncrona (como ler do IndexedDB).
  const audioUrlCache = new Map(); // clipId -> Object URL

  async function prefetchAudioUrl(clipId) {
    if (audioUrlCache.has(clipId)) return audioUrlCache.get(clipId);
    try {
      const blob = await global.NotebookDB.getClip(clipId);
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      audioUrlCache.set(clipId, url);
      return url;
    } catch (e) { return null; }
  }

  function playFromUrl(clipId, url, btn) {
    const audioEl = new Audio(url);
    btn.innerHTML = Icon('pause');
    activeAudio = { el: audioEl, btn, clipId };
    const playPromise = audioEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(err => {
        console.error('Falha ao reproduzir áudio', err);
        btn.innerHTML = Icon('play');
        global.UI.toast('Não foi possível reproduzir. Toque novamente.', 'error');
        activeAudio = null;
      });
    }
    audioEl.onended = () => { btn.innerHTML = Icon('play'); activeAudio = null; };
    audioEl.onpause = () => { if (activeAudio && activeAudio.clipId === clipId) { btn.innerHTML = Icon('play'); activeAudio = null; } };
  }

  function togglePlay(clipId, btn) {
    if (activeAudio && activeAudio.clipId === clipId) {
      activeAudio.el.pause();
      return;
    }
    if (activeAudio) activeAudio.el.pause();

    const cachedUrl = audioUrlCache.get(clipId);
    if (cachedUrl) {
      playFromUrl(clipId, cachedUrl, btn); // toque -> play() quase imediato, preserva o gesto do usuário
      return;
    }
    // Raro: toque muito rápido antes do pré-carregamento terminar
    btn.style.opacity = '0.5';
    prefetchAudioUrl(clipId).then(url => {
      btn.style.opacity = '';
      if (!url) { global.UI.toast('Áudio não encontrado neste aparelho', 'error'); return; }
      playFromUrl(clipId, url, btn);
    });
  }

  function renderNoteRow(note) {
    const found = note.temaId ? global.State.findTemaGlobal(note.temaId) : null;
    const row = document.createElement('div');
    row.className = 'list-row';
    row.style.alignItems = 'flex-start';
    row.innerHTML = `
      <div class="list-row__body">
        ${found ? `<div class="chip chip--blue" style="margin-bottom:6px">${U.escapeHtml(found.tema.nome)}</div>` : ''}
        ${note.texto ? `<div class="type-body">${U.escapeHtml(note.texto)}</div>` : ''}
        ${note.audioClipId ? `
          <div class="flex items-center gap-2" style="margin-top:8px">
            <button class="icon-btn btn-play-audio" data-id="${note.audioClipId}">${Icon('play')}</button>
            <span class="type-footnote">${U.fmtClock(note.audioDurationSec || 0)}</span>
          </div>` : ''}
        <div class="type-footnote" style="margin-top:6px">${fmtNoteTime(note.criadoEm)}</div>
      </div>
      <button class="icon-btn btn-delete-note" data-id="${note.id}" aria-label="Excluir">${Icon('trash')}</button>
    `;
    row.querySelector('.btn-delete-note').onclick = () => confirmDelete(note);
    const playBtn = row.querySelector('.btn-play-audio');
    if (playBtn) playBtn.onclick = () => togglePlay(note.audioClipId, playBtn);
    return row;
  }

  function confirmDelete(note) {
    global.UI.confirmDialog({
      title: 'Excluir nota?',
      message: note.audioClipId ? 'O áudio gravado também será apagado deste aparelho.' : 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir', danger: true,
      onConfirm: async () => {
        if (note.audioClipId) {
          try { await global.NotebookDB.deleteClip(note.audioClipId); } catch (e) {}
          const cachedUrl = audioUrlCache.get(note.audioClipId);
          if (cachedUrl) { URL.revokeObjectURL(cachedUrl); audioUrlCache.delete(note.audioClipId); }
        }
        global.State.deleteNote(note.id);
        global.UI.toast('Nota excluída', 'success');
        global.Router.render();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Página principal
  // ---------------------------------------------------------------------
  function render(container) {
    global.Router.setHeaderTitle('Caderno');
    container.innerHTML = `
      <div id="composer-target"></div>
      <div class="type-footnote text-ink-2" style="margin-bottom:16px">Áudios ficam salvos apenas neste aparelho e não entram no backup JSON.</div>
      <div id="notes-list"></div>
    `;
    buildComposer(document.getElementById('composer-target'), { onSaved: () => global.Router.render() });

    const notes = global.State.allNotes();
    const list = document.getElementById('notes-list');
    if (!notes.length) {
      list.innerHTML = `<div class="empty-state">${Icon('notebook')}<div class="type-body">Nenhuma anotação ainda. Escreva algo acima para começar.</div></div>`;
      return;
    }
    notes.forEach(n => list.appendChild(renderNoteRow(n)));
    notes.forEach(n => { if (n.audioClipId) prefetchAudioUrl(n.audioClipId); });
  }

  /** Sheet rápido de anotação, acionado a partir do Modo Foco — já vinculado ao tema em estudo */
  function openQuickNoteSheet(disciplineId, temaId) {
    const found = temaId ? global.State.getTema(disciplineId, temaId) : null;
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="sheet__title type-title-2">Nota rápida</div><div id="quick-composer-target"></div>`;
    global.UI.openSheet(wrap);
    buildComposer(wrap.querySelector('#quick-composer-target'), {
      temaId, temaNome: found ? found.nome : '',
      onSaved: () => global.UI.closeSheet()
    });
  }

  global.Pages = global.Pages || {};
  global.Pages.notebook = { render, openQuickNoteSheet };
})(window);
