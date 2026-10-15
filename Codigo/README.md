# Código do Projeto

- `back-end/`: API em Java 17 + Spark (porta 8080), PostgreSQL com pgvector, Firebase Admin e embeddings da OpenAI.
- `front-end/`: Next.js 15 (porta 3000), Firebase Auth e chat com a OpenAI via AI SDK.

## Pré-requisitos

- Docker (ou Java 17 + Maven)
- [Bun](https://bun.sh) (ou Node 20+)
- Um projeto no Firebase com login por e-mail/senha e Google habilitados
- Uma chave da OpenAI

## Como rodar

### 1. Back-end

```bash
cd Codigo/back-end
cp .env.example .env   # preencha as variáveis
```

Com banco local (Postgres + pgvector, já com o schema aplicado):

```bash
docker compose --profile local-db up --build
```

Com um banco externo (aponte `DB_URL` para ele e aplique `database/schema.sql` uma vez):

```bash
docker compose up --build
```

Sem Docker: `mvn clean package -DskipTests && java -jar target/back-end-1.0-SNAPSHOT.jar` (use `localhost` no host da `DB_URL`).

Verifique: `curl http://localhost:8080/health` deve retornar `{"status":"ok"}`.

### 2. Front-end

```bash
cd Codigo/front-end
cp .env.example .env.local   # preencha as variáveis
bun install
bun dev
```

Acesse http://localhost:3000, crie uma conta ou entre com Google e use o chat.

## Banco de dados

O schema está em `back-end/database/schema.sql`. Ele é idempotente e pode ser reaplicado:

```bash
psql "$DB_URL" -f Codigo/back-end/database/schema.sql
```

As sessões de login ficam na tabela `sessions`, então sobrevivem a reinícios e deploys da API. Ao atualizar uma instalação existente, reaplique o schema antes de publicar o back-end; sem essa tabela o login falha.

## Deploy

Front-end na Vercel, API no Render e banco no Neon (todos com plano gratuito).

### 1. Banco (Neon)

1. Crie um projeto em https://neon.tech e copie a connection string (`postgresql://...?sslmode=require`).
2. Aplique o schema: `psql "<connection string>" -f Codigo/back-end/database/schema.sql`.

### 2. API (Render)

1. No Render, use **New > Blueprint** e selecione este repositório (usa o `render.yaml` da raiz).
2. Preencha as variáveis pedidas:
   - `DB_URL`: connection string do Neon
   - `FIREBASE_SERVICE_ACCOUNT_JSON`: conteúdo do `service-account-key.json` em uma linha (`jq -c . service-account-key.json`)
   - `FIREBASE_PROJECT_ID` e `OPENAI_API_KEY`
   - `CORS_ALLOWED_ORIGINS`: URL do front na Vercel (pode ajustar depois do passo 3)
3. Verifique: `https://<sua-api>.onrender.com/health`.

No plano gratuito a API hiberna após 15 minutos sem uso: a primeira requisição demora cerca de 1 minuto e, como as sessões ficam em memória, os usuários precisam entrar de novo.

### 3. Front-end (Vercel)

1. Importe o repositório na Vercel com **Root Directory** `Codigo/front-end`.
2. Cadastre as variáveis do `.env.example` do front, com `NEXT_PUBLIC_API_URL` apontando para a URL do Render.
3. No Firebase, adicione o domínio da Vercel em **Authentication > Configurações > Domínios autorizados**.
