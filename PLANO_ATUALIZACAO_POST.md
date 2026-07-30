# Plano de Atualização: Sistema de Postagem + Página de Post
## Opção B — Editor TipTap (MIT, 22.7K stars, 100+ extensões)

---

## Diagnóstico Rápido

| Necessidade | Atual | Solução Importada |
|-------------|-------|-------------------|
| Editor WYSIWYG | `<textarea>` + Markdown | **TipTap** (MIT, 22.7K stars) |
| Upload de imagens | URL manual | **react-dropzone** (5.6KB) + **react-easy-crop** (12KB) + **Supabase Storage** |
| Auto-save | Inexistente | **localStorage** com debounce (sem lib externa) |
| Barra de progresso | Inexistente | **@usefy/scroll-progress** (2KB) |
| TOC automático | Inexistente | **use-toc** (headless hook, copiar no projeto) |
| Reading time | Inexistente | **reading-time** (5KB) |
| Compartilhamento | Só copiar URL | **react-share** v5 (25+ redes, tree-shakeable) |
| SEO/OG tags | Inexistente | **react-helmet-async** (15KB) |
| Syntax highlight | Inexistente | **react-shiki** (VS Code engine) |
| UI base (cards, badges, etc.) | Tailwind manual | **shadcn/ui** (zero bundle, copy-paste) |

---

## Por que TipTap?

- Maior ecossistema de extensões do mercado (100+)
- Headless: UI completamente customizável com Tailwind
- Battle-tested: GitLab, Substack, Atlassian usam
- MIT license, gratuito para uso comercial
- Melhor opção se precisar de extensões futuras (colaboração, mentions, emojis, etc.)
- Markdown I/O via `@tiptap/extension-markdown`

**Trade-off:** UI do editor é construída por nós (2-4 semanas), mas com componentes shadcn/ui prontos o esforço reduz para ~1 semana.

---

## Dependências a Instalar

```bash
# Editor Rich Text — TipTap
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
npm install @tiptap/extension-image @tiptap/extension-link
npm install @tiptap/extension-placeholder @tiptap/extension-table
npm install @tiptap/extension-table-row @tiptap/extension-table-cell
npm install @tiptap/extension-table-header @tiptap/extension-code-block-lowlight
npm install @tiptap/extension-highlight @tiptap/extension-text-align
npm install @tiptap/extension-underline @tiptap/extension-strike
npm install @tiptap/extension-typography @tiptap/extension-markdown
npm install @tiptap/extension-dropcursor @tiptap/extension-gapcursor
npm install lowlight

# Upload de imagens
npm install react-dropzone react-easy-crop

# Blog UI e utilidades
npm install react-share reading-time react-helmet-async react-shiki

# shadcn/ui (componentes copiados, zero bundle)
npx shadcn@latest add card avatar badge button separator tabs
npx shadcn@latest add breadcrumb tooltip progress dialog
npx shadcn@latest add dropdown-menu scroll-area
```

### Resumo de Bundle

| Pacote | Gzip | Função |
|--------|------|--------|
| TipTap (core + extensões) | ~245KB | Editor WYSIWYG |
| react-dropzone | 5.6KB | Drag & drop |
| react-easy-crop | 12KB | Crop de imagem |
| react-share | ~10KB | Botões de compartilhamento |
| reading-time | 5KB | Tempo de leitura |
| @usefy/scroll-progress | 2KB | Barra de progresso |
| react-helmet-async | 15KB | Meta tags SEO |
| react-shiki | ~12KB (lazy load) | Syntax highlighting |
| shadcn/ui | 0KB (source) | UI primitives |
| **Total** | **~307KB** | |

---

## Estrutura de Arquivos

