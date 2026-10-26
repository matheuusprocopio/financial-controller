# Documentação do Financial Controller

## Visão do produto

O Financial Controller é um assistente de finanças pessoais que substitui fluxos extensos de navegação por uma conversa. A aplicação interpreta solicitações em linguagem natural, consulta os dados do usuário e apresenta formulários revisáveis antes de criar ou alterar registros.

O produto atende pessoas que desejam registrar receitas e despesas, organizar contas e categorias, acompanhar metas e analisar o fluxo financeiro sem integração direta com instituições bancárias.

## Escopo funcional

### Autenticação e sessões

- login por e-mail/senha ou Google por meio do Firebase Authentication;
- validação do ID token pelo Firebase Admin no back-end;
- sessão própria, renovável e persistida no PostgreSQL;
- isolamento dos recursos pelo usuário autenticado.

### Assistente conversacional

- conversas e mensagens persistidas;
- interpretação de datas relativas no fuso `America/Sao_Paulo`;
- ferramentas para contas, categorias, lançamentos, metas e análises;
- formulários preenchidos pelo agente e confirmados pelo usuário nas operações de escrita;
- gráficos de receitas, despesas e saldo dentro da conversa.

### Gestão financeira

- contas com instituição financeira e saldo;
- categorias e subcategorias;
- lançamentos de receita ou despesa, com conta, categoria, valor e data;
- metas globais ou vinculadas a uma conta;
- filtros, paginação e busca semântica.

### Entrada por voz

O front-end aceita arquivos de áudio de até 1 MB. O áudio é transcrito com `whisper-1`; em seguida, o modelo do agente revisa ruídos e repetições antes de enviar o texto ao chat.

## Limites atuais

- não há integração automática com bancos;
- investimentos, carteiras de ativos, previsões financeiras e orçamentos por categoria não estão implementados;
- as ferramentas de cartão de crédito são experimentais e ainda não persistem dados;
- o sistema não substitui orientação contábil ou financeira profissional.

## Arquitetura técnica

| Componente | Responsabilidade |
| --- | --- |
| Aplicação Next.js | autenticação no cliente, chat, formulários, gráficos e rotas intermediárias |
| Agente OpenAI | interpretação das mensagens e seleção das ferramentas financeiras |
| API Spark Java | regras de negócio, autorização, CRUD, paginação e análises |
| PostgreSQL | usuários, sessões, contas, categorias, lançamentos, metas, chats e mensagens |
| pgvector | armazenamento dos embeddings usados em busca semântica |
| Firebase | provedor de identidade; os dados financeiros permanecem no PostgreSQL |

### Fluxo de uma solicitação

1. O navegador envia a mensagem ao route handler de chat do Next.js.
2. O agente escolhe uma ferramenta ou responde com base nos resultados disponíveis.
3. Consultas são encaminhadas à API com o identificador da sessão.
4. Criações e edições exibem um formulário para revisão e confirmação.
5. A API valida a sessão, aplica a regra de negócio e acessa o PostgreSQL.
6. As mensagens do usuário e do assistente são gravadas no histórico da conversa.

## Modelo de dados

| Entidade | Descrição |
| --- | --- |
| `users` | perfil associado ao usuário autenticado |
| `sessions` | sessões renováveis da API |
| `accounts` | contas e respectivos saldos |
| `categories` | categorias hierárquicas de lançamentos |
| `items` | receitas e despesas |
| `goals` | metas financeiras globais ou por conta |
| `chat` | conversas do usuário |
| `messages` | conteúdo estruturado das mensagens |

O schema executável e idempotente está em [`Codigo/back-end/database/schema.sql`](../Codigo/back-end/database/schema.sql). Os diagramas acadêmicos estão em [`Artefatos/Modelos Diagrama BD's`](../Artefatos/Modelos%20Diagrama%20BD's/).

## API

A API usa JSON e, exceto em autenticação e health check, exige o cabeçalho `X-Session-Id`.

| Recurso | Operações principais |
| --- | --- |
| `/health` | verificação de disponibilidade |
| `/auth` | login, validação e logout |
| `/users` | consulta e manutenção do perfil |
| `/accounts` | CRUD e listagem paginada de contas |
| `/categories` | CRUD e listagem paginada de categorias |
| `/items` | CRUD, filtros e análise de lançamentos |
| `/goals` | CRUD e busca de metas |
| `/chats` | CRUD e paginação de conversas |
| `/chats/:chatId/messages` | criação, listagem e atualização de mensagens |

## Operação e deploy

O ambiente de referência usa Vercel para o front-end, Render para a API e Neon para o PostgreSQL. O arquivo `render.yaml` contém o blueprint da API, e os arquivos `.env.example` documentam todas as variáveis necessárias.

Consulte o [README principal](../README.md) para execução local e [`Codigo/README.md`](../Codigo/README.md) para instruções detalhadas de banco e publicação.

## Licença

Este projeto é distribuído sob a licença Creative Commons Attribution 4.0 International (CC BY 4.0).
