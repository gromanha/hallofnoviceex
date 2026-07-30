# Plano: Sistema de Captura, Tradução e Importação de Wiki FFXIV

## Visão Geral

Pipeline de 3 etapas que roda localmente no seu computador:
1. **Scraper** — Captura HTML completo de uma wiki page (texto, imagens, tabelas, formatação)
2. **Tradutor** — Traduz o conteúdo para PT-BR via Gemini API (gratuita)
3. **Importador** — Cria o post no Supabase via API existente, pronto para exibir no site

---

## Análise do Sistema Atual

### Como funcionam os posts (descoberto na análise)

| Campo | Tipo | Observação |
|-------|------|------------|
| `slug` | TEXT UNIQUE | URL-friendly, gerado a partir do título |
| `title` | TEXT | Título do post |
| `subtitle` | TEXT | Resumo curto exibido no card |
| `content` | TEXT | **HTML ou Markdown** — `renderMarkdown()` detecta automaticamente |
| `category` | TEXT | `noticias`, `codice`, `guias`, `crafting`, `anuncios` |
| `cover_image` | TEXT | URL da imagem de capa |
| `tags` | TEXT[] | Array de tags |
| `status` | TEXT | `published`, `draft`, `archived` |
| `author_name` | TEXT | Nome do autor |

### Como o conteúdo é renderizado (`src/lib/sanitize.ts`)
- Auto-detecta se o conteúdo é HTML ou Markdown
- HTML: sanitiza com DOMPurify e renderiza direto
- Markdown: converte via `marked.parse()` + DOMPurify
- **Imagens wiki já funcionam**: o sanitize.ts já corrige URLs relativas como `src="/mediawiki/..."` para URLs absolutas do consolegameswiki.com
- Tabelas recebem classe `wiki-table` automaticamente
- Imagens recebem `loading="lazy"` e wrapper `<figure class="wiki-image">`

### Upload de imagens
- Bucket `blog-images` no Supabase Storage (público)
- Endpoint `POST /api/upload` recebe base64 e retorna URL pública
- Limite: 10MB por arquivo

### JSON de exemplo existente (`phantom-weapons.json`)
- Já contém HTML completo da wiki como `content`
- Já contém `cover_image` apontando para URL do consolegameswiki
- Confirma que o site aceita HTML cru da wiki como conteúdo

---

## Etapa 1: Scraper Local (Node.js + Puppeteer)

### Por que Puppeteer?
- A wiki usa MediaWiki com JavaScript (toc toggle, lazy loading, ads)
- Precisa executar JS para obter o conteúdo completo renderizado
- Puppeteer é gratuito e roda localmente

### Ferramentas necessárias
```bash
npm install puppeteer  # ~170MB, inclui Chromium
```

### Script: `tools/wiki-scraper.mjs`

```
Entrada: URL da wiki (ex: https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons)
Saída: JSON com dados prontos para tradução
```

#### O que o scraper captura:

1. **Título** — `h1.firstHeading .mw-page-title-main`
2. **Subtítulo** — Primeiro parágrafo após o título (resumo da página)
3. **Cover Image** — Primeira imagem `<figure>` ou banner do topo
4. **Conteúdo HTML completo** — `div.mw-parser-output` (todo o conteúdo da wiki)
5. **Todas as imagens** — Extrai `src` de todas as `<img>` dentro do conteúdo
6. **Tabelas** — já vêm como HTML, preservadas nativamente
7. **Links internos** — Convertidos para URLs absolutas do consolegameswiki
8. **Ícones inline** — `<span class="icon-label-container">` preservados

#### Processamento do HTML capturado:

```javascript
// 1. Extrair conteúdo principal
const content = document.querySelector('div.mw-parser-output')

// 2. Remover elementos indesejados (ads, TOC, nav boxes)
content.querySelectorAll('.toc, .mw-empty-elt, .hatnote, script, style, .ad-slot, [data-fuse]').forEach(el => el.remove())

// 3. Converter URLs relativas para absolutas
// src="/mediawiki/images/..." → src="https://ffxiv.consolegameswiki.com/mediawiki/images/..."
// href="/wiki/..." → href="https://ffxiv.consolegameswiki.com/wiki/..."

// 4. Extrair todas as imagens para download posterior
const images = [...content.querySelectorAll('img')].map(img => ({
  originalUrl: img.src,      // URL completa da imagem
  alt: img.alt,
  width: img.width,
  height: img.height,
}))

// 5. Gerar slug a partir do título
const slug = title.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '')

// 6. Montar JSON de saída
{
  title,              // ex: "Phantom Weapons"
  slug,               // ex: "phantom-weapons"
  subtitle,           // ex: "Phantom Weapons are the level 100 Relic Weapons..."
  content,            // HTML completo da wiki
  cover_image,        // URL da primeira imagem/banner
  images,             // Array de todas as imagens encontradas
  source_url,         // URL original da wiki
  category: "guias",  // Categoria padrão (ajustável)
  tags: [],           // Tags extraídas da wiki (categorias)
}
```

