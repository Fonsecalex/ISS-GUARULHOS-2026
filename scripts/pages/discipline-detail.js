/**
 * scripts/pages/discipline-detail.js — Lista de temas de uma disciplina e
 * sheet de detalhe do tema (status, resumo, flashcards, notas, dificuldade).
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;

  function sealClassFor(status) {
    return { nao_iniciado: 'seal--pending', em_andamento: 'seal--active', concluido: 'seal--done', dominado: 'seal--mastered' }[status] || 'seal--pending';
  }
  function sealIconFor(status) {
    return status === 'dominado' ? 'star' : status === 'concluido' ? 'check' : status === 'em_andamento' ? 'timer' : 'clock';
  }

  function render(container, params) {
    const S = global.State;
    const disc = S.getDiscipline(params[0]);
    if (!disc) { container.innerHTML = `<div class="empty-state">Disciplina não encontrada.</div>`; return; }
    global.Router.setHeaderTitle(disc.nome, 'DISCIPLINA');

    const prog = S.disciplineProgress(disc);

    container.innerHTML = `
      <a href="#/disciplines" class="type-footnote text-blue flex items-center gap-1" style="margin-bottom:16px;display:inline-flex">${Icon('chevron-left')} Disciplinas</a>
      <div class="card" style="margin-bottom:20px">
        <div class="flex items-center gap-3" style="margin-bottom:14px">
          <div class="discipline-tile__icon" style="background:${disc.cor}">${Icon(disc.icon)}</div>
          <div class="grow">
            <div class="type-title-2">${U.escapeHtml(disc.nome)}</div>
            <div class="type-footnote">${prog.concluidos}/${prog.total} temas concluídos</div>
          </div>
        </div>
        <div class="progress"><div class="progress__fill" style="width:${prog.pct}%;background:${disc.cor}"></div></div>
        <div class="metrics-grid" style="margin-top:16px">
          <div class="metric"><span class="metric__value">${U.fmtDuration(prog.tempo)}</span><span class="metric__label">Tempo estudado</span></div>
          <div class="metric"><span class="metric__value">${prog.taxa}%</span><span class="metric__label">Acerto (${prog.questoes} questões)</span></div>
        </div>
      </div>

      <div class="section__head"><div class="type-title-2">Temas</div></div>
      <div class="card card--flat" id="tema-list"></div>
    `;

    const list = document.getElementById('tema-list');
    disc.temas.forEach(tema => {
      const row = document.createElement('div');
      row.className = 'tema-row';
      row.innerHTML = `
        <div class="seal ${sealClassFor(tema.status)}" style="width:36px;height:36px">${Icon(sealIconFor(tema.status))}</div>
        <div class="tema-row__body">
          <div class="tema-row__title">${U.escapeHtml(tema.nome)}</div>
          <div class="tema-row__meta">${U.STATUS_LABEL[tema.status]} · ${U.fmtDuration(tema.tempoEstudadoSeg)}${tema.proximaRevisao ? ' · Revisão ' + U.fmtDateShort(tema.proximaRevisao) : ''}</div>
        </div>
        <div class="list-row__chevron">${Icon('chevron-right')}</div>
      `;
      row.onclick = () => openTemaSheet(disc.id, tema.id);
      list.appendChild(row);
    });
  }

  function openTemaSheet(discId, temaId) {
    const S = global.State;
    const disc = S.getDiscipline(discId);
    const tema = S.getTema(discId, temaId);
    if (!tema) return;

    const wrap = document.createElement('div');
    renderSheetContent(wrap, disc, tema);
    global.UI.openSheet(wrap);
  }

  function renderSheetContent(wrap, disc, tema) {
    const notes = global.State.notesFor(tema.id);
    const flashcards = global.State.flashcardsFor(tema.id);

    wrap.innerHTML = `
      <div class="sheet__title">
        <div class="type-caption">${U.escapeHtml(disc.nome)}</div>
        <div class="type-title-2">${U.escapeHtml(tema.nome)}</div>
      </div>

      <div class="segmented" id="seg-status" style="margin-bottom:18px">
        ${U.STATUS_ORDER.map(s => `<button data-status="${s}" class="${tema.status === s ? 'is-active' : ''}">${U.STATUS_LABEL[s]}</button>`).join('')}
      </div>

      <button class="btn btn--gold btn--block" id="btn-start-focus" style="margin-bottom:20px">${Icon('play')} Iniciar sessão de estudo</button>

      <div class="card-grid" style="margin-bottom:18px">
        <div class="metric"><span class="metric__value">${tema.questoes}</span><span class="metric__label">Questões</span></div>
        <div class="metric"><span class="metric__value">${U.pct(tema.acertos, tema.questoes)}%</span><span class="metric__label">Acerto</span></div>
      </div>

      <div class="field">
        <label>Dificuldade percebida</label>
        <div class="flex gap-2" id="dificuldade-stars">
          ${[1,2,3,4,5].map(n => `<button data-n="${n}" style="opacity:${n<=tema.dificuldade?1:0.3}">${Icon('star', { fill: 'currentColor' })}</button>`).join('')}
        </div>
      </div>

      <div class="field">
        <label>Resumo</label>
        <textarea id="inp-resumo" placeholder="Anote os pontos-chave deste tema...">${U.escapeHtml(tema.resumo || '')}</textarea>
      </div>
      <button class="btn btn--ghost btn--block" id="btn-save-resumo" style="margin-bottom:20px">Salvar resumo</button>

      <div class="section__head">
        <div class="type-headline">Flashcards (${flashcards.length})</div>
        <button class="section__link" id="btn-add-flashcard">+ Adicionar</button>
      </div>
      <div id="flashcard-list" style="margin-bottom:20px">
        ${flashcards.map(f => `
          <div class="list-row" data-fc="${f.id}">
            <div class="list-row__body">
              <div class="list-row__title">${U.escapeHtml(f.frente)}</div>
              <div class="list-row__meta">${U.escapeHtml(f.verso)}</div>
            </div>
            <button class="icon-btn btn-del-fc" data-id="${f.id}">${Icon('trash')}</button>
          </div>
        `).join('') || `<div class="type-footnote">Nenhum flashcard ainda.</div>`}
      </div>

      <div class="section__head">
        <div class="type-headline">Notas (${notes.length})</div>
        <button class="section__link" id="btn-add-note">+ Adicionar</button>
      </div>
      <div id="note-list">
        ${notes.map(n => `
          <div class="list-row" data-note="${n.id}">
            <div class="list-row__body">
              <div class="list-row__title">${U.escapeHtml(n.texto)}</div>
              <div class="list-row__meta">${U.fmtDateShort(n.criadoEm)}</div>
            </div>
            <button class="icon-btn btn-del-note" data-id="${n.id}">${Icon('trash')}</button>
          </div>
        `).join('') || `<div class="type-footnote">Nenhuma nota ainda.</div>`}
      </div>
    `;

    wrap.querySelectorAll('#seg-status button').forEach(btn => {
      btn.onclick = () => {
        global.State.setTemaStatus(disc.id, tema.id, btn.dataset.status);
        global.UI.toast('Status atualizado', 'success');
        renderSheetContent(wrap, disc, global.State.getTema(disc.id, tema.id));
        global.Router.render();
      };
    });

    wrap.querySelector('#btn-start-focus').onclick = () => { global.UI.closeSheet(); global.Pages.focus.open(disc.id, tema.id); };

    wrap.querySelectorAll('#dificuldade-stars button').forEach(btn => {
      btn.onclick = () => {
        global.State.updateTema(disc.id, tema.id, { dificuldade: parseInt(btn.dataset.n, 10) });
        renderSheetContent(wrap, disc, global.State.getTema(disc.id, tema.id));
      };
    });

    wrap.querySelector('#btn-save-resumo').onclick = () => {
      global.State.updateTema(disc.id, tema.id, { resumo: wrap.querySelector('#inp-resumo').value });
      global.UI.toast('Resumo salvo', 'success');
    };

    wrap.querySelector('#btn-add-flashcard').onclick = () => {
      const frente = prompt('Frente do flashcard (pergunta):');
      if (!frente) return;
      const verso = prompt('Verso do flashcard (resposta):') || '';
      global.State.addFlashcard({ id: U.uid('fc'), temaId: tema.id, frente, verso, criadoEm: new Date().toISOString() });
      renderSheetContent(wrap, disc, global.State.getTema(disc.id, tema.id));
    };
    wrap.querySelectorAll('.btn-del-fc').forEach(btn => {
      btn.onclick = () => { global.State.deleteFlashcard(btn.dataset.id); renderSheetContent(wrap, disc, global.State.getTema(disc.id, tema.id)); };
    });

    wrap.querySelector('#btn-add-note').onclick = () => {
      const texto = prompt('Nova nota:');
      if (!texto) return;
      global.State.addNote({ id: U.uid('note'), temaId: tema.id, texto, criadoEm: new Date().toISOString() });
      renderSheetContent(wrap, disc, global.State.getTema(disc.id, tema.id));
    };
    wrap.querySelectorAll('.btn-del-note').forEach(btn => {
      btn.onclick = () => { global.State.deleteNote(btn.dataset.id); renderSheetContent(wrap, disc, global.State.getTema(disc.id, tema.id)); };
    });
  }

  global.Pages = global.Pages || {};
  global.Pages.discipline = { render };
})(window);
