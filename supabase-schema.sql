-- ============================================================
-- Hall of the Novice EX — Schema Completo Supabase (Unificado)
-- Execute este SQL no Editor SQL do painel Supabase
-- (https://supabase.com/dashboard → seu projeto → SQL Editor)
-- ============================================================

-- 1. Tabela de admins (usada para auth)
CREATE TABLE IF NOT EXISTS admins (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de eventos do calendario
CREATE TABLE IF NOT EXISTS events (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month         TEXT NOT NULL,          -- ex: "Julho"
  day           INTEGER NOT NULL,       -- 1-31
  time          TEXT NOT NULL,          -- ex: "09:00 — 11:30"
  title         TEXT NOT NULL,
  description   TEXT DEFAULT '',
  instructor    TEXT DEFAULT '',
  type          TEXT NOT NULL,          -- spells|tactics|alchemy|ritual|other
  image         TEXT DEFAULT '',
  crystal       BOOLEAN DEFAULT false,
  stars         BOOLEAN DEFAULT false,
  indicators    TEXT[] DEFAULT '{}',
  mana_progress INTEGER DEFAULT 0,
  spots         INTEGER,
  rank          TEXT,
  created_by    UUID REFERENCES admins(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ
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

-- 4. Tabela de postagens / guias do site
CREATE TABLE IF NOT EXISTS posts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  subtitle      TEXT DEFAULT '',
  content       TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'noticias', -- noticias|codice|guias|anuncios|crafting
  author_name   TEXT DEFAULT 'Corpo Docente',
  author_id     UUID REFERENCES admins(id),
  cover_image   TEXT DEFAULT '',
  tags          TEXT[] DEFAULT '{}',
  is_pinned     BOOLEAN DEFAULT false,
  status        TEXT DEFAULT 'published',         -- published|draft|archived
  published_at  TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ
);

-- Seed: tipos padrao de eventos (so insere se a tabela estiver vazia)
INSERT INTO event_types (key, label, color, icon, sort_order)
SELECT * FROM (VALUES
  ('spells',  'Spells (Magias)',     '#1a3a5f', 'Wand2',          0),
  ('tactics', 'Tactics (Táticas)',   '#735c00', 'Swords',         1),
  ('alchemy', 'Alquimia (Alchemy)',  '#059669', 'FlaskConical',   2),
  ('ritual',  'Ritual Sagrado',      '#7e22ce', 'Sparkles',       3),
  ('other',   'Outros',              '#1a3a5f', 'BookOpen',       4)
) AS v(key, label, color, icon, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM event_types LIMIT 1);

-- Seed: postagens iniciais de demonstracao / códice
INSERT INTO posts (slug, title, subtitle, content, category, author_name, cover_image, tags, is_pinned, status)
SELECT * FROM (VALUES
  (
    'codice-de-fundacao',
    'Códice de Fundação: Majestic Battle Academy',
    'Os pilares, diretrizes e valores que regem nossa comunidade acadêmica em Sharlayan.',
    '## Bem-vindo ao Códice de Fundação\n\nA Free Company **Hall of the Novice EX [HoN]** é uma comunidade brasileira de *Final Fantasy XIV* projetada para ser um ambiente de aprendizado seguro, imersivo e totalmente livre de toxicidade.\n\n### Nossos Pilares:\n1. **Ensino Sem Toxicidade:** Aprendizado paciente para conteúdos Extreme, Savage e Ultimate.\n2. **Imersão Temática:** Estrutura acadêmica com Reitoria, Professores e Alunos.\n3. **Polo PT-BR:** Guias traduzidos e didáticos.\n4. **Companheirismo:** Excursões, gincanas e vivência acadêmica.',
    'codice',
    'Reitor Aquilles Romanha',
    'https://images.unsplash.com/photo-1532012164546-f43778669b31?auto=format&fit=crop&w=1200&q=80',
    ARRAY['fundacao', 'codice', 'sharlayan'],
    true,
    'published'
  ),
  (
    'guia-zodiac-weapon',
    'Tratado Completo da Zodiac Weapon',
    'Manual definitivo para forjar sua relíquia de A Realm Reborn passo a passo.',
    '## A Forja da Zodiac Weapon\n\nEste tratado reúne as instruções necessárias para concluir todas as etapas da relíquia Zodiac em A Realm Reborn, desde a arma Relic inicial até a lendária Zeta.\n\n### Etapas Principais:\n- Relic (Base)\n- Zenith (Thavnairian Mist)\n- Atma (FATEs nas áreas de Eorzea)\n- Animus (Trials of the Brave - Books)\n- Novus (Alexandrite & Scroll)\n- Nexus (Light Farming)\n- Zodiac (Quests e Itens Raros)\n- Zeta (Mahatma)',
    'guias',
    'Corpo Docente',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    ARRAY['guias', 'relic', 'arr', 'zodiac'],
    false,
    'published'
  )
) AS v(slug, title, subtitle, content, category, author_name, cover_image, tags, is_pinned, status)
WHERE NOT EXISTS (SELECT 1 FROM posts LIMIT 1);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 6. Politicas RLS para Leitura Publica
DROP POLICY IF EXISTS "Allow public read events" ON events;
CREATE POLICY "Allow public read events" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read event_types" ON event_types;
CREATE POLICY "Allow public read event_types" ON event_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read published posts" ON posts;
CREATE POLICY "Allow public read published posts" ON posts FOR SELECT USING (status = 'published');