#### Interface CLI:

```bash
node tools/wiki-scraper.mjs https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons

# Saída: tools/output/phantom-weapons-raw.json
# Log: "Capturado: Phantom Weapons (15 imagens, 48KB de HTML)"
```

---

## Etapa 2: Tradutor (Gemini API — Gratuita)

### Por que Gemini API?
- **Gratuita**: 15 RPM / 1M tokens/dia no tier gratuito
- **Qualidade**: Traduz contexto técnico de FFXIV muito bem
- **Já configurada**: Você já tem `GEMINI_API_KEY` no `.env`
- **Suporta HTML**: Pode receber e retornar HTML preservando tags

### Script: `tools/wiki-translator.mjs`

#### Estratégia de tradução:

1. **Traduzir texto visível** — Parágrafos, títulos, listas, legendas
2. **NÃO traduzir** — Nomes de itens, skills, NPCs, locais (mantém em inglês com nota)
3. **Preservar HTML** — Tags, classes, estrutura de tabelas intactas
4. **Preservar URLs** — Links e src de imagens não alterados
5. **Preservar ícones** — Tags `<span class="icon-label-container">` intactas

#### Processo:

```javascript
// 1. Ler JSON bruto do scraper
const rawData = JSON.parse(fs.readFileSync('tools/output/phantom-weapons-raw.json'))

// 2. Preparar prompt para Gemini
const prompt = `
Traduza o seguinte conteúdo HTML de uma wiki de Final Fantasy XIV para Português do Brasil (PT-BR).

REGRAS:
- Traduza TODO o texto visível para PT-BR
- NÃO traduza nomes de: itens, habilidades, NPCs, locais,achievements, nomes próprios de FFXIV
- Preservar PERFEITAMENTE todas as tags HTML, classes CSS, e atributos
- Preservar todas as URLs (src, href) inalteradas
- Preservar todos os ícones inline (<span class="icon-label-container">)
- Preservar a formatação de tabelas
- Para termos técnicos do jogo, use o formato: "Nome em PT-BR (Nome Original)"
- Seja natural na tradução, não literal

Conteúdo HTML:
${rawData.content}

Retorne APENAS o HTML traduzido, sem explicações adicionais.
`

// 3. Enviar para Gemini API
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,  // Baixa temperatura = mais fiel
        maxOutputTokens: 65536,
      }
    })
  }
)

// 4. Extrair HTML traduzido da resposta
const translatedHtml = response.candidates[0].content.parts[0].text

// 5. Traduzir título e subtítulo separadamente (mais controle)
const titlePtBr = await translateText(rawData.title)
const subtitlePtBr = await translateText(rawData.subtitle)

// 6. Salvar JSON traduzido
const translatedData = {
  ...rawData,
  title: titlePtBr,
  subtitle: subtitlePtBr,
  content: translatedHtml,
  translated: true,
  translated_at: new Date().toISOString(),
}
```

#### Tratamento de páginas longas:

Páginas como Phantom Weapons podem ter 100KB+ de HTML. A Gemini API aceita até 1M tokens de input. Caso o conteúdo exceda:

```javascript
// Dividir por seções (h2) e traduzir cada uma separadamente
function splitBySections(html) {
  // Divide o HTML nos marcadores <h2>...</h2>
  // Retorna array de blocos HTML menores
}

// Traduzir cada bloco e reconcatenar
const sections = splitBySections(rawData.content)
const translatedSections = []
for (const section of sections) {
  const translated = await translateSection(section)
  translatedSections.push(translated)
}
const fullTranslatedHtml = translatedSections.join('\n')
```

#### Interface CLI:

```bash
node tools/wiki-translator.mjs tools/output/phantom-weapons-raw.json

# Saída: tools/output/phantom-weapons-translated.json
# Log: "Traduzido: Phantom Weapons (48KB → 52KB, 15 imagens preservadas)"
```

