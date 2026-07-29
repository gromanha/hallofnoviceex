# Plano: Importador de Wiki FFXIV com Tradução e Ícones Automáticos

## Visão Geral

Sistema que recebe uma URL da wiki FFXIV, traduz o conteúdo para PT-BR,
detecta menções a itens/quests, busca ícones na XIVAPI, e cria o post
enriquecido no Supabase — tudo gratuito e disponível apenas para admins.

## Fluxo

```
URL da Wiki
    │
    ▼
┌─────────────────┐
│ getWikiPage()   │ ← já existe no ffxiv-api.js
│ Busca conteúdo  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tradução PT-BR  │ ← @vitalets/google-translate-api (gratuito)
│ Preservando MD  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extrair Termos  │ ← detecta nomes de itens/quests
│ do Conteúdo     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ searchItems()   │ ← XIVAPI (já integrada)
│ searchQuests()  │    retorna Icon path
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Incrustar Ícones│ ← ![Nome](https://v2.xivapi.com/i/...)
│ no Markdown     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Criar Post no   │ ← Supabase
│ Supabase        │
└─────────────────┘
```

---

## Dependências

```bash
npm install @vitalets/google-translate-api
# Todas as outras já existem no projeto
```

---

## Arquivos a Criar/Modificar

### 1. `src/lib/translate.js` — Função de tradução

```javascript
import translate from '@vitalets/google-translate-api';

export async function translateMarkdown(text, from = 'en', to = 'pt')
```

**Estratégia de preservação de Markdown:**
1. Substitui blocos especiais (imagens, tabelas, código) por placeholders `§§BLOCK_0§§`
2. Divide texto em frases (máx 4500 chars por chamada — limite da API)
3. Traduz cada lote
4. Restaura placeholders
5. Retorna Markdown traduzido

**Regras de tradução:**
- Imagens `![alt](url)` → preservadas sem tradução
- Links `[text](url)` → traduz só o texto, preserva URL
- Tabelas → traduz células preservando estrutura
- Código/códigos de item → preservados
- Nomes de quests/items FFXIV → mantidos em inglês (termos do jogo)

### 2. `src/lib/icon-enricher.js` — Detector de termos + buscador de ícones

```javascript
export async function enrichWithIcons(markdownContent)
```

**Detecção de termos (regex no Markdown):**
```javascript
/\[([^\]]+)\]\(\/wiki\/[^\)]+\)/g   // links wiki [Termo](/wiki/...)
/\[\[([^\]]+)\]\]/g                  // [[Termo]]
/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g  // Palavras compostas capitalizadas
```

**Processo:**
1. Extrai termos candidatos do conteúdo
2. Para cada termo, busca na XIVAPI (`searchItems` e `searchQuests`)
3. Monta URL do ícone: `https://v2.xivapi.com{i}` (path relativo retornado pela API)
4. Substitui no Markdown com ícone inline

**Formatação do ícone:**
```markdown
![Phantom Sword](https://v2.xivapi.com/i/033000/033400.png) **Phantom Sword**
```

**Otimizações:**
- Cache do XIVAPI (30min TTL) evita buscas repetidas
- Máx 20 termos por post
- Só busca termos com 2+ palavras (evita falsos positivos)
- Busca items E quests em paralelo para o mesmo termo
- Delay 100ms entre termos (rate limit da XIVAPI)

**Fallback:** Se XIVAPI não encontrar o termo, mantém o texto sem ícone.

### 3. `server.js` — Endpoint `POST /api/posts/import`

```javascript
app.post('/api/posts/import', async (req, res) => {
  // 1. Verifica admin (getAdminFromReq)
  // 2. Valida URL (ffxiv.consolegameswiki.com)
  // 3. Busca wiki: getWikiPage(title)
  // 4. Traduz: translateMarkdown(content)
  // 5. Enriquece: enrichWithIcons(translatedContent)
  // 6. Gera metadata (título, subtitle, tags, cover_image)
  // 7. Insere no Supabase
  // 8. Retorna post criado
})
```

**Metadata generation (heurísticas, sem IA):**
- **Título**: Primeiro `# heading` traduzido (máx 200 chars)
- **Subtitle**: Primeira frase do conteúdo (máx 300 chars)
- **Cover image**: Primeira imagem `![](url)` do conteúdo
- **Tags**: Termos mais frequentes que matcharam na XIVAPI + categorias detectadas
- **Category**: Mapeamento por URL (ex: `/wiki/Phantom_Weapons` → `guias`)

