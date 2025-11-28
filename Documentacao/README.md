# Financial Controller – Uma solução para gestão financeira pessoal

## 1. Introdução

Aplicação web para controle financeiro pessoal e empresarial, ajudando os usuários a gerenciar suas receitas, despesas, investimentos e contas, com uma visão clara de sua saúde financeira. O projeto evoluiu de uma ferramenta simples para uma solução full-stack com back-end em Java, banco PostgreSQL e integração com inteligência artificial (IA) para relatórios financeiros automatizados.

## 2. Objetivo Do Projeto

O Financial Controller tem como objetivo fornecer uma solução completa e intuitiva para o controle e planejamento financeiro, tanto para indivíduos quanto para empresas. A aplicação visa otimizar o gerenciamento de receitas, despesas, contas bancárias, por meio de uma interface amigável e ferramentas avançadas, como categorização automática de transações, geração de relatórios financeiros automatizados com inteligência artificial, e visualização de dados por meio de gráficos interativos. O projeto busca não só centralizar as informações financeiras, mas também permitir que os usuários tomem decisões mais informadas e estratégicas, promovendo uma gestão financeira mais eficiente e transparente.

## 3. Equipe

* Arthur Mendes Lima
* Heitor Lima Moreira
* Matheus Procópio Duarte
* Nicolas Alexandre Torres Dias

## 4. Visão geral da Solução

O Financial Controller oferece:
* Cadastro de contas e cartões de crédito para controle de transações;
* Categorização de receitas e despesas para facilitar o acompanhamento de gastos;
* Relatórios financeiros automatizados com IA para geração de insights e previsões;
* Gráficos interativos para visualizar a evolução das finanças ao longo do tempo;
* Análises comparativas entre períodos, categorias e tipos de transações financeiras.

## 5. Arquitetura Atual

### 5.1 Front-End Web
* TypeScript, Next.js
* TailWind CSS
* Interface responsiva com telas de:
    * Home (dashboard financeiro, resumos de despesas e receitas)
    * Cadastro e gestão de contas, cartões de crédito, e categorias de despesas
    * Relatórios e gráficos de evolução financeira
    * Login e cadastro de usuários

### 5.2 Back-end - API REST
* Java + Spark Framework
* Implementação de endpoints para:
    * Autenticação de usuário
    * CRUD de contas, cartões de crédito, receitas e despesas
    * Consultas de itens financeiros, relatórios e gráficos
    * Análises de dados utilizando IA para relatórios automatizados

### 5.3 Banco de Dados 
* PostgreSQL
* Tabelas principais (conceituais):
    * contas
    * cartões_de_credito
    * transações (receitas e despesas)
    * categorias
    * investimentos

### 5.4 Módulo Inteligente
* Serviço responsável por:
    * Gerar relatórios financeiros detalhados sobre receitas, despesas e saldos
    * Analisar dados financeiros para sugerir previsões e estratégias financeiras
    * Usar OpenAI API para gerar relatórios automatizados e insights baseados no histórico de dados financeiros
    * Sistema de speech-to-text

### 5.5 Ferramentas de Desenvolvimento
* Eclipse - desenvolvimento back-end em Java
* VS Code – desenvolvimento do front-end com TypeScript e Next.js
* GitHub – versionamento e hospedagem do código
* Discord – comunicação da equipe

## 6. Tecnologias Utilizadas
* Modelo whisper da OpenAI via next AI SDK no front end pra transição de áudio
* Modelo de embbending text-embedding-3-small da OpenAI
* Extensão de pg vector pra vector embbending no Postgres
* Vercel AI SDK pra construção do agente de AI

## 7. Funcionalidades

### 7.1 Gerenciamento de Contas
* Cadastro e controle de contas bancárias.
* Visualização dos saldos das contas e monitoramento de transações realizadas.

### 7.2 Categorização de Despesas e Receitas
* Classificação automática ou manual de despesas e receitas em categorias predefinidas (ex: Alimentação, Transporte, Lazer).
* Acompanhamento detalhado das despesas mensais e receitas.
* Definição de orçamentos mensais por categoria e visualização do progresso.

### 7.3 Relatórios Financeiros Automáticos
* Geração de relatórios financeiros personalizados com a ajuda de inteligência artificial (OpenAI API).
* Relatórios de gastos totais, receitas, saldo, e previsões financeiras.
* Visualização de gráficos interativos (linha e barra) sobre a evolução financeira ao longo do tempo.

### 7.4 Gestão de Investimentos Empresariais
* Acompanhamento de investimentos corporativos e seu retorno.
* Relatórios sobre a rentabilidade dos ativos da empresa.

## 8. Conclusão
O Financial Controller é mais do que apenas uma ferramenta de gerenciamento financeiro — é um assistente inteligente que proporciona aos indivíduos e empresas o controle completo sobre suas finanças, oferecendo uma visão clara e detalhada dos seus fluxos de caixa. Com uma interface intuitiva, categorização automática de despesas e receitas, e relatórios automatizados gerados pela OpenAI, a aplicação facilita a gestão e otimização de recursos financeiros, permitindo que os usuários tomem decisões mais informadas e estratégicas.

## 9. Licença

Este projeto está licenciado sob a Creative Commons Attribution 4.0 International Public License (CC BY 4.0). Você pode compartilhar, modificar e usar o código para qualquer finalidade, desde que atribua os devidos créditos aos autores originais.