---

## Etapa 3: Importador para o Site (Supabase API)

### Script: `tools/wiki-importer.mjs`

#### Processo:

```javascript
// 1. Ler JSON traduzido
const data = JSON.parse(fs.readFileSync('tools/output/phantom-weapons-translated.json'))

// 2. Upload de imagens para Supabase Storage (opcional)
//    Pode manter URLs do consolegameswiki ou hospedar localmente
const shouldHostImages = false // true = baixar e re-hospedar no Supabase

if (shouldHostImages) {
  for (const img of data.images) {
    const downloaded = await downloadImage(img.originalUrl)
    const uploaded = await uploadToSupabase(downloaded, img.alt)
    // Substituir URLs no conteúdo HTML
    data.content = data.content.replaceAll(img.originalUrl, uploaded.url)
  }
}

// 3. Criar post via API existente (POST /api/posts)
const postPayload = {
  title: data.title,
  subtitle: data.subtitle,
  content: data.content,          // HTML completo traduzido
  category: data.category || 'guias',
  author_name: 'Corpo Docente',
  cover_image: data.cover_image,  // URL do consolegameswiki ou Supabase
  tags: data.tags.length > 0 ? data.tags : ['ffxiv', 'dawntrail', 'relic'],
  is_pinned: false,
  status: 'published',            // ou 'draft' para revisar antes
  slug: data.slug,
}

// 4. Autenticar com JWT
const jwt = await loginAsAdmin() // Usa SETUP_TOKEN ou credenciais existentes

// 5. Enviar para a API
const response = await fetch(`${APP_URL}/api/posts`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `admin_token=${jwt}`,
  },
  body: JSON.stringify(postPayload),
})

// 6. Resultado
const post = await response.json()
console.log(`Post criado: ${APP_URL}/post/${post.slug}`)
```

#### Decisão sobre imagens:

| Opção | Prós | Contras |
|-------|------|---------|
| **Manter URLs do wiki** | Sem upload, rápido, sem usar storage | Se wiki mudar, imagens quebram |
| **Re-hospedar no Supabase** | Independente, backup local | Upload demorado, storage usado |

**Recomendação**: Manter URLs do wiki no início (mais simples), migrar depois se necessário.

#### Interface CLI:

```bash
node tools/wiki-importer.mjs tools/output/phantom-weapons-translated.json

# Pergunta: "Publicar como (published/draft)? [draft]: "
# Pergunta: "Categoria (guias/codice/noticias)? [guias]: "
# Saída: "Post criado com sucesso: https://seusite.com/post/phantom-weapons"
```

---

## Script Unificado (One-Shot)

### `tools/wiki-pipeline.mjs`

Executa todas as 3 etapas de uma vez:

```bash
# Modo completo: scrape → traduz → importa
node tools/wiki-pipeline.mjs https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons

# Modo apenas scrape + traduz (sem importar)
node tools/wiki-pipeline.mjs https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons --no-import

# Modo apenas importar (já tem JSON traduzido)
node tools/wiki-pipeline.mjs --import tools/output/phantom-weapons-translated.json

# Batch: múltiplas URLs
node tools/wiki-pipeline.mjs --batch urls.txt
```

---

## Sistema de Feedback e Progresso

Cada script deve fornecer feedback claro e visual no terminal para que o usuário saiba exatamente:
- **Qual etapa está sendo executada**
- **Progresso atual** (ex: "3 de 8 imagens baixadas")
- **Se houve sucesso ou falha** em cada etapa
- **Tempo decorrido** em cada etapa
- **Resumo final** com todos os resultados

### Biblioteca: `tools/utils/logger.mjs`

Módulo centralizado de logging que todos os scripts importam:

