-- Schema do Financial Controller (PostgreSQL + pgvector)
-- Derivado das queries dos DAOs em src/main/java/com/ti2cc/api/dao.
-- Os embeddings usam text-embedding-3-small (1536 dimensões).

CREATE EXTENSION IF NOT EXISTS vector;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_type') THEN
        CREATE TYPE item_type AS ENUM ('income', 'expense');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY,
    name        TEXT,
    email       TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
    id                     UUID PRIMARY KEY,
    user_id                UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name                   TEXT NOT NULL,
    financial_institution  TEXT,
    balance                NUMERIC(14, 2) NOT NULL DEFAULT 0,
    search_embedding       vector(1536),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id                UUID PRIMARY KEY,
    user_id           UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    image_path        TEXT,
    main_category_id  UUID REFERENCES categories (id) ON DELETE SET NULL,
    search_embedding  vector(1536),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
    id                UUID PRIMARY KEY,
    user_id           UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    category_id       UUID REFERENCES categories (id) ON DELETE SET NULL,
    account_id        UUID REFERENCES accounts (id) ON DELETE SET NULL,
    name              TEXT NOT NULL,
    description       TEXT,
    amount            NUMERIC(14, 2) NOT NULL,
    date              DATE NOT NULL,
    type              item_type NOT NULL,
    search_embedding  vector(1536),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
    id                UUID PRIMARY KEY,
    user_id           UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    account_id        UUID REFERENCES accounts (id) ON DELETE SET NULL,
    title             TEXT NOT NULL,
    description       TEXT,
    target_amount     NUMERIC(14, 2) NOT NULL,
    current_amount    NUMERIC(14, 2) NOT NULL DEFAULT 0,
    deadline          DATE,
    achieved          BOOLEAN NOT NULL DEFAULT FALSE,
    search_embedding  vector(1536),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat (
    id          UUID PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id          UUID PRIMARY KEY,
    chat_id     UUID NOT NULL REFERENCES chat (id) ON DELETE CASCADE,
    role        TEXT NOT NULL,
    parts       JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories (user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_date ON items (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages (chat_id, created_at);