```
src/
├── components/
│   ├── editor/
│   │   ├── TipTapEditor.tsx          — Editor principal TipTap
│   │   ├── EditorToolbar.tsx         — Toolbar de formatação
│   │   ├── FloatingToolbar.tsx       — Menu flutuante na seleção
│   │   ├── ImagePickerDialog.tsx     — Dialog: upload ou URL
│   │   ├── LinkDialog.tsx            — Dialog para inserir/editar links
│   │   ├── TableMenu.tsx             — Controles de tabela
│   │   └── extensions.ts             — Configuração centralizada TipTap
│   ├── blog/
│   │   ├── ReadingProgressBar.tsx    — @usefy/scroll-progress
│   │   ├── TableOfContents.tsx       — use-toc (headless hook)
│   │   ├── ShareButtons.tsx          — react-share
│   │   ├── ReadingTimeBadge.tsx      — reading-time
│   │   ├── PostNavigation.tsx        — Anterior/Próximo
│   │   └── CodeBlock.tsx             — react-shiki wrapper
│   ├── ui/                           — shadcn/ui (copiados)
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── separator.tsx
│   │   ├── tabs.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── tooltip.tsx
│   │   ├── progress.tsx
│   │   └── scroll-area.tsx
│   ├── PostCard.tsx                  — Atualizado com shadcn/ui Card
│   ├── PostModal.tsx                 — Atualizado com TipTapEditor
│   └── ConfirmDialog.tsx             — Atualizado com shadcn/ui Dialog
├── pages/
│   ├── PostDetailPage.tsx            — Completo com TOC + progress + share
│   ├── AcademiaPage.tsx              — Atualizado
│   └── AdminPage.tsx                 — Atualizado
├── lib/
│   ├── useToc.ts                     — Headless TOC hook (copiar)
│   ├── useAutoSave.ts                — Auto-save via localStorage
│   ├── uploadImage.ts                — Upload para Supabase Storage
│   ├── sanitize.ts                   — Atualizado para TipTap HTML
│   └── extensions.ts                 — Extensões TipTap centralizadas
└── hooks/
    └── useImageUpload.ts             — Hook: dropzone + crop + upload
```

---

## Fase 1 — Editor TipTap (setup: ~2-3h)

### Passo 1: Criar `src/components/editor/extensions.ts`

Centraliza todas as extensões TipTap em um único arquivo:

```typescript
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Typography from '@tiptap/extension-typography'
import Dropcursor from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

export const defaultExtensions = [
  StarterKit.configure({
    codeBlock: false, // usa CodeBlockLowlight
  }),
  Image.configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: { class: 'wiki-image', loading: 'lazy' },
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: { class: 'text-[var(--color-primary)] underline' },
  }),
  Placeholder.configure({
    placeholder: 'Comece a escrever seu artigo...',
  }),
  Table.configure({ resizable: true }),
  TableRow,
  TableCell,
  TableHeader,
  CodeBlockLowlight.configure({ lowlight }),
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Underline,
  Strike,
  Typography,
  Dropcursor.configure({ color: 'var(--color-primary)', width: 2 }),
  Gapcursor,
]
```

### Passo 2: Criar `src/components/editor/TipTapEditor.tsx`

Componente principal do editor:

```tsx
// Props: content (string), onChange (callback), placeholder, editable
// Usa useEditor() do @tiptap/react com as extensions de extensions.ts
// Renderiza EditorContent com toolbar flutuante
// Exporta conteúdo como HTML via editor.getHTML()
// Importa Markdown via editor.commands.setContent() + markdown extension
```

### Passo 3: Criar `src/components/editor/EditorToolbar.tsx`

Toolbar fixa no topo do editor:

```tsx
// Botões agrupados por categoria:
// Texto: Bold (Ctrl+B), Italic (Ctrl+I), Underline (Ctrl+U), Strike (Ctrl+Shift+S), Code (Ctrl+E)
// Títulos: H1, H2, H3, H4
// Listas: Bullet (Ctrl+Shift+8), Ordered (Ctrl+Shift+7), Task List
// Block: Blockquote (Ctrl+Shift+B), Code Block, Horizontal Rule
// Tabela: Insert table, Add/delete row/col
// Mídia: Image (abre ImagePickerDialog), Link (abre LinkDialog, Ctrl+K)
// Alinhamento: Left, Center, Right, Justify
// Desfazer/Refazer: Undo (Ctrl+Z), Redo (Ctrl+Shift+Z)
// Cada botão usa Lucide icons (já no projeto)
// Tooltips via shadcn/ui Tooltip
```

### Passo 4: Criar `src/components/editor/FloatingToolbar.tsx`

Menu que aparece ao selecionar texto:

