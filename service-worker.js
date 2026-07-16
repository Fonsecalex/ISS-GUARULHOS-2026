# Auditor Pro IBAM

Aplicativo completo de gerenciamento de estudos para preparação de **Auditor Fiscal (banca IBAM)**, feito em HTML + CSS + JavaScript puro — sem frameworks, sem servidor, sem banco online. Todos os dados ficam no `localStorage` do seu iPhone.

## Como usar no iPhone

**Opção 1 — Mais simples (Arquivos + Safari):**
1. Extraia o `.zip` no app **Arquivos** do iPhone (toque no zip → "Descompactar").
2. Abra a pasta `app`, toque em `index.html` e escolha **Abrir com → Safari**.
3. No Safari, toque em **Compartilhar → Adicionar à Tela de Início**.
4. O app abrirá em tela cheia, como um aplicativo nativo.

**Opção 2 — Com Service Worker completo (cache offline nativo):**
Como o iOS não permite Service Workers em páginas abertas via `file://`, para ter o cache offline nativo (ícone de instalação + funcionamento sem Safari aberto) hospede a pasta `app/` em qualquer servidor estático simples, por exemplo:
- GitHub Pages (gratuito)
- iCloud Drive + link compartilhado
- Um servidor HTTP local via **Scriptable** ou **a-Shell**

Sem isso, o app funciona normalmente (todo o localStorage funciona via `file://`), apenas sem o cache de Service Worker — o que não afeta nenhuma funcionalidade, pois nada depende de rede.

## Funcionalidades incluídas

- Dashboard com progresso do edital, metas diárias/semanais/mensais, sequência de estudos, XP e nível
- Cronograma Inteligente — algoritmo que reorganiza o plano diário considerando peso da disciplina, dias sem estudar/revisar, taxa de erro, dificuldade e proximidade da prova
- Cronômetro Pomodoro, Livre e Contagem Regressiva, com Modo Foco em tela cheia
- Repetição espaçada (1, 3, 7, 15, 30, 60, 90 dias), com reprogramação automática em caso de muitos erros
- 18 disciplinas e 206 temas pré-cadastrados do edital de Auditor Fiscal IBAM, com prioridades ★
- Registro de questões e simulados, com gráficos de evolução
- Estatísticas completas (horas por disciplina/mês, ranking, velocidade média, estimativa de conclusão)
- Gamificação (XP, níveis, conquistas, sequência diária)
- Checklist do edital completo
- Busca global (disciplinas, temas, notas)
- Backup: exportar/importar JSON, resetar aplicativo
- Modo claro/escuro/automático, glassmorphism, animações, bottom navigation, sheets, menus contextuais, swipe e pull-to-refresh

## Arquitetura

```
index.html              Shell da aplicação
manifest.json            Metadados PWA
service-worker.js        Cache offline-first
styles/                  tokens.css, base.css, components.css, pages.css
data/disciplines.js      Banco de dados inicial do edital (seed)
assets/icons.js          Biblioteca de ícones SVG inline
assets/icons/             Ícones PNG do app (192/512/maskable/apple-touch)
scripts/
  storage.js              Camada única de persistência (localStorage)
  utils.js                Funções utilitárias puras
  state.js                Store central + operações de domínio
  scheduler.js             Algoritmo do Cronograma Inteligente
  timer.js                 Pomodoro / Livre / Contagem regressiva
  gamification.js          XP, níveis, streak, conquistas
  charts.js                Gráficos em <canvas> puro
  ui.js                    Toasts, sheets, modais, menus contextuais
  router.js                Roteador + shell (header, bottom nav)
  app.js                   Bootstrap (carregado por último)
  pages/                   Uma página por rota (dashboard, schedule, etc.)
```

Todos os scripts são carregados via `<script>` simples (sem `type="module"`) para máxima compatibilidade com Safari em `file://`, Atalhos do iOS e Scriptable — evitando as restrições de CORS que ES Modules locais têm nesse contexto.
