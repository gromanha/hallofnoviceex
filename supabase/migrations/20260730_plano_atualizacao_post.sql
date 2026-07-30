-- ═══════════════════════════════════════════════════════════════
-- Migration: PLANO_ATUALIZACAO_POST — Schema Updates
-- Execute no Supabase SQL Editor (https://supabase.com/dashboard)
-- ═══════════════════════════════════════════════════════════════

-- 1. Adicionar colunas de metadata na tabela posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  reading_time INTEGER DEFAULT 0;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  word_count INTEGER DEFAULT 0;

-- 2. Nova tabela de revisões (versionamento de posts)
CREATE TABLE IF NOT EXISTS post_revisions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     UUID REFERENCES posts(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  revision_n  INTEGER NOT NULL DEFAULT 1,
  created_by  UUID REFERENCES admins(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE post_revisions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para revisões
CREATE POLICY "Admins can read revisions" ON post_revisions
  FOR SELECT USING (true);

CREATE POLICY "Admins can create revisions" ON post_revisions
  FOR INSERT WITH CHECK (true);

-- 3. Criar bucket de storage para imagens do blog
-- Execute manualmente no painel Supabase > Storage > New Bucket:
--
-- Bucket name:  blog-images
-- Public:       true
-- File size limit: 10MB (10485760 bytes)
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif, image/avif
--
-- Depois de criar o bucket, execute as políticas RLS abaixo:

-- Políticas de Storage para blog-images
CREATE POLICY "Public read access for blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own blog images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images'
    AND auth.role() = 'authenticated'
  );

-- ═══════════════════════════════════════════════════════════════
-- Notas:
-- - O bucket 'blog-images' precisa ser criado manualmente no painel
-- - As políticas de storage assumem autenticação via Supabase Auth
-- - Se o upload usa service_role key, as políticas de INSERT/DELETE
--   não se aplicam (service_role bypassa RLS)
-- ═══════════════════════════════════════════════════════════════