```tsx
// Posicionamento via FloatingUI (@floating-ui/react)
// Botões compactos: Bold, Italic, Underline, Strike, Code, Link, Highlight
// Aparece apenas quando há seleção de texto
```

### Passo 5: Criar `src/components/editor/LinkDialog.tsx`

Dialog para inserir/editar links:

```tsx
// shadcn/ui Dialog
// Campos: URL do link, Texto do link, Abrir em nova aba (checkbox)
// Validação de URL
// Botões: Inserir, Cancelar, Remover link
```

### Passo 6: Criar `src/components/editor/TableMenu.tsx`

Menu de controles de tabela:

```tsx
// Aparece quando cursor está dentro de uma tabela
// Botões: Adicionar linha acima/abaixo, Adicionar coluna esquerda/direita
// Remover linha, Remover coluna, Remover tabela
// Merge cells (futuro)
```

### Passo 7: Atualizar `src/components/PostModal.tsx`

Substituir o textarea pelo TipTapEditor:

```tsx
// Trocar <textarea> por <TipTapEditor content={content} onChange={setContent} />
// Manter aba de "Pré-visualização" usando renderMarkdown()
// Adicionar ImagePickerDialog acessível da toolbar
// Manter todos os campos existentes (título, subtítulo, categoria, etc.)
```

---

## Fase 2 — Upload de Imagens (3-4h)

### Passo 1: Configurar Supabase Storage

```sql
-- Criar bucket 'blog-images' no painel Supabase > Storage
-- Configurar como público
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif, image/avif

-- Políticas RLS:
-- Leitura pública para todos
-- Upload apenas para usuários autenticados (admins)
-- Delete apenas para o autor da imagem
```

### Passo 2: Criar `src/hooks/useImageUpload.ts`

Hook que combina dropzone + crop + upload:

```typescript
// 1. useDropzone (react-dropzone) — aceita image/*
// 2. Estado para preview da imagem
// 3. Estado para dados do crop (react-easy-crop)
// 4. Função upload: aplica crop via canvas → envia ao Supabase Storage
// 5. Retorna URL pública da imagem
// 6. Suporte a drag & drop, clique, e Ctrl+V (colar)
```

### Passo 3: Criar `src/components/editor/ImagePickerDialog.tsx`

Dialog shadcn/ui com duas abas:

```tsx
// Aba 1: Upload
//   - Área de drag & drop (react-dropzone)
//   - Preview da imagem selecionada
//   - Cropper (react-easy-crop) com zoom e rotação
//   - Botão "Enviar"
//
// Aba 2: URL
//   - Campo de texto para colar URL externa
//   - Preview da imagem da URL
//   - Botão "Inserir"
```

### Passo 4: Integrar upload no editor

```tsx
// TipTapEditor.tsx: quando usuário cola imagem (Ctrl+V), detectar e enviar ao Supabase
// EditorToolbar.tsx: botão de imagem abre ImagePickerDialog
// Após upload, inserir imagem no editor via editor.chain().focus().setImage({ src: url }).run()
```

### Passo 5: Upload de cover image no PostModal

```tsx
// Substituir campo de URL por componente de upload
// Usar mesmo useImageUpload hook
// Preview da imagem de capa
// Botão para remover capa
```

---

## Fase 3 — Página de Post Melhorada (4-5h)

### Passo 1: Barra de Progresso de Leitura

```tsx
// src/components/blog/ReadingProgressBar.tsx
// Usa @usefy/scroll-progress
// Barra fixa no topo da viewport
// Cor: var(--color-primary) com gradiente
// Animação suave via CSS transition
```

### Passo 2: Table of Contents Automático

```tsx
// src/components/blog/TableOfContents.tsx
// Gera TOC a partir dos h2 e h3 do conteúdo renderizado
// Usa IntersectionObserver para detectar heading atual
// Desktop: sidebar fixa à esquerda do conteúdo
// Mobile: drawer ou seção colapsável abaixo do título
// Smooth scroll ao clicar
// Highlight do item atual via IntersectionObserver
```

### Passo 3: Badge de Reading Time

```tsx
// src/components/blog/ReadingTimeBadge.tsx
// Usa reading-time para calcular tempo estimado
// Exibe "5 min de leitura" no header do post
// Badge com ícone Clock do Lucide
```

