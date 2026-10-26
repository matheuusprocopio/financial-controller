# Front-end

Aplicação Next.js do Financial Controller. Ela reúne autenticação, chat persistente, interface das ferramentas financeiras, geração de gráficos e captura de áudio.

## Tecnologias

- Next.js 15 com App Router e React 19;
- TypeScript, Tailwind CSS 4 e componentes Radix/shadcn;
- AI SDK 5 com OpenAI;
- Firebase Web SDK para autenticação;
- React Hook Form e Zod para formulários;
- Recharts para visualizações financeiras.

## Configuração

Crie o arquivo de ambiente local:

```bash
cp .env.example .env.local
```

| Variável | Obrigatória | Finalidade |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Sim | URL da API Java, sem barra final |
| `OPENAI_API_KEY` | Sim | Chat, revisão das transcrições e chamadas ao modelo |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Sim | Configuração pública do Firebase Web SDK |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Sim | Domínio de autenticação do Firebase |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Sim | Identificador do projeto Firebase |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Sim | Bucket configurado no projeto Firebase |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sim | Identificador do remetente Firebase |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Sim | Identificador do aplicativo Firebase |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Não | Identificador do Google Analytics |

O back-end deve estar acessível pela URL configurada. Em desenvolvimento, o valor padrão é `http://localhost:8080`.

## Execução

```bash
bun install
bun dev
```

Acesse [http://localhost:3000](http://localhost:3000). Os scripts disponíveis são:

| Comando | Descrição |
| --- | --- |
| `bun dev` | inicia o servidor de desenvolvimento |
| `bun run build` | gera o build de produção |
| `bun start` | compila e inicia o servidor de produção |
| `bun run lint` | executa o ESLint |
| `bun test` | executa os testes com Bun |
| `bun run eval` | executa as avaliações do agente em `eval/` |

## Organização

```text
src/
├── actions/       # server actions por domínio
├── app/           # páginas e route handlers do App Router
├── components/    # interface, chat e componentes das tools
├── formSchemas/   # schemas de validação dos formulários
├── hooks/         # autenticação e paginação
├── lib/agent/     # modelo e system prompt
├── lib/tools/     # ferramentas expostas ao agente
├── providers/     # providers globais
├── types/         # contratos TypeScript
└── utils/         # cliente HTTP, datas e serviços da API
```

## Fluxo de autenticação

1. O usuário autentica pelo Firebase no navegador.
2. O ID token é enviado para `POST /auth/login` no back-end.
3. A API valida o token e cria uma sessão no PostgreSQL.
4. O front-end guarda o identificador em um cookie HTTP-only.
5. As chamadas autenticadas encaminham esse valor no cabeçalho `X-Session-Id`.

## Deploy

Na Vercel, defina `Codigo/front-end` como **Root Directory**, cadastre as variáveis de `.env.example` e autorize o domínio publicado no Firebase Authentication. Configure `NEXT_PUBLIC_API_URL` com a URL pública do back-end.
