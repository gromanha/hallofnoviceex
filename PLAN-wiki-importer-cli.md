# Plano: CLI Wiki Importer Local

## ObFetivo

Script Node.js que roda localmente (seu PC), busca wiki, traduz, enriquece com ícones
e salva direto no Supabase — sem depender do Vercel.

## Por que é necessário

A ConsoleGamesWiki bloqueia requests de IPs de cloud providers (Vercel, AWS, GCP).
O fetch server-side falha com 403. O fetch client-side funciona mas depende do browser
estar aberto. Um CLI local elimina ambas as limitações.

## Uso

```bash
# Importar e salvar direto no Supabase
node scripts/wiki-import.js https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons

# Salvar como rascunho, sem ícones
node scripts/wiki-import.js https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons --draft --no-icons

# Exportar JSON (sem salvar no Supabase)
node scripts/wiki-import.js https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons --local-only

# Com tags e categoria customizada
node scripts/wiki-import.js https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons --category guias --tags "phantom,relic"
```

## Arquivos

```
scripts/
  wiki-import.js          # Script principal (ESM, Node 18+)
```

## Dependências

- `@supabase/supabase-js` (já instalada)
- `@vitalets/google-translate-api` (já instalada)
- `dotenv` (já instalada)
- Sem dependências extras

## Fluxo

```
URL da Wiki
    │
    ▼
[1] Fetch wiki page (revisions API, wikitext raw)
    │  ConsoleGamesWiki aceita requests locais
    ▼
[2] Wikitext → Markdown (parser básico)
    │  Remove templates, converte links/headers/bold
    ▼
[3] Traduz EN → PT-BR
    │  @vitalets/google-translate-api (gratuito)
    ▼
[4] Enriquece com ícones XIVAPI
    │  Detecta termos capitalizados, busca ícones
    ▼
[5] Salva no Supabase OU exporta JSON
```

## Estrutura do Output JSON

```json
{
  "title": "Armas Fantasma - Guia Completo Dawntrail",
  "slug": "armas-fantasma-guia-completo-dawntrail",
  "subtitle": "Tudo sobre as reliquias level 100...",
  "content": "# Armas Fantasma\n\n...",
  "category": "guias",
  "cover_image": "https://...",
  "tags": ["phantom", "relic", "dawntrail"],
  "is_pinned": false,
  "status": "draft",
  "published_at": "2026-07-29T...",
  "source_url": "https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons"
}
```

## Flags

| Flag | Descrição | Default |
|------|-----------|---------|
| `--draft` | Salva como rascunho | `published` |
| `--no-icons` | Pula enriquecimento de ícones | com ícones |
| `--category X` | Categoria do post | auto-detect via URL |
| `--tags "a,b"` | Tags separadas por vírgula | `[]` |
| `--local-only` | Exporta JSON, não salva no Supabase | salva no Supabase |

## Configuração (.env)

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Auto-detect de Categoria

| Padrão na URL | Categoria |
|---------------|-----------|
| `phantom_weapons`, `relics` | `guias` |
| `quests` | `noticias` |
| `crafting`, `cooking`, `items` | `receitas` |
| `dungeons`, `raids`, `trials` | `noticias` |

## Limitações

- Tradução é gratuito mas tem rate limit (~100 req/min)
- Ícones XIVAPI: max 20 termos, delay 100ms entre buscas
- Timeout de 30s por operação
- Não faz upload de imagens (mantém URLs da wiki)

## Adicionar ao package.json

```json
"scripts": {
  "wiki-import": "node scripts/wiki-import.js"
}
```

## Implementação

1. Criar `scripts/wiki-import.js` com:
   - Parser de argumentos (process.argv)
   - Fetch wiki via revisions API
   - Conversor wikitext → markdown
   - Tradução EN → PT-BR
   - Enriquecimento de ícones XIVAPI
   - Save no Supabase via service role
   - Export JSON com --local-only