### Passo 4: Botões de Compartilhamento

```tsx
// src/components/blog/ShareButtons.tsx
// Usa react-share v5
// Botões: Twitter/X, Facebook, WhatsApp, Telegram, LinkedIn, Copiar link
// Layout: horizontal com ícones
// Pop-up de compartilhamento (padrão react-share)
```

### Passo 5: Syntax Highlighting

```tsx
// src/components/blog/CodeBlock.tsx
// Usa react-shiki para syntax highlighting
// Tema: VS Code Dark+ (ou Dracula)
// Integrado no renderMarkdown() do sanitize.ts
// Detecção automática de linguagem
```

### Passo 6: Meta Tags SEO

```tsx
// src/pages/PostDetailPage.tsx
// Usa react-helmet-async (HelmetProvider no App.tsx)
// Define dinamicamente:
//   - <title>: "{título do post} | Hall of the Novice EX"
//   - <meta name="description">: subtítulo ou primeiros 160 chars
//   - <meta property="og:title">: título do post
//   - <meta property="og:description">: subtítulo
//   - <meta property="og:image">: cover_image
//   - <meta property="og:type">: article
//   - <meta property="og:url">: URL atual
//   - <meta name="twitter:card">: summary_large_image
//   - <meta name="twitter:title">: título
//   - <meta name="twitter:description">: subtítulo
//   - <meta name="twitter:image">: cover_image
```

### Passo 7: Navegação entre Posts

```tsx
// src/components/blog/PostNavigation.tsx
// Busca posts anteriores e posteriores da mesma categoria
// Renderiza dois botões: "← Post Anterior" e "Próximo Post →"
// Cards clicáveis com título e data
// Posicionado na parte inferior do post, antes das tags
```

---

## Fase 4 — Auto-save e Status (2h)

### Passo 1: Auto-save

```tsx
// src/lib/useAutoSave.ts

// Hook que:
// 1. Salva todos os campos do formulário no localStorage com debounce 3s
// 2. Chave: post-draft-{postId} ou post-draft-new
// 3. Ao reabrir modal: recupera dados do localStorage
// 4. Ao salvar publicamente: limpa draft do localStorage
// 5. Ao fechar modal com dados não salvos: exibe confirmação
// 6. Limpa drafts antigos (>7 dias) automaticamente
```

### Passo 2: Status Arquivado

```tsx
// AdminPage.tsx:
//   - Adicionar filtro "Arquivado" no seletor de status
//   - Mostrar contagem de posts arquivados
//
// PostModal.tsx:
//   - Adicionar botão "Arquivar" no toggle de status
//   - Botão visível apenas ao editar post existente
//   - Arquivado = status 'archived' (já existe no schema)
```

---

## Fase 5 — Schema do Banco de Dados (1h)

```sql
-- 1. Adicionar colunas na tabela posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  reading_time INTEGER DEFAULT 0;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  word_count INTEGER DEFAULT 0;

-- 2. Nova tabela de revisões (versionamento)
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

-- 3. Criar bucket de storage (via painel Supabase)
-- Bucket: blog-images
-- Público: true
-- Limite: 10MB
-- Tipos: image/jpeg, image/png, image/webp, image/gif, image/avif
```

---

## Fase 6 — Atualizar API (server.js)

```javascript
// Novas rotas:
POST   /api/upload              — Upload de imagens para Supabase Storage
GET    /api/posts/:id/revisions — Listar revisões de um post
POST   /api/posts/:id/revisions — Criar revisão manual
POST   /api/posts/:id/revisions/:revId/restore — Restaurar revisão

// PATCH /api/posts modificado para aceitar:
//   - reading_time (integer)
//   - word_count (integer)
//   - status: 'archived' (adicionar ao enum)
```

---

## Ordem de Implementação

