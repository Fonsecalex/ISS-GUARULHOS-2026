/**
 * data/access-codes.js
 * -----------------------------------------------------------------------
 * Lista de códigos de acesso válidos, controlada por VOCÊ (o vendedor).
 *
 * Cada código real (ex: "IBAM-7X4K-2026") NUNCA fica escrito aqui em texto
 * puro — apenas o seu "hash" (uma impressão digital irreversível). Isso
 * evita que alguém que olhe o código-fonte do site veja os códigos válidos.
 *
 * COMO GERAR UM NOVO CÓDIGO PARA UM COMPRADOR:
 *   1. Abra o arquivo gerador-de-codigo.html (na raiz do projeto) em
 *      qualquer navegador — pode ser no celular ou no computador.
 *   2. Digite um código à sua escolha (ex: nome + números aleatórios).
 *   3. A página mostra o hash correspondente. Copie esse hash.
 *   4. Adicione uma nova linha na lista ACCESS_HASHES abaixo, no formato:
 *        "hash-copiado", // rótulo opcional pra você lembrar quem é
 *   5. Salve, faça commit e push para o GitHub (ou edite direto pelo
 *      site do GitHub, no arquivo data/access-codes.js).
 *   6. Envie o código ORIGINAL (não o hash) para o comprador por WhatsApp.
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
    "3e72b88797cf8a088262639de978af91e6693558cfec85251e3387d47d6212a4"
  ];
})(window);