```javascript
// Cores e formatação no terminal (sem dependências externas)
const COLORS = {
  reset:   '\x1b[0m',
  bright:  '\x1b[1m',
  dim:     '\x1b[2m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
}

// Ícones visuais (sem emoji, compatível com qualquer terminal)
const ICONS = {
  step:    '[▶]',
  success: '[✓]',
  error:   '[✗]',
  warn:    '[!]',
  info:    '[i]',
  progress:'[→]',
  timer:   '[⏱]',
}

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

class Logger {
  constructor() {
    this.steps = []
    this.currentStep = null
    this.startTime = Date.now()
  }

  // Início de uma etapa principal
  step(name) {
    this.currentStep = { name, startTime: Date.now(), substeps: [] }
    console.log()
    console.log(`${COLORS.cyan}${ICONS.step} ${COLORS.bright}${name}${COLORS.reset}`)
    console.log(`${COLORS.dim}${'─'.repeat(50)}${COLORS.reset}`)
  }

  // Substep dentro de uma etapa (ex: "Baixando imagem 3/15")
  substep(message) {
    const elapsed = Date.now() - this.currentStep.startTime
    console.log(`  ${COLORS.dim}${ICONS.progress} ${COLORS.reset}${message} ${COLORS.dim}(${formatTime(elapsed)})${COLORS.reset}`)
  }

  // Progresso com porcentagem (ex: barra de progresso)
  progress(current, total, label = '') {
    const pct = Math.round((current / total) * 100)
    const filled = Math.round(pct / 5)
    const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
    const elapsed = Date.now() - this.currentStep.startTime
    const eta = current > 0 ? ((elapsed / current) * (total - current)) : 0

    process.stdout.write(
      `\r  ${COLORS.blue}${bar} ${COLORS.bright}${pct}%${COLORS.reset} ` +
      `${COLORS.dim}(${current}/${total})${COLORS.reset} ` +
      `${COLORS.dim}${label}${COLORS.reset} ` +
      `${COLORS.dim}ETA: ${formatTime(Math.round(eta))}${COLORS.reset}   `
    )
    if (current === total) console.log() // Nova linha ao completar
  }

  // Sucesso
  success(message) {
    const elapsed = this.currentStep ? Date.now() - this.currentStep.startTime : 0
    console.log(`  ${COLORS.green}${ICONS.success} ${message}${COLORS.reset}` +
      (elapsed > 0 ? ` ${COLORS.dim}(${formatTime(elapsed)})${COLORS.reset}` : ''))
  }

  // Erro
  error(message, details = null) {
    console.log(`  ${COLORS.red}${ICONS.error} ${message}${COLORS.reset}`)
    if (details) {
      console.log(`    ${COLORS.dim}${details}${COLORS.reset}`)
    }
  }

  // Aviso
  warn(message) {
    console.log(`  ${COLORS.yellow}${ICONS.warn} ${message}${COLORS.reset}`)
  }

  // Info
  info(message) {
    console.log(`  ${COLORS.dim}${ICONS.info} ${message}${COLORS.reset}`)
  }

  // Dados extraídos (título, imagens, etc.)
  data(key, value) {
    console.log(`    ${COLORS.dim}${key}:${COLORS.reset} ${COLORS.bright}${value}${COLORS.reset}`)
  }

  // Resumo final do pipeline
  summary(results) {
    const totalElapsed = Date.now() - this.startTime
    console.log()
    console.log(`${COLORS.cyan}${'═'.repeat(50)}${COLORS.reset}`)
    console.log(`${COLORS.bright}${COLORS.cyan}  RESUMO DO PIPELINE${COLORS.reset}`)
    console.log(`${COLORS.cyan}${'═'.repeat(50)}${COLORS.reset}`)
    console.log()

    for (const result of results) {
      const icon = result.success ? COLORS.green + ICONS.success : COLORS.red + ICONS.error
      console.log(`  ${icon} ${COLORS.bright}${result.step}${COLORS.reset}`)
      if (result.message) {
        console.log(`      ${COLORS.dim}${result.message}${COLORS.reset}`)
      }
      if (result.error) {
        console.log(`      ${COLORS.red}${result.error}${COLORS.reset}`)
      }
    }

    console.log()
    console.log(`${COLORS.dim}  Tempo total: ${COLORS.bright}${formatTime(totalElapsed)}${COLORS.reset}`)
    console.log(`${COLORS.cyan}${'═'.repeat(50)}${COLORS.reset}`)
  }
}

export const logger = new Logger()
```

### Exemplo de Saída no Terminal

#### Pipeline completo (sucesso):

