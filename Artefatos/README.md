# Artefatos do projeto - Modelos de Banco de Dados

Este diretório reúne os modelos conceituais, lógicos e diagramas estruturais do banco de dados, fundamentais para o entendimento da arquitetura de persistência e da comunicação entre entidades do sistema.

## 1. Scripts do Banco de Dados (PostgreSQL)

```CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enum usado em items
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_type') THEN
        CREATE TYPE item_type AS ENUM ('income', 'expense');
    END IF;
END$$;

-- Usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contas
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    financial_institution TEXT,
    balance DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    search_embedding vector(1536)  -- ajuste a dimensão ao vetor real
);

CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
-- Opcional: precisa de pgvector >= 0.5 e ajuste de lists/probes
-- CREATE INDEX IF NOT EXISTS idx_accounts_embedding ON accounts USING ivfflat (search_embedding vector_l2_ops) WITH (lists = 100);

-- Categorias
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_path TEXT,
    main_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    search_embedding vector(1536)
);

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_main ON categories(main_category_id);
-- CREATE INDEX IF NOT EXISTS idx_categories_embedding ON categories USING ivfflat (search_embedding vector_l2_ops) WITH (lists = 100);

-- Chats
CREATE TABLE IF NOT EXISTS chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_user ON chat(user_id);

-- Mensagens
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chat(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    parts JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_created_at ON messages(chat_id, created_at);

-- Metas
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DOUBLE PRECISION NOT NULL,
    current_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    deadline DATE,
    achieved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    search_embedding vector(1536)
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_account ON goals(account_id);
-- CREATE INDEX IF NOT EXISTS idx_goals_embedding ON goals USING ivfflat (search_embedding vector_l2_ops) WITH (lists = 100);

-- Lançamentos (items)
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    amount DOUBLE PRECISION NOT NULL,
    date DATE NOT NULL,
    type item_type NOT NULL,
    search_embedding vector(1536)
);

CREATE INDEX IF NOT EXISTS idx_items_user_date ON items(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_items_category_date ON items(category_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_items_account_date ON items(account_id, date DESC);
-- CREATE INDEX IF NOT EXISTS idx_items_embedding ON items USING ivfflat (search_embedding vector_l2_ops) WITH (lists = 100);
```