/**
 * data/disciplines.js
 * Banco de dados inicial (seed) do edital de Auditor Fiscal — banca IBAM.
 * Usado para popular o localStorage na primeira abertura do app.
 */
(function (global) {
  'use strict';

  const COR = {
    fiscal: '#C9A227', juridica: '#1F6F63', exatas: '#3E6AE1',
    lingua: '#8A4FFF', gestao: '#B3261E', tech: '#0EA5A5'
  };

  function d(id, nome, peso, cor, icon, temas) {
    return { id, nome, peso, cor, icon, temas: temas.map((t, i) => ({ id: `${id}-${i + 1}`, nome: t })) };
  }

  const DISCIPLINES_SEED = [
    d('leg-trib-mun', 'Legislação Tributária Municipal', 5, COR.fiscal, 'building', [
      'Código Tributário Municipal', 'IPTU — aspectos gerais', 'ISS — aspectos gerais',
      'ITBI — aspectos gerais', 'Taxas Municipais', 'Contribuição de Melhoria',
      'Lançamento e Cobrança de Tributos Municipais', 'Processo Administrativo Fiscal Municipal',
      'Dívida Ativa Municipal', 'Parcelamento de Débitos Municipais',
      'Nota Fiscal de Serviços Eletrônica (NFS-e)', 'Substituição Tributária do ISS',
      'Lista de Serviços — LC 116/2003', 'Cadastro Imobiliário e Mobiliário',
      'Planta de Valores Genéricos', 'Benefícios e Incentivos Fiscais Municipais'
    ]),
    d('reforma-trib', 'Reforma Tributária', 5, COR.fiscal, 'bolt', [
      'EC 132/2023 — panorama geral', 'IBS — Imposto sobre Bens e Serviços',
      'CBS — Contribuição sobre Bens e Serviços', 'Imposto Seletivo',
      'Comitê Gestor do IBS', 'Regras de Transição', 'Split Payment',
      'Não Cumulatividade Plena', 'Cashback Tributário',
      'Regimes Específicos e Diferenciados', 'Extinção do ISS e do ICMS',
      'Fundo de Compensação de Benefícios Fiscais', 'Princípio do Destino',
      'Lei Complementar 214/2025'
    ]),
    d('contab-fiscal', 'Contabilidade Fiscal', 5, COR.fiscal, 'ledger', [
      'Contabilidade Pública — conceitos', 'Lei 4.320/64',
      'Plano de Contas Aplicado ao Setor Público', 'Receita Pública',
      'Despesa Pública', 'Regimes Contábeis (caixa e competência)',
      'DCASP — Demonstrações Contábeis Aplicadas ao Setor Público',
      'Balanço Orçamentário', 'Balanço Financeiro', 'Balanço Patrimonial',
      'Demonstração das Variações Patrimoniais', 'Normas NBC TSP',
      'SICONFI', 'Lei de Responsabilidade Fiscal', 'Escrituração Fiscal Digital'
    ]),
    d('audit-fiscal', 'Auditoria Fiscal', 5, COR.fiscal, 'seal', [
      'Conceitos Gerais de Auditoria', 'Auditoria Tributária',
      'Planejamento da Auditoria', 'Procedimento Fiscalizatório',
      'Auto de Infração', 'Termo de Início de Fiscalização',
      'Provas nos Procedimentos Fiscais', 'Sigilo Fiscal',
      'Cruzamento de Dados e Malha Fiscal', 'Auditoria por Amostragem',
      'Técnicas de Auditoria Contábil-Fiscal', 'Ética do Auditor Fiscal',
      'Responsabilidade Funcional do Auditor'
    ]),
    d('dir-tributario', 'Direito Tributário', 4, COR.juridica, 'scale', [
      'Competência Tributária', 'Capacidade Tributária', 'Obrigação Tributária',
      'Fato Gerador', 'Sujeito Ativo', 'Sujeito Passivo', 'Responsabilidade Tributária',
      'Solidariedade', 'Crédito Tributário', 'Lançamento Tributário',
      'Suspensão da Exigibilidade', 'Extinção do Crédito Tributário',
      'Exclusão do Crédito Tributário', 'Imunidades Tributárias', 'Isenções',
      'Administração Tributária', 'Fiscalização Tributária', 'Prescrição',
      'Decadência', 'Certidões Negativas', 'Garantias e Privilégios do Crédito Tributário',
      'Sistema Tributário Nacional', 'Princípios Constitucionais Tributários',
      'Repartição das Receitas Tributárias'
    ]),
    d('dir-administrativo', 'Direito Administrativo', 4, COR.juridica, 'columns', [
      'Princípios da Administração Pública', 'Poderes Administrativos',
      'Atos Administrativos', 'Processo Administrativo — Lei 9.784/99',
      'Licitações e Contratos — Lei 14.133/21', 'Servidores Públicos',
      'Improbidade Administrativa — Lei 8.429/92', 'Responsabilidade Civil do Estado',
      'Controle da Administração Pública', 'Organização Administrativa',
      'Bens Públicos', 'Serviços Públicos'
    ]),
    d('dir-constitucional', 'Direito Constitucional', 4, COR.juridica, 'flag', [
      'Princípios Fundamentais', 'Direitos e Garantias Fundamentais',
      'Organização do Estado', 'Administração Pública na CF',
      'Sistema Tributário Nacional na CF', 'Repartição de Competências',
      'Controle de Constitucionalidade', 'Poder Legislativo',
      'Poder Executivo', 'Poder Judiciário', 'Ordem Econômica e Financeira',
      'Finanças Públicas na CF'
    ]),
    d('portugues', 'Português', 3, COR.lingua, 'text', [
      'Interpretação de Texto', 'Ortografia', 'Acentuação Gráfica',
      'Classes de Palavras', 'Sintaxe do Período', 'Concordância Verbal',
      'Concordância Nominal', 'Regência Verbal e Nominal', 'Crase',
      'Pontuação', 'Redação Oficial', 'Coesão e Coerência Textual',
      'Figuras de Linguagem', 'Novo Acordo Ortográfico'
    ]),
    d('tecnologia', 'Tecnologia', 3, COR.tech, 'chip', [
      'Conceitos de Informática', 'Sistemas Operacionais',
      'Pacote Office / BrOffice', 'Segurança da Informação',
      'Redes de Computadores', 'Internet e Navegadores',
      'Computação em Nuvem', 'Big Data e Cruzamento de Dados Fiscais',
      'Inteligência Artificial Aplicada à Fiscalização',
      'Sistemas de Informação Municipal'
    ]),
    d('lgpd', 'LGPD', 3, COR.tech, 'shield', [
      'Princípios da LGPD', 'Tratamento de Dados Pessoais', 'Dados Sensíveis',
      'Bases Legais para o Tratamento', 'Direitos do Titular',
      'Agentes de Tratamento', 'Encarregado (DPO)', 'ANPD',
      'Sanções Administrativas', 'LGPD no Setor Público',
      'Compartilhamento de Dados Fiscais'
    ]),
    d('raciocinio-logico', 'Raciocínio Lógico', 2, COR.exatas, 'puzzle', [
      'Estruturas Lógicas', 'Proposições', 'Conectivos Lógicos',
      'Tabela Verdade', 'Equivalências Lógicas', 'Argumentos Lógicos',
      'Diagramas Lógicos', 'Sequências e Padrões', 'Lógica de Conjuntos',
      'Probabilidade Básica', 'Problemas de Raciocínio Sequencial'
    ]),
    d('mat-financeira', 'Matemática Financeira', 2, COR.exatas, 'chart', [
      'Porcentagem', 'Juros Simples', 'Juros Compostos', 'Taxas de Juros',
      'Descontos', 'Correção Monetária', 'Séries de Pagamentos',
      'Sistemas de Amortização (PRICE/SAC)', 'Fluxo de Caixa',
      'Análise de Investimentos'
    ]),
    d('trib-municipais', 'Tributos Municipais', 2, COR.fiscal, 'coin', [
      'IPTU — fato gerador e base de cálculo', 'ISS — local de incidência',
      'ISS — alíquotas mínima e máxima', 'ITBI — fato gerador e imunidades',
      'Taxas de Poder de Polícia', 'Taxas de Serviço Público',
      'Contribuição de Melhoria — aspectos práticos',
      'COSIP — Contribuição para Custeio da Iluminação Pública'
    ]),
    d('dir-empresarial', 'Direito Empresarial', 2, COR.juridica, 'briefcase', [
      'Empresário e Sociedade Empresária', 'Tipos Societários',
      'Registro de Empresas', 'Nome Empresarial', 'Estabelecimento Empresarial',
      'Títulos de Crédito', 'Recuperação Judicial e Falência', 'MEI e Simples Nacional'
    ]),
    d('dir-penal', 'Direito Penal', 2, COR.juridica, 'gavel', [
      'Crimes contra a Ordem Tributária — Lei 8.137/90', 'Crimes Funcionais',
      'Crimes contra a Administração Pública', 'Teoria do Crime',
      'Aplicação da Pena', 'Extinção da Punibilidade'
    ]),
    d('dir-civil', 'Direito Civil', 2, COR.juridica, 'book', [
      'Pessoas Naturais e Jurídicas', 'Domicílio', 'Bens',
      'Fatos e Negócios Jurídicos', 'Prescrição e Decadência Civil',
      'Obrigações', 'Responsabilidade Civil'
    ]),
    d('proc-adm-trib', 'Processo Administrativo Tributário', 2, COR.gestao, 'folder', [
      'Princípios do Processo Administrativo Tributário', 'Impugnação e Recursos',
      'Auto de Infração — aspectos processuais', 'Prazos Processuais',
      'Instâncias de Julgamento', 'Conselho de Contribuintes',
      'Execução Fiscal', 'Certidão de Dívida Ativa'
    ]),
    d('estrut-adm-trib', 'Estrutura Administrativa Tributária', 2, COR.gestao, 'sitemap', [
      'Organização da Secretaria de Fazenda Municipal', 'Carreira de Auditor Fiscal',
      'Competências do Fisco Municipal', 'Cadastro Fiscal',
      'Sistemas de Arrecadação Municipal', 'Convênios entre Entes Federativos',
      'Cooperação Fiscal (Federal / Estadual / Municipal)'
    ])
  ];

  global.DISCIPLINES_SEED = DISCIPLINES_SEED;
})(window);
