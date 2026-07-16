/**
 * scripts/pages/settings.js — Configurações: metas, data da prova, tema, backup.
 */
(function (global) {
  'use strict';
  const U = global.Utils, Icon = global.Icon;

  function render(container) {
    global.Router.setHeaderTitle('Configurações');
    const S = global.State;
    const settings = S.getSettings();

    container.innerHTML = `
      <div class="section">
        <div class="section__head"><div class="type-title-2">Metas de estudo</div></div>
        <div class="card card--flat">
          <div class="field" style="margin-bottom:0">
            <label>Meta diária (minutos)</label>
            <input type="number" id="inp-daily" value="${settings.dailyGoalMinutes}" min="10" step="10"/>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="card card--flat">
          <div class="field" style="margin-bottom:0">
            <label>Meta semanal (minutos)</label>
            <input type="number" id="inp-weekly" value="${settings.weeklyGoalMinutes}" min="60" step="30"/>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="card card--flat">
          <div class="field" style="margin-bottom:0">
            <label>Meta mensal (minutos)</label>
            <input type="number" id="inp-monthly" value="${settings.monthlyGoalMinutes}" min="240" step="60"/>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="card card--flat">
          <div class="field" style="margin-bottom:0">
            <label>Meta diária de questões</label>
            <input type="number" id="inp-qgoal" value="${settings.dailyGoalQuestions}" min="1"/>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="card card--flat">
          <div class="field" style="margin-bottom:0">
            <label>Data da prova</label>
            <input type="date" id="inp-exam" value="${settings.examDate}"/>
          </div>
        </div>
      </div>
      <button class="btn btn--primary btn--block" id="btn-save-settings" style="margin-bottom:28px">Salvar configurações</button>

      <div class="section">
        <div class="section__head"><div class="type-title-2">Aparência</div></div>
        <div class="card card--flat">
          <div class="settings-row">
            <div class="settings-row__label">${Icon('sun')}<span class="type-callout">Tema</span></div>
            <div class="segmented" style="width:160px" id="seg-theme">
              <button data-t="light" class="${(settings.theme||'auto')==='light'?'is-active':''}">Claro</button>
              <button data-t="auto" class="${(settings.theme||'auto')==='auto'?'is-active':''}">Auto</button>
              <button data-t="dark" class="${(settings.theme||'auto')==='dark'?'is-active':''}">Escuro</button>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">${Icon('bell')}<span class="type-callout">Notificações</span></div>
            <button class="switch ${settings.notifications ? 'is-on' : ''}" id="switch-notif"></button>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section__head"><div class="type-title-2">Backup</div></div>
        <div class="card card--flat">
          <div class="settings-row">
            <div class="settings-row__label">${Icon('download')}<span class="type-callout">Exportar dados (JSON)</span></div>
            <button class="icon-btn" id="btn-export">${Icon('chevron-right')}</button>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">${Icon('upload')}<span class="type-callout">Importar dados (JSON)</span></div>
            <button class="icon-btn" id="btn-import">${Icon('chevron-right')}</button>
          </div>
          <input type="file" id="file-import" accept="application/json" class="hidden" />
          <div class="settings-row">
            <div class="settings-row__label" style="color:var(--stamp-red)">${Icon('trash')}<span class="type-callout">Resetar aplicativo</span></div>
            <button class="icon-btn" id="btn-reset">${Icon('chevron-right')}</button>
          </div>
        </div>
      </div>

      <div class="type-footnote text-ink-2" style="text-align:center;margin-top:24px">Auditor Pro IBAM · v1.0 · 100% offline</div>
    `;

    document.getElementById('btn-save-settings').onclick = () => {
      S.updateSettings({
        dailyGoalMinutes: parseInt(document.getElementById('inp-daily').value, 10) || settings.dailyGoalMinutes,
        weeklyGoalMinutes: parseInt(document.getElementById('inp-weekly').value, 10) || settings.weeklyGoalMinutes,
        monthlyGoalMinutes: parseInt(document.getElementById('inp-monthly').value, 10) || settings.monthlyGoalMinutes,
        dailyGoalQuestions: parseInt(document.getElementById('inp-qgoal').value, 10) || settings.dailyGoalQuestions,
        examDate: document.getElementById('inp-exam').value || settings.examDate
      });
      global.UI.toast('Configurações salvas', 'success');
    };

    container.querySelectorAll('#seg-theme button').forEach(btn => {
      btn.onclick = () => {
        const t = btn.dataset.t;
        if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
        S.updateSettings({ theme: t });
        container.querySelectorAll('#seg-theme button').forEach(b => b.classList.toggle('is-active', b === btn));
        const themeBtn = document.getElementById('btn-theme');
        if (themeBtn) themeBtn.innerHTML = t === 'dark' ? Icon('moon') : t === 'light' ? Icon('sun') : Icon('gear');
      };
    });

    const notifSwitch = document.getElementById('switch-notif');
    notifSwitch.onclick = () => {
      const on = !notifSwitch.classList.contains('is-on');
      notifSwitch.classList.toggle('is-on', on);
      S.updateSettings({ notifications: on });
    };

    document.getElementById('btn-export').onclick = exportData;
    document.getElementById('btn-import').onclick = () => document.getElementById('file-import').click();
    document.getElementById('file-import').addEventListener('change', importData);
    document.getElementById('btn-reset').onclick = () => {
      global.UI.confirmDialog({
        title: 'Resetar aplicativo?',
        message: 'Isso apagará TODOS os seus dados (progresso, questões, simulados, notas). Esta ação não pode ser desfeita.',
        confirmLabel: 'Apagar tudo', danger: true,
        onConfirm: () => {
          global.Storage.resetAll();
          global.State.loadAll();
          global.UI.toast('Aplicativo resetado', 'success');
          global.Router.navigate('dashboard');
          global.Router.render();
        }
      });
    };
  }

  function exportData() {
    const data = global.Storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditor-pro-ibam-backup-${U.todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    global.UI.toast('Backup exportado', 'success');
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        global.Storage.importAll(data);
        global.State.loadAll();
        global.UI.toast('Backup importado com sucesso', 'success');
        global.Router.render();
      } catch (err) {
        global.UI.toast('Arquivo inválido', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  global.Pages = global.Pages || {};
  global.Pages.settings = { render };
})(window);