| Passo | Tempo Est. | Fase | O que |
|-------|-----------|------|-------|
| 1 | 30min | Infra | Instalar todas as dependências |
| 2 | 1h | Editor | Criar extensions.ts + TipTapEditor.tsx |
| 3 | 1h | Editor | Criar EditorToolbar.tsx com todos os botões |
| 4 | 30min | Editor | Criar FloatingToolbar.tsx (menu de seleção) |
| 5 | 30min | Editor | Criar LinkDialog.tsx + TableMenu.tsx |
| 6 | 1h | Editor | Substituir textarea no PostModal + testar |
| 7 | 30min | Upload | Configurar Supabase Storage + RLS |
| 8 | 1h | Upload | Criar useImageUpload hook |
| 9 | 1h | Upload | Criar ImagePickerDialog + integrar no editor |
| 10 | 15min | Blog | Criar ReadingProgressBar.tsx |
| 11 | 15min | Blog | Criar ReadingTimeBadge.tsx |
| 12 | 1h | Blog | Criar TableOfContents.tsx (use-toc) |
| 13 | 30min | Blog | Criar ShareButtons.tsx (react-share) |
| 14 | 30min | Blog | Criar CodeBlock.tsx (react-shiki) |
| 15 | 30min | Blog | Adicionar SEO meta tags (react-helmet-async) |
| 16 | 1h | Blog | Criar PostNavigation.tsx |
| 17 | 30min | Gestão | Criar useAutoSave hook |
| 18 | 30min | Gestão | Adicionar status arquivado + schema updates |
| 19 | 1h | API | Criar endpoints de upload e revisões em server.js |
| 20 | 1h | Testes | Testes gerais, ajustes, e polish |
| **Total** | **~14h** | | |

---

## Importado vs Construído

### Importado (pronto, testado, mantido)
- Editor WYSIWYG → **TipTap** (22.7K stars, GitLab, Substack)
- Upload/Drag-drop → **react-dropzone** (12.5M downloads/semana)
- Crop de imagem → **react-easy-crop** (8.8K stars)
- Barra de progresso → **@usefy/scroll-progress** (2KB)
- Reading time → **reading-time** (5KB)
- Share buttons → **react-share** v5 (25+ redes)
- SEO meta tags → **react-helmet-async** (15KB)
- Syntax highlighting → **react-shiki** (VS Code engine)
- UI base → **shadcn/ui** (Card, Dialog, Badge, etc.)
- TOC hook → **use-toc** (headless, copiar no projeto)

### Construído (código próprio, integração)
- `extensions.ts` (~60 linhas) — configuração centralizada TipTap
- `TipTapEditor.tsx` (~80 linhas) — wrapper do editor
- `EditorToolbar.tsx` (~150 linhas) — toolbar com Lucide icons
- `FloatingToolbar.tsx` (~60 linhas) — menu de seleção
- `ImagePickerDialog.tsx` (~100 linhas) — dialog upload/URL
- `LinkDialog.tsx` (~60 linhas) — dialog de links
- `TableMenu.tsx` (~50 linhas) — controles de tabela
- `useImageUpload.ts` (~80 linhas) — hook upload
- `useAutoSave.ts` (~40 linhas) — hook auto-save
- `useToc.ts` (~50 linhas) — hook TOC (copiar e adaptar)
- `ReadingProgressBar.tsx` (~20 linhas) — wrapper simples
- `ReadingTimeBadge.tsx` (~30 linhas) — wrapper simples
- `ShareButtons.tsx` (~40 linhas) — wrapper react-share
- `CodeBlock.tsx` (~30 linhas) — wrapper react-shiki
- `PostNavigation.tsx` (~60 linhas) — navegação
- Atualizações no PostModal, PostDetailPage, AdminPage, server.js

**Redução de esforço:** ~75% do código é importação de libs testadas, ~25% é integração entre elas.

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| TipTap quebra com React 19 | Usar `immediatelyRender: false` no useEditor (documentado oficialmente) |
| Conteúdo Markdown existente corrompido na migração | Converter ao abrir modal via @tiptap/extension-markdown, manter Markdown como fallback no renderMarkdown() |
| Upload de imagens grandes lentos | Limitar 5MB client-side, compressão via canvas antes do upload |
| localStorage quota excedida | Limitar auto-save a 500KB, limpar drafts antigos (>7 dias) |
| Revisions consumindo storage | Manter últimas 20 revisões por post, purgar automaticamente |
| Bundle size cresce com extensões | Usar dynamic imports para extensões pesadas (table, code-block) |
