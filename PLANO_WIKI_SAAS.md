# Plano: Wiki Importer como Serviço no Vercel

## Visão Geral

Transformar a ferramenta local de wiki scraping em um sistema integrado ao site hospedado na Vercel, acessível apenas para admins.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN INTERFACE (React)                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Aba "Wiki Import"                                  │    │
│  │  - Input: URL da wiki                               │    │
│  │  - Toggle: Traduzir (on/off)                        │    │
│  │  - Toggle: Multi-links (on/off)                     │    │
│  │  - Botão: Importar                                  │    │
│  │  - Progress bar + logs em tempo real                │    │
│  │  - Preview do post antes de publicar                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  VERCEL SERVERLESS FUNCTION                  │
│                  api/wiki-import.js                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  1. Validação admin (JWT cookie)                   │    │
│  │  2. Fetch HTML da wiki (sem Puppeteer)              │    │
│  │  3. Parse com cheerio (extrai conteúdo)             │    │
│  │  4. Download imagens → Supabase Storage             │    │
│  │  5. (Opcional) Tradução via Gemini/MS Translator    │    │
│  │  6. Cria post no Supabase                           │    │
│  │  7. Retorna dados do post criado                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Por que NÃO usar Puppeteer no Vercel?

| Problema | Detalhe |
|----------|---------|
| **Tempo limite** | Vercel Serverless: 10s (hobby), 60s (pro). Puppeteer precisa de 10-30s |
| **Sem navegador** | Vercel não inclui Chromium. Precisaria de `@sparticuz/chromium` (~50MB) |
| **Memória** | 1024MB no hobby. Puppeteer + página pesada estoura o limite |
| **Custo** | Cada execução paga. Scraping pesado = custo alto |

**Solução:** Usar `fetch` + `cheerio` (parse HTML leve) em vez de Puppeteer. A maioria das wikis MediaWiki funciona sem JavaScript.

---

## Etapas de Implementação

### 1. API Route: `api/wiki-import.js`

```javascript
// Fluxo:
POST /api/wiki-import
Body: {
  url: "https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons",
  translate: true,        // toggle tradução
  multilinks: true,       // toggle multi-links
  category: "guias",      // categoria do post
  status: "draft"         // draft ou published
}

// Validação:
- Admin autenticado (JWT cookie)
- URL válida do consolegameswiki.com
- Rate limit: 1 importação por minuto por admin

// Processamento:
1. fetch(url) → HTML bruto
2. cheerio.load(html) → parse DOM
3. Extrair: título, subtítulo, conteúdo, imagens
4. Baixar imagens → upload para Supabase Storage
5. Substituir URLs no conteúdo
6. (Se translate) Traduzir via Gemini/MS Translator
7. Criar post no Supabase
8. Retornar { slug, url, imagesCount }
```

### 2. Dependências Novas

```bash
npm install cheerio  # Parse HTML leve (~200KB, sem navegador)
```

### 3. Admin Interface: Nova Aba "Wiki Import"

**Localização:** `src/pages/AdminPage.tsx` — nova aba

**Componentes:**
- `WikiImportTab.tsx` — Aba principal
- `WikiImportProgress.tsx` — Barra de progresso + logs

**Interface:**
```
┌──────────────────────────────────────────────────────┐
│  Wiki Import                                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  URL da Wiki: [________________________________]     │
│                                                      │
│  ┌─ Opções ──────────────────────────────────────┐   │
│  │  [✓] Traduzir para PT-BR (Gemini API)        │   │
│  │  [✓] Multi-links (manter links internos)      │   │
│  │  Categoria: [guias ▼]                         │   │
│  │  Status: [draft ▼]                            │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  [🔍 Buscar e Visualizar]  [📥 Importar]            │
│                                                      │
│  ┌─ Preview ─────────────────────────────────────┐   │
│  │  Título: Phantom Weapons                       │   │
│  │  Subtítulo: Phantom Weapons are the level...   │   │
│  │  Imagens: 314 encontradas                      │   │
│  │  Tabelas: 25                                   │   │
│  │  Tamanho: 621KB                                │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  ┌─ Progresso ───────────────────────────────────┐   │
│  │  [████████████░░░░░░░░] 60%                   │   │
│  │  [✓] HTML capturado (621KB)                   │   │
│  │  [✓] Imagens baixadas (314/314)               │   │
│  │  [→] Traduzindo conteúdo...                   │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 4. Opções Disponíveis

| Opção | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `translate` | Toggle | `false` | Ativar tradução via Gemini/MS Translator |
| `multilinks` | Toggle | `true` | Manter links internos da wiki (converte para absolutos) |
| `category` | Select | `guias` | Categoria do post (noticias/codice/guias/anuncios/crafting) |
| `status` | Select | `draft` | Status inicial (draft/publicado) |
| `rehostImages` | Toggle | `true` | Sempre verdadeiro (wiki bloqueia hotlinking) |

### 5. Estrutura de Arquivos

```
api/
├── wiki-import.js          # API endpoint principal
├── wiki-preview.js         # Preview sem criar post
└── wiki-images.js          # Download de imagem individual (fallback)