```
[▶] CAPTURANDO WIKI: Phantom Weapons
──────────────────────────────────────────────────────
  [→] Conectando a https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons (1.2s)
  [→] Aguardando carregamento completo da página (3.4s)
  [→] Extraindo conteúdo principal (0.1s)
  [→] Removendo ads e elementos desnecessários (0.05s)
  [→] Convertendo URLs relativas para absolutas (0.02s)
  [✓] Título: Phantom Weapons
  [i] Subtítulo: Phantom Weapons are the level 100 Relic Weapons...
  [i] Cover image: https://ffxiv.consolegameswiki.com/mediawiki/images/thumb/0/04/...
  [✓] Imagens encontradas: 15
  [✓] Tabelas encontradas: 8
  [✓] Links internos: 42
  [✓] Salvo: tools/output/phantom-weapons-raw.json (48.2KB)

[▶] TRADUZINDO: Phantom Weapons
──────────────────────────────────────────────────────
  [→] Conectando à Gemini API (0.8s)
  [→] Enviando conteúdo para tradução (52.3KB) (1.2s)
  [→] Traduzindo título e subtítulo... (0.6s)
  [✓] Título PT-BR: Armas Fantasma
  [✓] Subtítulo PT-BR: Armas Fantasma são as Armas Relíquia nível 100...
  [→] Traduzindo conteúdo principal... (8.4s)
  [✓] HTML traduzido: 54.7KB (+4.6% devido a termos PT-BR)
  [✓] Imagens preservadas: 15/15
  [✓] Tabelas preservadas: 8/8
  [✓] Links preservados: 42/42
  [✓] Salvo: tools/output/phantom-weapons-translated.json (55.1KB)

[▶] IMPORTANDO: Phantom Weapons → Supabase
──────────────────────────────────────────────────────
  [→] Conectando ao Supabase (apaodyqexsmgdojnktnb.supabase.co) (0.4s)
  [→] Verificando se slug já existe... (0.3s)
  [i] Slug 'phantom-weapons' disponível
  [→] Inserindo post na tabela 'posts'... (0.5s)
  [✓] Post criado com UUID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
  [✓] URL: https://seusite.com/post/phantom-weapons
  [✓] Status: published
  [✓] Categoria: guias

══════════════════════════════════════════════════════
  RESUMO DO PIPELINE
══════════════════════════════════════════════════════

  [✓] CAPTURA WIKI
      Phantom Weapons — 15 imagens, 8 tabelas, 48.2KB de HTML

  [✓] TRADUÇÃO PT-BR
      Phantom Weapons → Armas Fantasma — 54.7KB traduzidos

  [✓] IMPORTAÇÃO SUPABASE
      Post publicado: https://seusite.com/post/phantom-weapons

  Tempo total: 14s
══════════════════════════════════════════════════════
```

#### Pipeline com erro:

```
[▶] CAPTURANDO WIKI: Boss_That_Does_Not_Exist
──────────────────────────────────────────────────────
  [→] Conectando a https://ffxiv.consolegameswiki.com/wiki/Boss_That_Does_Not_Exist (1.1s)
  [✗] Erro: Página não encontrada (HTTP 404)
      A URL não corresponde a nenhuma wiki page válida.
      Verifique a URL e tente novamente.

══════════════════════════════════════════════════════
  RESUMO DO PIPELINE
══════════════════════════════════════════════════════

  [✗] CAPTURA WIKI
      Boss_That_Does_Not_Exist — HTTP 404: Página não encontrada

  [—] TRADUÇÃO PT-BR
      Não executada (etapa anterior falhou)

  [—] IMPORTAÇÃO SUPABASE
      Não executada (etapa anterior falhou)

  Tempo total: 2s
══════════════════════════════════════════════════════
```

#### Pipeline batch com progresso parcial:

```
[▶] PROCESSANDO BATCH: 5 páginas
──────────────────────────────────────────────────────

  [1/5] Phantom Weapons
  [✓] Capturado → [✓] Traduzido → [✓] Importado (3.2s)

  [2/5] Occult Crescent
  [✓] Capturado → [✓] Traduzido → [✓] Importado (4.1s)

  [3/5] Zodiac Weapons
  [✓] Capturado → [✗] Tradução falhou (rate limit Gemini)
      Retry em 60s... (1/3 tentativas)

  [3/5] Zodiac Weapons (retry 1)
  [✓] Capturado → [✓] Traduzido → [✓] Importado (5.8s)

  [4/5] Manderville Weapons
  [✓] Capturado → [✓] Traduzido → [✗] Import falhou (slug duplicado)
      slug 'manderville-weapons' já existe — pulando

  [5/5] Eureka Weapons
  [✓] Capturado → [✓] Traduzido → [✓] Importado (3.7s)

══════════════════════════════════════════════════════
  RESUMO DO BATCH
══════════════════════════════════════════════════════

  [✓] 4/5 páginas processadas com sucesso
  [!] 1/5 páginas com problemas:
      - Manderville Weapons: slug duplicado (já existe no site)

  Tempo total: 22s
  Taxa de sucesso: 80%
══════════════════════════════════════════════════════
```

