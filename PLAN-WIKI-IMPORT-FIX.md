# Plano: Corrigir Importação Wiki - Post Phantom Weapons

## Diagnóstico dos Problemas

### Problema 1: Conversão Wikitext→Markdown perde formatação
O script `wiki-import.js` converte wikitext para markdown, mas markdown é **muito limitado** para representar o HTML complexo da wiki:
- Imagens com thumbnail, alinhamento, legendas → ficam quebradas
- Tabelas com ícones inline, links, colspan → ficam como `§§BLOCO_X§§`
- Tags HTML (`<div style="text-align:center">`, `<span class="icon-label-container">`) → removidas
- Blockquotes com estilo customizado → removidas
- TOC (sumário) → vira lista numerada quebrada

### Problema 2: Ícones da wiki nunca encontrados
A XIVAPI não tem many dos ícones da wiki (FATE icons, quest icons, zone icons). A wiki usa imagens locais em `/mediawiki/images/thumb/...`

### Problema 3: Site não renderiza HTML bruto
O `renderMarkdown()` usa `marked.parse()` que espera markdown, mas o conteúdo contém HTML parcial quebrado. O DOMPurifyremove tags que deveria manter.

---

## Solução: Buscar HTML Parseado da Wiki (não wikitext)

### Abordagem
Em vez de converter wikitext→markdown, usar a API MediaWiki para buscar o **HTML já renderizado**:
```
action=parse&page=Phantom_Weapons&prop=text&format=json
```

Isso retorna o HTML exato que a wiki mostra, com todas as imagens, tabelas, ícones e formatação preservados.

### Fluxo Novo
```
URL da Wiki
    │
    ▼
[1] Fetch via action=parse (HTML renderizado)
    │  Todos os icons, imagens, tabelas preservados
    ▼
[2] Limpar HTML (remover ads, TOC, nav, scripts)
    │
    ▼
[3] Traduzir texto (preservando HTML)
    │  Traduz só o conteúdo visível, mantém tags
    ▼
[4] Salvar HTML direto no post (não markdown)
    │
    ▼
[5] Frontend renderiza HTML com DOMPurify
```

---

## Arquivos a Modificar

### 1. `scripts/wiki-import.js` — Refactor completo

**Mudanças:**
- Trocar `action=query&prop=revisions` por `action=parse&prop=text`
- Remover toda a conversão wikitext→markdown (wikitextToMarkdown)
- Adicionar limpeza de HTML (remover ads, scripts, TOC, nav)
- Adicionar tradução de texto preservando tags HTML
- Salvar o HTML limpo como `content` do post

**Nova função `fetchWikiHtml(url)`:**
```javascript
async function fetchWikiHtml(url) {
  // Extrair título da URL
  const title = extractTitle(url);
  
  // Buscar HTML parseado
  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'text',
    format: 'json',
  });
  
  const res = await fetch(`${WIKI_API}?${params}`);
  const data = await res.json();
  
  return data.parse.text['*']; // HTML renderizado
}
```

**Nova função `cleanWikiHtml(html)`:**
```javascript
function cleanWikiHtml(html) {
  // Remover: ads, TOC, scripts, estilos, nav, edit links
  html = html.replace(/<div class="toc".*?<\/div>/gs, '');
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  html = html.remove('.noprint', '.mw-editsection', '.hatnote');
  
  // Corrigir URLs de imagens (adicionar domínio)
  html = html.replace(/src="\/mediawiki\//g, 
    'src="https://ffxiv.consolegameswiki.com/mediawiki/');
  html = html.replace(/href="\/wiki\//g, 
    'href="https://ffxiv.consolegameswiki.com/wiki/');
  
  return html;
}
```

**Nova função `translateHtmlPreserving(html)`:**
- Usar regex para extrair apenas texto visível
- Traduzir o texto
- Recolocar no HTML preservando tags
- Alternativa: traduzir frase por frase

### 2. `src/lib/sanitize.ts` — Adicionar modo HTML

**Mudanças:**
- Detectar se conteúdo é HTML (contém `<` e tags conhecidas)
- Se HTML: usar DOMPurify diretamente (não passar pelo marked)
- Se markdown: usar marked.parse() como antes
- Adicionar mais tags ALLOWED_TAGS: `figure`, `figcaption`, `span`, `sup`, `sub`
- Adicionar mais ALLOWED_ATTRS: `typeof`, `data-*`, `srcset`

### 3. `src/index.css` — Estilos para HTML da wiki

**Adicionar:**
- `.wiki-table` - tabelas da wiki com bordas e hover
- `.wiki-image figure` - imagens centralizadas com legenda
- `.icon-label-container` - ícones inline alinhados
- `blockquote.quotation-box` - citações da wiki
- `.mw-heading` - headings da wiki
- `.toc` - sumário (se mantido)
- `img[src*="mediawiki"]` - imagens da wiki

### 4. `src/components/ImportWikiModal.tsx` — Adaptar

**Mudanças:**
- Trocar fetch de wikitext para HTML parseado
- Usar nova função de limpeza HTML
- Enviar HTML limpo para o backend (não markdown)

---

## Execução

### Fase 1: Script CLI (wiki-import.js)
1. Trocar API endpoint para `action=parse`
2. Remover wikitextToMarkdown()
3. Adicionar cleanWikiHtml()
4. Adaptar tradução para preservar HTML
5. Testar com phantom-weapons

### Fase 2: Frontend (sanitize.ts + CSS)
1. Detectar HTML vs markdown
2. Renderizar HTML com DOMPurify
3. Adicionar estilos CSS para elementos wiki
4. Testar renderização

### Fase 3: ImportWikiModal
1. Adaptar para buscar HTML
2. Testar fluxo completo

---

## Resultado Esperado
- Post com imagens originais da wiki funcionando
- Tabelas com ícones e links preservados
- Formatação (bold, italic, headers, blockquotes) intacta
- Texto traduzido para PT-BR
- Apenas URLs de imagens e links apontando para a wiki original
