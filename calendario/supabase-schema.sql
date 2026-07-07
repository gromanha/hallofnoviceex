-- ============================================================
-- Hall of the Novice EX — Schema para Supabase
-- Execute este SQL no Editor SQL do painel Supabase
-- (https://supabase.com/dashboard → seu projeto → SQL Editor)
-- ============================================================

-- 1. Tabela de admins (usada pelo server.js para auth)
CREATE TABLE IF NOT EXISTS admins (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de eventos do calendario
CREATE TABLE IF NOT EXISTS events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month       TEXT NOT NULL,          -- ex: "Julho"
  day         INTEGER NOT NULL,       -- 1-31
  time        TEXT NOT NULL,          -- ex: "09:00 — 11:30"
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  instructor  TEXT DEFAULT '',
  type        TEXT NOT NULL,          -- spells|tactics|alchemy|ritual|other
  image       TEXT DEFAULT '',
  crystal     BOOLEAN DEFAULT false,
  stars       BOOLEAN DEFAULT false,
  indicators  TEXT[] DEFAULT '{}',
  mana_progress INTEGER DEFAULT 0,
  spots       INTEGER,
  rank        TEXT,
  created_by  UUID REFERENCES admins(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ
);

-- 3. Habilitar RLS (Row Level Security) — necessario no Supabase
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 4. Politicas RLS
-- Service role (server.js) bypassa RLS, mas o client anon precisa ler eventos
CREATE POLICY "Allow public read events"
  ON events FOR SELECT
  USING (true);

-- Service role faz insert/update/delete via server.js com service_role key
-- Nao precisamos de politicas de escrita para anon (so o server escreve)
