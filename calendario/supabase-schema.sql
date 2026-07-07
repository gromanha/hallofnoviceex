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

-- 3. Tabela de tipos de atividade (gerenciavel pelo admin)
CREATE TABLE IF NOT EXISTS event_types (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,       -- slug: 'spells', 'alchemy', etc.
  label      TEXT NOT NULL,              -- display: 'Spells (Magias)'
  color      TEXT DEFAULT '#1a3a5f',     -- cor do indicador (hex)
  icon       TEXT DEFAULT 'Wand2',       -- nome do icone Lucide
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed: tipos padrao (so insere se a tabela estiver vazia)
INSERT INTO event_types (key, label, color, icon, sort_order)
SELECT * FROM (VALUES
  ('spells',  'Spells (Magias)',     '#1a3a5f', 'Wand2',          0),
  ('tactics', 'Tactics (Táticas)',   '#735c00', 'Swords',         1),
  ('alchemy', 'Alquimia (Alchemy)',  '#059669', 'FlaskConical',   2),
  ('ritual',  'Ritual Sagrado',      '#7e22ce', 'Sparkles',       3),
  ('other',   'Outros',              '#1a3a5f', 'BookOpen',       4)
) AS v(key, label, color, icon, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM event_types LIMIT 1);

-- 4. Habilitar RLS (Row Level Security) — necessario no Supabase
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

-- 5. Politicas RLS
-- Service role (server.js) bypassa RLS, mas o client anon precisa ler
CREATE POLICY "Allow public read events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Allow public read event_types"
  ON event_types FOR SELECT
  USING (true);

-- Service role faz insert/update/delete via server.js com service_role key
-- Nao precisamos de politicas de escrita para anon (so o server escreve)