### Feedback por Etapa

#### Etapa 1 — Scraper

| Momento | Feedback |
|---------|----------|
| Início | `[▶] CAPTURANDO WIKI: {título da página}` |
| Conexão | `[→] Conectando a {url}` |
| Aguardando JS | `[→] Aguardando carregamento da página` |
| Extraindo conteúdo | `[→] Extraindo conteúdo principal` |
| Limpando HTML | `[→] Removendo ads e elementos desnecessários` |
| Convertendo URLs | `[→] Convertendo URLs relativas para absolutas` |
| Resultado | `[✓] Título: {título}` |
| Dados | `[i] Cover image: {url}` |
| Dados | `[i] Imagens encontradas: {n}` |
| Dados | `[i] Tabelas encontradas: {n}` |
| Salvamento | `[✓] Salvo: {path} ({tamanho})` |
| Erro HTTP | `[✗] Erro: HTTP {código} — {descrição}` |
| Timeout | `[✗] Erro: Timeout — página não carregou em {tempo}s` |
| Seletor falhou | `[!] Aviso: Seletor '{selector}' não encontrado, usando fallback` |

#### Etapa 2 — Tradutor

| Momento | Feedback |
|---------|----------|
| Início | `[▶] TRADUZINDO: {título}` |
| Conexão API | `[→] Conectando à Gemini API` |
| Enviando | `[→] Enviando conteúdo ({tamanho}KB)` |
| Traduzindo título | `[→] Traduzindo título e subtítulo` |
| Resultado título | `[✓] Título PT-BR: {título traduzido}` |
| Traduzindo conteúdo | `[→] Traduzindo conteúdo principal...` |
| Progresso (longo) | `[→] Traduzindo seção 3/8: "Phantom Weapons Umbrae"` |
| Resultado | `[✓] HTML traduzido: {tamanho}KB (+{variação}%)` |
| Validação | `[✓] Imagens preservadas: {n}/{total}` |
| Validação | `[✓] Tabelas preservadas: {n}/{total}` |
| Validação | `[✓] Links preservados: {n}/{total}` |
| Rate limit | `[!] Rate limit atingido. Retry em {tempo}s (tentativa {n}/3)` |
| Erro API | `[✗] Erro Gemini API: {mensagem}` |
| Conteúdo vazio | `[✗] Erro: Resposta da API veio vazia` |

#### Etapa 3 — Importador

| Momento | Feedback |
|---------|----------|
| Início | `[▶] IMPORTANDO: {título} → Supabase` |
| Conexão | `[→] Conectando ao Supabase ({projeto})` |
| Verificação slug | `[→] Verificando se slug '{slug}' já existe` |
| Slug disponível | `[i] Slug '{slug}' disponível` |
| Slug duplicado | `[!] Slug '{slug}' já existe — será adicionado sufixo` |
| Inserindo | `[→] Inserindo post na tabela 'posts'` |
| Resultado | `[✓] Post criado com UUID: {uuid}` |
| URL | `[✓] URL: {url_completa}` |
| Upload imagens | `[→] Upload de imagem 3/15: {nome} ({tamanho}KB)` |
| Upload completo | `[✓] Todas as imagens uploadadas para Supabase Storage` |
| Erro RLS | `[✗] Erro: Sem permissão para inserir (verifique service_role key)` |
| Erro constraint | `[✗] Erro: Violação de constraint — {detalhes}` |

### Arquivo de Log

Cada execução gera um arquivo de log detalhado em `tools/output/logs/`:

```
tools/output/logs/
├── 2026-07-30_phantom-weapons.log
├── 2026-07-30_occult-crescent.log
└── 2026-07-31_batch-zodiac.log
```

Conteúdo do log (completo, com timestamps):

