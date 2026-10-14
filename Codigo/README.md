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
