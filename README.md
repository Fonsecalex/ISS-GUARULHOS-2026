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

### Forma recomendada — direto do celular, sem editar nada

1. Abra o repositório em **github.com** pelo navegador do celular.
2. Toque na aba **Actions** (menu superior).
3. Na lista à esquerda, toque em **"Adicionar Código de Acesso"**.
4. Toque no botão **"Run workflow"** (canto superior direito).
5. Preencha:
   - **codigo**: o código que você vai vender (ex: `IBAM-MARIA-01`)
   - **rotulo** (opcional): algo pra você lembrar quem comprou (ex: `Maria - Pix 22/07`)
6. Toque no botão verde **"Run workflow"** para confirmar.
7. Aguarde cerca de 30-60 segundos — o site atualiza sozinho, sem você precisar fazer commit, push ou editar arquivo nenhum.
8. Envie o **código digitado** (não precisa mexer com hash) para o comprador via WhatsApp.

**Configuração única, antes do primeiro uso:** vá em **Settings → Actions → General**, role até **"Workflow permissions"**, selecione **"Read and write permissions"** e clique em **Save**. Sem isso, o botão roda mas falha ao tentar salvar a alteração (você verá um X vermelho na aba Actions se isso acontecer — normalmente é exatamente essa configuração faltando).

### Forma manual (alternativa)

Se preferir, o arquivo `gerador-de-codigo.html` (publicado junto com o site) continua funcionando: gera o hash de um código à sua escolha, que você cola manualmente em `data/access-codes.js` pelo editor do GitHub e publica com um commit.

### Limitações importantes (por não haver servidor)

- Qualquer pessoa com acesso ao código-fonte do site pode, em teoria, tentar contornar essa trava — ela impede uso casual, não é segurança de nível bancário.
- Não é possível revogar remotamente o acesso de alguém que já desbloqueou o site no aparelho dela — apenas impedir *novos* desbloqueios com aquele código.
- Se duas pessoas usarem o mesmo código, ambas conseguem desbloquear — não há limite de uso por código.
- Para remover um comprador da lista (bloquear novos desbloqueios com o código dele), apague a linha correspondente em `data/access-codes.js` pelo editor do GitHub e publique a alteração — isso ainda precisa ser feito manualmente, o workflow por enquanto só adiciona códigos.
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
.github/workflows/       add-access-code.yml — botão "Run workflow" que gera e publica um novo código de acesso
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
