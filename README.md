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
- Cronômetro Pomodoro, Livre e Contagem Regressiva, com Modo Foco em tela cheia — agora à prova de segundo plano: o tempo continua contando corretamente mesmo se você trocar de aplicativo
- Histórico de Estudos: veja todas as sessões registradas por dia, com edição de duração e exclusão para corrigir registros errados
- Caderno: anotações de texto e gravações de áudio em tempo real, gerais ou vinculadas a um tema, com acesso rápido direto do Modo Foco
- Repetição espaçada (1, 3, 7, 15, 30, 60, 90 dias), com reprogramação automática em caso de muitos erros
- 18 disciplinas e 206 temas pré-cadastrados do edital de Auditor Fiscal IBAM, com prioridades ★
- Registro de questões e simulados, com gráficos de evolução
- Estatísticas completas (horas por disciplina/mês, ranking, velocidade média, estimativa de conclusão)
- Gamificação (XP, níveis, conquistas, sequência diária)
- Checklist do edital completo
- Busca global (disciplinas, temas, notas)
- Backup: exportar/importar JSON, resetar aplicativo
- Modo claro/escuro/automático, glassmorphism, animações, bottom navigation, sheets, menus contextuais, swipe e pull-to-refresh

## Vendendo acesso (códigos individuais)

O app inclui um portão de acesso simples: sem um código válido, a pessoa só vê uma tela de bloqueio.

**Como funciona:**
1. Abra `gerador-de-codigo.html` publicado (ex: `https://seu-usuario.github.io/repo/gerador-de-codigo.html`) — só você deve usar esta página.
2. Invente um código para o comprador (ex: `IBAM-MARIA-7742`) e clique em **Gerar hash**.
3. Copie o hash gerado e cole como uma nova linha dentro de `data/access-codes.js`, na lista `ACCESS_HASHES`.
4. Salve, faça commit e push (ou edite direto pelo site do GitHub, no arquivo `data/access-codes.js`).
5. Envie o **código original** (não o hash) para o comprador via WhatsApp, depois de confirmar o Pix.
6. A pessoa acessa o link do app, digita o código uma vez, e o navegador dela lembra — não precisa digitar de novo.

**Limitações importantes (por não haver servidor):**
- Qualquer pessoa com acesso ao código-fonte do site pode, em teoria, tentar contornar essa trava — ela impede uso casual, não é segurança de nível bancário.
- Não é possível revogar remotamente o acesso de alguém que já desbloqueou o site no aparelho dela — apenas impedir *novos* desbloqueios com aquele código.
- Se duas pessoas usarem o mesmo código, ambas conseguem desbloquear — não há limite de uso por código.
- Para remover um comprador da lista (bloquear novos desbloqueios com o código dele), apague a linha correspondente em `data/access-codes.js` e publique a alteração.
- Em **Configurações → Bloquear acesso neste aparelho** você pode re-testar a tela de bloqueio quando quiser, sem apagar seus dados de estudo.

## Cronômetro em segundo plano

O cronômetro foi reescrito para continuar contando corretamente mesmo quando você troca de aplicativo (por exemplo, para consultar seu material de estudo em outro app). Ele se baseia no horário real do sistema, não em contagem de "tiques" — por isso, ao voltar para o Auditor Pro IBAM, o tempo decorrido está sempre correto, mesmo que o navegador tenha pausado a execução em segundo plano. Se o iOS encerrar completamente a aba (o que pode acontecer após períodos longos em segundo plano), o app detecta isso ao reabrir e restaura a sessão pausada automaticamente, com o tempo já contabilizado.

## Caderno — gravação de áudio (limitações importantes)

- O áudio é gravado com o microfone do navegador (permissão será solicitada na primeira vez) e guardado localmente no aparelho via IndexedDB — nunca sai do dispositivo, nunca é enviado a lugar nenhum.
- **Os áudios NÃO são incluídos no backup JSON** (Configurações → Exportar dados). Apenas o texto das anotações é exportado. Se você trocar de aparelho, reinstalar o app, ou limpar os dados do navegador, os áudios gravados serão perdidos — o texto sobrevive normalmente no backup.
- Gravação de áudio exige conexão https (funciona normalmente pelo link do GitHub Pages) e não funciona se o arquivo for aberto localmente via `file://`.

## Arquitetura

```
index.html              Shell da aplicação
manifest.json            Metadados PWA
gerador-de-codigo.html   Ferramenta interna (só vendedor) para gerar códigos de acesso
service-worker.js        Cache offline-first
styles/                  tokens.css, base.css, components.css, pages.css
data/disciplines.js      Banco de dados inicial do edital (seed)
data/access-codes.js     Lista de hashes de códigos de acesso válidos (editável pelo vendedor)
assets/icons.js          Biblioteca de ícones SVG inline
assets/icons/             Ícones PNG do app (192/512/maskable/apple-touch)
scripts/
  access-gate.js           Portão de acesso (tela de bloqueio + verificação de código)
  storage.js              Camada única de persistência (localStorage)
  utils.js                Funções utilitárias puras
  state.js                Store central + operações de domínio
  scheduler.js             Algoritmo do Cronograma Inteligente
  timer.js                 Pomodoro / Livre / Contagem regressiva (à prova de segundo plano)
  gamification.js          XP, níveis, streak, conquistas
  charts.js                Gráficos em <canvas> puro
  notebook-db.js           Armazenamento de áudio (IndexedDB) para o Caderno
  ui.js                    Toasts, sheets, modais, menus contextuais
  router.js                Roteador + shell (header, bottom nav)
  app.js                   Bootstrap (carregado por último)
  pages/                   Uma página por rota (dashboard, schedule, history, notebook, etc.)
```

Todos os scripts são carregados via `<script>` simples (sem `type="module"`) para máxima compatibilidade com Safari em `file://`, Atalhos do iOS e Scriptable — evitando as restrições de CORS que ES Modules locais têm nesse contexto.