src/
├── pages/
│   └── AdminPage.tsx       # Adicionado: aba "Wiki Import"
├── components/
│   └── wiki/
│       ├── WikiImportTab.tsx        # Aba principal
│       ├── WikiImportProgress.tsx   # Progresso + logs
│       └── WikiImportPreview.tsx    # Preview do post

tools/
├── wiki-scraper.mjs        # Mantido para uso local
├── wiki-translator.mjs     # Mantido para uso local
├── wiki-importer.mjs       # Mantido para uso local
└── wiki-pipeline.mjs       # Mantido para uso local
```

---

## Implementação Detalhada

### api/wiki-import.js

```javascript
// POST /api/wiki-import
// Admin-only endpoint

import { getSupabaseAdmin } from '../src/lib/supabase.js';
import { requireAdmin } from '../src/lib/auth.js';
import * as cheerio from 'cheerio';

const WIKI_BASE_URL = 'https://ffxiv.consolegameswiki.com';
const ALLOWED_DOMAINS = ['ffxiv.consolegameswiki.com'];

export default async function handler(req, res) {
  // 1. Validação
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  
  const claims = requireAdmin(req);
  if (!claims) return res.status(401).json({ error: 'unauthorized' });

  const { url, translate, multilinks, category, status } = req.body;
  
  if (!url || !ALLOWED_DOMAINS.some(d => url.includes(d))) {
    return res.status(400).json({ error: 'invalid_url' });
  }

  try {
    // 2. Fetch HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WikiImporter/1.0)',
      },
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    // 3. Parse com Cheerio
    const $ = cheerio.load(html);
    
    // 4. Extrair conteúdo
    const content = extractContent($, multilinks);
    
    // 5. Download imagens → Supabase
    const images = await downloadImages(content.images, content.html);
    
    // 6. Substituir URLs
    let finalHtml = content.html;
    for (const [original, supabase] of images.urlMap) {
      finalHtml = finalHtml.replaceAll(original, supabase);
    }

    // 7. Traduzir (se solicitado)
    if (translate) {
      finalHtml = await translateContent(finalHtml, content.title, content.subtitle);
    }

    // 8. Criar post
    const post = await createPost({
      title: content.title,
      subtitle: content.subtitle,
      content: finalHtml,
      cover_image: images.cover || '',
      category: category || 'guias',
      status: status || 'draft',
      slug: generateSlug(content.title),
      author_name: claims.username,
    });

    return res.json({
      success: true,
      slug: post.slug,
      url: `/post/${post.slug}`,
      imagesCount: images.uploaded,
      title: content.title,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

### AdminPage.tsx — Adicionar aba

```typescript
// Adicionar ao state:
const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'types' | 'recipes' | 'wiki'>('posts');

// Adicionar botão na nav:
<button
  onClick={() => setActiveTab('wiki')}
  className={activeTab === 'wiki' ? 'active' : ''}
>
  <Globe className="w-4 h-4" /> Wiki Import
</button>

// Adicionar renderização:
{activeTab === 'wiki' && <WikiImportTab />}
```

---

## Segurança

| Medida | Implementação |
|--------|---------------|
| **Autenticação** | JWT cookie `hon_admin` (mesmo sistema existente) |
| **Rate limiting** | 1 importação/min por admin (in-memory ou Supabase) |
| **Whitelist de domínios** | Apenas `ffxiv.consolegameswiki.com` |
| **Tamanho máximo** | HTML: 5MB. Imagens: 10MB cada |
| **Timeout** | 30s por requisição |
| **CORS** | Mesmo domínio (Vercel) |

---

## Orçamento de Tempo

| Tarefa | Tempo |
|--------|-------|
| Instalar cheerio | 5min |
| Criar `api/wiki-import.js` | 2h |
| Criar `api/wiki-preview.js` | 30min |
| Criar `WikiImportTab.tsx` | 2h |
| Criar `WikiImportProgress.tsx` | 1h |
| Criar `WikiImportPreview.tsx` | 30min |
| Integrar ao AdminPage.tsx | 30min |
| Testes e ajustes | 1h |
| **Total** | **~7h** |

---

## Deploy

1. Criar branch `feature/wiki-import`
2. Implementar todas as mudanças
3. Testar localmente (`npm run dev`)
4. Commit e push
5. Vercel faz deploy automático
6. Testar em produção
7. Merge para `main`