### 4. `src/components/ImportWikiModal.tsx` — Modal de importação

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  📥 Importar da Wiki FFXIV                    [X] │
├──────────────────────────────────────────────────┤
│                                                  │
│  URL da Wiki:                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ https://ffxiv.consolegameswiki.com/wik.. │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ⚙️  Opções:                                     │
│  Categoria: [Guias de Combate ▼]                 │
│  Tags:     [phantom, relic, dawntrail]           │
│  Status:   (●) Publicado  ( ) Rascunho           │
│  Ícones:   (☑) Buscar ícones automáticos        │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │  [🔍 Buscar, Traduzir e Enriquecer]      │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ── Preview ──────────────────────────────────   │
│                                                  │
│  📌 Armas Fantasma - Guia Completo Dawntrail     │
│  Subtitle: Tudo sobre as reliquias level 100     │
│                                                  │
│  ![](banner.png)                                │
│                                                  │
│  ![Phantom Sword](icon.png) Armas Fantasma      │
│  são as armas relic level 100 para Dawntrail...  │
│                                                  │
│  Itens encontrados: 23 │ Ícones: 18/23          │
│                                                  │
│  ──────────────────────────────────────────────  │
│                                                  │
│  [Cancelar]         [💾 Rascunho] [🚀 Publicar] │
└──────────────────────────────────────────────────┘
```

**Estados do fluxo:**

| Estado | O que mostra |
|--------|-------------|
| `idle` | Input de URL + opções |
| `fetching` | "Buscando conteúdo da wiki..." |
| `translating` | "Traduzindo para PT-BR..." |
| `enriching` | "Buscando ícones na XIVAPI... (12/23)" |
| `preview` | Preview do post traduzido com ícones |
| `publishing` | "Salvando no Supabase..." |
| `success` | "Post publicado!" + link para ver |

### 5. `src/pages/AdminPage.tsx` — Botão na aba de posts

- Novo botão "📥 Importar da Wiki" ao lado de "➕ Criar Post"
- Abre `<ImportWikiModal />`
- Ao sucesso, refresh da lista de posts

### 6. `src/lib/api.ts` — Função de import

```typescript
export async function apiImportWikiPost(data: {
  url: string;
  category?: string;
  tags?: string[];
  status?: 'published' | 'draft';
  enrichIcons?: boolean;
}): Promise<Post>
```

---

## Detecção de Termos — Exemplo

```
Entrada: "The Phantom Sword can be obtained from Lydirceil 
          in Phantom Village after completing the quest 
          Forging the Phantasmal."

Passo 1 - Extrair termos candidatos:
  → "Phantom Sword"     (compound capitalizado)
  → "Lydirceil"         (compound capitalizado)
  → "Phantom Village"   (compound capitalizado)
  → "Forging the Phantasmal" (link wiki se existir)

Passo 2 - Buscar na XIVAPI:
  searchItems("Phantom Sword")  → ✅ Match! Icon: /i/033000/033400.png
  searchQuests("Forging the Phantasmal") → ✅ Match! Icon: /i/...
  searchItems("Lydirceil")  → ❌ NPC, não item
  searchItems("Phantom Village")  → ❌ Local, não item

Passo 3 - Enriquecer Markdown:
  "The ![](icon.png) Phantom Sword can be obtained..."
```

---

## Segurança

| Medida | Implementação |
|--------|--------------|
| Admin only | `getAdminFromReq()` no endpoint |
| Rate limit | 5 imports/hora/IP |
| URL validation | Regex `^https://ffxiv\.consolegameswiki\.com/wiki/` |
| XIVAPI cache | 30min TTL, max 1000 entries |
| Term limit | Máx 20 buscas XIVAPI por import |
| Input sanitization | `clampStr()` em título/subtitle |
| Timeout | 30s total (wiki + translate + icons) |

---

## Custo Total: $0

| Item | Custo |
|------|-------|
| Tradução (`@vitalets/google-translate-api`) | $0 |
| Ícones XIVAPI (já integrado, cache 30min) | $0 |
| Wiki (já integrada) | $0 |
| Supabase (insert, já no plano) | $0 |

---

## Passos de Implementação

1. Instalar `@vitalets/google-translate-api`
2. Criar `src/lib/translate.js`
3. Criar `src/lib/icon-enricher.js`
4. Criar `POST /api/posts/import` no `server.js`
5. Criar `src/components/ImportWikiModal.tsx`
6. Integrar botão no `AdminPage.tsx`
7. Adicionar `apiImportWikiPost()` no `api.ts`
8. Testar com Phantom Weapons
9. Rodar lint/typecheck