```
=== Wiki Pipeline Log ===
Data: 2026-07-30 14:32:15
URL: https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons
Modo: pipeline completo

[14:32:15] [STEP] CAPTURANDO WIKI: Phantom Weapons
[14:32:15] [INFO] Conectando a https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons
[14:32:17] [INFO] Página carregada (HTTP 200)
[14:32:17] [INFO] Extraindo conteúdo de div.mw-parser-output
[14:32:17] [INFO] Limpando: 5 anúncios, 1 TOC, 3 scripts removidos
[14:32:17] [INFO] URLs convertidas: 42 hrefs, 15 srcs
[14:32:17] [DATA] Título: Phantom Weapons
[14:32:17] [DATA] Cover: https://ffxiv.consolegameswiki.com/mediawiki/images/thumb/0/04/Phantom_weapons_banner.png/550px-Phantom_weapons_banner.png
[14:32:17] [DATA] Imagens: 15
[14:32:17] [DATA] Tabelas: 8
[14:32:17] [DATA] Links internos: 42
[14:32:17] [SUCCESS] Salvo: tools/output/phantom-weapons-raw.json (48234 bytes)

[14:32:17] [STEP] TRADUZINDO: Phantom Weapons
[14:32:18] [INFO] Gemini API conectada
[14:32:18] [INFO] Prompt enviado: 52341 tokens
[14:32:19] [DATA] Título traduzido: Armas Fantasma
[14:32:19] [DATA] Subtítulo traduzido: Armas Fantasma são as Armas Relíquia nível 100...
[14:32:27] [INFO] Conteúdo traduzido: 54712 bytes (+4.9%)
[14:32:27] [SUCCESS] Validação: 15/15 imagens, 8/8 tabelas, 42/42 links OK
[14:32:27] [SUCCESS] Salvo: tools/output/phantom-weapons-translated.json (55134 bytes)

[14:32:27] [STEP] IMPORTANDO: Phantom Weapons → Supabase
[14:32:28] [INFO] Supabase conectado (apaodyqexsmgdojnktnb)
[14:32:28] [INFO] Slug 'phantom-weapons' disponível
[14:32:29] [SUCCESS] Post criado: UUID a1b2c3d4-e5f6-7890-abcd-ef1234567890
[14:32:29] [SUCCESS] URL: https://seusite.com/post/phantom-weapons

[14:32:29] [SUMMARY]
  CAPTURA: OK (48.2KB, 15 imagens, 8 tabelas)
  TRADUÇÃO: OK (54.7KB, 15 imagens preservadas)
  IMPORTAÇÃO: OK (UUID a1b2c3d4)
  TEMPO TOTAL: 14.2s
```

### Flags de Output

```bash
# Modo silencioso (apenas erros)
node tools/wiki-pipeline.mjs <url> --quiet

# Modo verboso (logs detalhados de cada operação)
node tools/wiki-pipeline.mjs <url> --verbose

# Salvar log em arquivo
node tools/wiki-pipeline.mjs <url> --log tools/output/logs/

# JSON de resultado (para integração com outros scripts)
node tools/wiki-pipeline.mjs <url> --json
# Saída: { "success": true, "slug": "phantom-weapons", "url": "...", "duration": 14200 }
```

---

## Estrutura de Arquivos

```
tools/
├── wiki-scraper.mjs          # Etapa 1: Captura da wiki
├── wiki-translator.mjs       # Etapa 2: Tradução via Gemini
├── wiki-importer.mjs         # Etapa 3: Importação para Supabase
├── wiki-pipeline.mjs         # Script unificado (one-shot)
├── utils/
│   ├── logger.mjs            # Sistema de feedback visual e logs
│   ├── html-helpers.mjs      # Limpeza e processamento de HTML
│   ├── gemini-client.mjs     # Cliente wrapper da Gemini API
│   └── supabase-admin.mjs    # Cliente Supabase com service_role
└── output/                   # JSONs e logs gerados (gitignored)
    ├── phantom-weapons-raw.json
    ├── phantom-weapons-translated.json
    └── logs/                 # Logs detalhados por execução
        └── 2026-07-30_phantom-weapons.log
```

---

## Dependências Necessárias (todas gratuitas)

| Pacote | Uso | Tamanho |
|--------|-----|---------|
| `puppeteer` | Scraping da wiki | ~170MB (inclui Chromium) |
| `@supabase/supabase-js` | Upload para Storage | ~130KB |

**Nota**: `@supabase/supabase-js` já está instalado. O `logger.mjs` e `gemini-client.mjs` usam apenas APIs nativas do Node.js (zero dependências externas).

---

## Autenticação na API

O importador precisa autenticar como admin para criar posts. Duas opções:

### Opção A: Usar JWT existente (recomendado)
```javascript
// Login via /api/auth/login para obter cookie admin_token
const loginRes = await fetch(`${APP_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'senha' }),
})
const cookie = loginRes.headers.get('set-cookie')
```

### Opção B: Inserir direto no Supabase (mais rápido)
```javascript
// Usando service_role key (já no .env)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const { data, error } = await supabase.from('posts').insert(postPayload).select().single()
```

**Recomendação**: Opção B (direto no Supabase) — mais simples, sem precisar de JWT.

---

## Configuração do `.env`

Adicionar ao `.env` existente:

```bash
# Wiki Scraper
WIKI_BASE_URL=https://ffxiv.consolegameswiki.com
WIKI_IMAGES_CDN=https://ffxiv.consolegameswiki.com/mediawiki/images
```

A `GEMINI_API_KEY` já existe. As credenciais do Supabase também.

---

## Fluxo de Uso (Passo a Passo)

### Para uma página da wiki:

```bash
# 1. Executar o pipeline completo
node tools/wiki-pipeline.mjs https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons

# 2. O script:
#    a) Abre a wiki no Puppeteer
#    b) Captura HTML + imagens + metadata
#    c) Salva JSON bruto em tools/output/
#    d) Envia HTML para Gemini traduzir
#    e) Salva JSON traduzido em tools/output/
#    f) (Opcional) Pergunta se quer importar
#    g) Cria post no Supabase via API direta
#    h) Retorna URL do post criado

# 3. Resultado:
#    Post disponível em: https://seusite.com/post/phantom-weapons
```

### Para múltiplas páginas:

```bash
# Criar arquivo com URLs
echo "https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons
https://ffxiv.consolegameswiki.com/wiki/Occult_Crescent
https://ffxiv.consolegameswiki.com/wiki/Zodiac_Weapons" > tools/urls.txt

# Executar em batch
node tools/wiki-pipeline.mjs --batch tools/urls.txt
```

---

## Garantias de Fidelidade Visual

O que será preservado da wiki original:

| Elemento | Preservado? | Como |
|----------|-------------|------|
| Texto | Sim | Traduzido via Gemini |
| Imagens | Sim | URLs mantidas ou re-hospedadas |
| Tabelas | Sim | HTML nativo, classe `wiki-table` adicionada |
| Formatação (bold, italic) | Sim | Tags `<b>`, `<i>` preservadas |
| Links internos da wiki | Sim | URLs absolutas do consolegameswiki |
| Ícones inline | Sim | Tags `<span class="icon-label-container">` preservadas |
| Citações/Blockquotes | Sim | Tags `<blockquote>` preservadas |
| Listas | Sim | Tags `<ul>`, `<ol>`, `<li>` preservadas |
| Títulos (h2, h3) | Sim | Geram Table of Contents automático no site |
| Layout responsivo | Sim | O site já aplica `prose` e estilos responsivos |

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Wiki bloqueia Puppeteer | User-agent customizado + delay entre requests |
| Gemini API com rate limit | Retry com backoff, fila de requests |
| HTML da wiki muda (quebra scraper) | Selectors flexíveis + fallback para `querySelector` genérico |
| Imagens do wiki ficam indisponíveis | Opção de re-hospedar no Supabase Storage |
| Conteúdo muito longo para Gemini | Divisão por seções h2 + tradução sequencial |
| Tradução com erros técnicos | Modo draft para revisão manual antes de publicar |

---

## Orçamento de Tempo

| Etapa | Tempo Estimado |
|-------|---------------|
| Setup inicial (instalar deps, criar estrutura) | 30min |
| Logger (tools/utils/logger.mjs) | 30min |
| Scraper (wiki-scraper.mjs) | 1-2h |
| Tradutor (wiki-translator.mjs + gemini-client.mjs) | 1h |
| Importador (wiki-importer.mjs + supabase-admin.mjs) | 30min |
| Script unificado (wiki-pipeline.mjs) | 30min |
| Testes e ajustes | 1h |
| **Total** | **~6h** |

---

## Ordem de Implementação

1. Criar estrutura `tools/`
2. Instalar `puppeteer`
3. Criar `tools/utils/logger.mjs` (sistema de feedback)
4. Criar `tools/utils/html-helpers.mjs` (limpeza de HTML)
5. Criar `tools/wiki-scraper.mjs` (captura)
6. Testar scraper com Phantom Weapons
7. Criar `tools/utils/gemini-client.mjs` (wrapper da API)
8. Criar `tools/wiki-translator.mjs` (tradução)
9. Testar tradução com JSON bruto
10. Criar `tools/utils/supabase-admin.mjs` (cliente admin)
11. Criar `tools/wiki-importer.mjs` (importação)
12. Testar importação
13. Criar `tools/wiki-pipeline.mjs` (unificado com feedback completo)
14. Teste end-to-end completo
