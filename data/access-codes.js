/**
 * data/access-codes.js
 * -----------------------------------------------------------------------
 * Lista de códigos de acesso válidos, controlada por VOCÊ (o vendedor).
 *
 * Cada código real (ex: "IBAM-7X4K-2026") NUNCA fica escrito aqui em texto
 * puro — apenas o seu "hash" (uma impressão digital irreversível). Isso
 * evita que alguém que olhe o código-fonte do site veja os códigos válidos.
 *
 * COMO ADICIONAR UM NOVO CÓDIGO (forma recomendada — direto do celular):
 *   Use a aba "Actions" do repositório no GitHub → workflow "Adicionar
 *   Código de Acesso" → botão "Run workflow" → digite o código → Run.
 *   Isso gera o hash, edita este arquivo e publica o site sozinho, em
 *   menos de um minuto. Veja o passo a passo completo no README.md.
 *
 * FORMA MANUAL (alternativa, se preferir ou se o Actions não funcionar):
 *   1. Abra o arquivo gerador-de-codigo.html (na raiz do projeto).
 *   2. Digite um código à sua escolha e copie o hash gerado.
 *   3. Adicione uma nova linha na lista ACCESS_HASHES abaixo, sempre
 *      terminando com vírgula: "hash-copiado", // rótulo opcional
 *   4. Salve, faça commit e push.
 *   5. Envie o código ORIGINAL (não o hash) para o comprador por WhatsApp.
 *
 * Para revogar o acesso de alguém, apague a linha correspondente e
 * publique a alteração — o código deixa de funcionar para quem ainda
 * não o usou. (Quem já desbloqueou o site num aparelho continua com
 * acesso liberado *naquele aparelho específico* até limpar os dados do
 * navegador — não há como revogar remotamente um acesso já concedido,
 * pois o site não tem servidor.)
 * -----------------------------------------------------------------------
 */
(function (global) {
  'use strict';

  global.ACCESS_HASHES = [
    // Exemplo incluso — código real: "TESTE-1234"
    // Apague esta linha quando cadastrar seus próprios compradores.
    "3e72b88797cf8a088262639de978af91e6693558cfec85251e3387d47d6212a4",
    "b2857ff005ee57932139e2c901788ec22b4c532102c805567ac9718773a1d380", // Luci
  ];
})(window);
