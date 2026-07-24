# PLAN: Hall of the Novice EX — Plano de Implementação

## Resumo

11 fases, ~26h (~4 dias) de trabalho. Foco em: XSS, React Router, remoção de duplicatas, refatoração do calendario, limpeza de cores hardcoded, remoção de legado, e infraestrutura (ESLint + testes básicos).

---

## Fase 1: XSS — Sanitização de `dangerouslySetInnerHTML`

**Risco se não fizer:** Qualquer admin (ou atacante via mass assignment) pode injetar `<script>` nos posts.

**Arquivos afetados:**
- `src/pages/PostDetailPage.tsx:141-148`
- `src/components/PostModal.tsx:302`

**Ações:**
1. Instalar `marked` + `dompurify` + `@types/dompurify`
2. Criar `src/lib/sanitize.ts` — função `renderMarkdown(content: string): string` que:
   - Converte markdown via `marked.parse()`
   - Sanitiza via `DOMPurify.sanitize()` com policy restritiva
3. Substituir o regex `.replace(/## (.*)/g, ...)` em `PostDetailPage.tsx:142-146` por `renderMarkdown(post.content)`
4. Substituir `PostModal.tsx:302` por `renderMarkdown(content)` no preview
5. Adicionar Content-Security-Policy header em `server.js:130-140` (bloquear inline scripts)

**Verificação:** Testar com post contendo `<img onerror="alert(1)" src=x>` — deve ser removido.

---

## Fase 2: React Router — Substituir hand-rolled router

**Risco se não fizer:** Sem lazy loading, sem 404, sem route params reais, sem loading states.

**Arquivo principal:** `src/App.tsx:16-124`

**Ações:**
1. Instalar `react-router-dom`
2. Refatorar `App.tsx`:
   - Criar `<BrowserRouter>` com `<Routes>`
   - Mapear rotas: `/`, `/academia`, `/post/:slug`, `/calendario`, `/admin`
   - Mover auth check para `<ProtectedRoute>` wrapper
   - Adicionar fallback 404 (`NotFoundPage`)
3. Criar `src/pages/NotFoundPage.tsx` — página 404 com tema do design system
4. Atualizar `Navbar.tsx` para usar `<NavLink>` do React Router (substituir `window.history.pushState`)
5. Adicionar `lazy()` imports nas pages para code splitting:
   ```tsx
   const HomePage = lazy(() => import('./pages/HomePage'))
   const AcademiaPage = lazy(() => import('./pages/AcademiaPage'))
   // etc.
   ```
6. Envolver routes em `<Suspense fallback={<PageLoader />}>`

**Verificação:** `npm run build` deve gerar chunks separados por rota.

---

## Fase 3: Cores Hardcoded → CSS Custom Properties

**Arquivos afetados (com contagem de ocorrências):**
- `src/components/Navbar.tsx` — ~11 ocorrências (`#1D6A6A`, `#D4AF37`)
- `src/components/Footer.tsx` — ~7 ocorrências
- `src/components/LoginGate.tsx` — ~8 ocorrências
- `src/components/ErrorBoundary.tsx` — ~3 ocorrências
- `src/pages/HomePage.tsx` — ~16 ocorrências
- `src/pages/AcademiaPage.tsx` — ~10 ocorrências
- `src/pages/PostDetailPage.tsx` — ~6 ocorrências
- `src/pages/AdminPage.tsx` — ~15 ocorrências

**Ações:**
1. Adicionar tokens faltantes em `src/index.css` `@theme`:
   ```css
   --color-primary-hover: #2A8A8A;
   --color-on-secondary-deep: #735C00;
   --color-error: #BA1A1A;
   --color-error-light: #FFDAD6;
   ```
2. Substituir systematicamente em cada arquivo:
   - `#1D6A6A` → `var(--color-primary)` ou `bg-primary` / `text-primary`
   - `#124949` → `var(--color-primary-deep)` ou `bg-primary-deep`
   - `#D4AF37` → `var(--color-secondary)` ou `bg-secondary` / `text-secondary`
   - `#F5E6B8` → `var(--color-secondary-light)` ou `bg-secondary-light`
   - `#E8F4F4` → `var(--color-primary-light)` ou `bg-primary-light`
   - `#E5C158` → `var(--color-secondary-accent)`
   - `#4ECDC4` → `var(--color-crystal)` (dark mode teal)
   - `#2A8A8A` → `var(--color-primary-hover)`

**Verificação:** `grep -r "#1D6A6A\|#D4AF37\|#124949\|#F5E6B8" src/` deve retornar 0 resultados.

---

## Fase 4: Limpeza de duplicatas — Calendario

**Arquivos a deletar (do calendario):**
- `calendario/server.js` — 697 linhas, 99.7% idêntico ao root
- `calendario/supabase-schema.sql` — subset do root
- `calendario/src/lib/api.ts` — 1 linha diferente (error message)
- `calendario/src/types.ts` — subset do root

**Ações:**
1. Criar `calendario/src/lib/api.ts` como re-export:
   ```ts
   export { apiGet, apiPost, apiPatch, apiDel } from '../../src/lib/api'
   ```
2. Criar `calendario/src/types.ts` como re-export:
   ```ts
   export type { EventType, EventTypeItem, MagicalEvent, MonthData } from '../../src/types'
   ```
3. Atualizar `calendario/vite.config.ts` para resolver imports cross-project:
   ```ts
   resolve: { alias: { '@shared': path.resolve(__dirname, '../src') } }
   ```
4. Deletar `calendario/server.js` — calendario usa o mesmo server via Vercel serverless
5. Deletar `calendario/supabase-schema.sql` — usar apenas o root
6. Atualizar `calendario/package.json` scripts se necessário
7. Verificar que `calendario/src/App.tsx` imports funcionam com os novos paths

**Verificação:** `cd calendario && npm run build` deve funcionar sem erros.

---

## Fase 5: Refatoração do Calendario — Componentizar App.tsx

**Arquivo:** `calendario/src/App.tsx` (901 linhas → ~12-15 componentes)

**Novos arquivos a criar em `calendario/src/components/`:**

| Componente | Linhas originais | Responsabilidade |
|---|---|---|
| `CalendarGrid.tsx` | 635-773 | Grid 7 colunas, células, cristal SVG, badge "hoje" |
| `CalendarDayHeaders.tsx` | 637-642 | Row de headers (Dom, Seg, Ter...) |
| `EventDetailPanel.tsx` | 783-897 | Painel lateral "Arcane Ledger" |
| `EventCard.tsx` | 816-892 | Card individual de evento no painel |
| `EmptyDayState.tsx` | 798-806 | "Tempo de Estudo Livre" |
| `CalendarSidebar.tsx` | 421-554 | Sidebar mobile com filtros |
| `CalendarPageHeader.tsx` | 587-616 | Título, mês, navegação |
| `MobileCalendarHeader.tsx` | 571-585 | Hamburger + logo |
| `ProphecyToast.tsx` | 179-180, 263-274 | Toast com profecia |
| `AdminInfoBanner.tsx` | 776-779 | Banner "Segredo Runico" |

**Novos hooks em `calendario/src/hooks/`:**

| Hook | Responsabilidade |
|---|---|
| `useCalendarData.ts` | Fetch events + eventTypes, loading/error state |
| `useCalendarGrid.ts` | currentMonthIdx, selectedDay, activeFilter, daysInGrid, eventsByDay |
| `useMediaQuery.ts` | Auto-close sidebar on desktop |

**Mover para `calendario/src/utils/constants.ts`:**
- `ICON_MAP`, `safeImageUrl`, `REAL_MONTH_NAMES`, `buildRealMonths`, `PROPHECIES`, `DAY_NAMES_*`, `EVENT_TYPE_COLORS`, `getEventTypeColors`

**Resultado esperado:** `App.tsx` fica com ~150-200 linhas (orchestration apenas).

---

## Fase 6: Cores hardcoded no Calendario

**Arquivo principal:** `calendario/src/App.tsx`

**Ações:**
1. Substituir ~20 ocorrências de hex hardcoded:
   - `#E8F4F4`, `#1D6A6A` → `var(--color-primary-light)`, `var(--color-primary)`
   - `#F5E6B8`, `#D4AF37` → `var(--color-secondary-light)`, `var(--color-secondary)`
   - `#EDE8F3`, `#9B8BB4` → `var(--color-tertiary-light)`, `var(--color-tertiary)`
   - `#FFDAD6`, `#BA1A1A` → `var(--color-error-light)`, `var(--color-error)`
   - `#abc8f5` → `var(--color-crystal-light)`
2. Verificar também `calendario/src/components/AdminPanel.tsx`, `LoginGate.tsx`, `WelcomeBanner.tsx`, `FilterHint.tsx`

**Verificação:** `grep -r "#[0-9A-Fa-f]\{6\}" calendario/src/` deve retornar apenas `EVENT_TYPE_COLORS` (mapa de cores por tipo de evento, que é intencional).

---

## Fase 7: Remoção de legado — `a academia.html`

**Arquivo:** `a academia.html` (539 linhas, HTML standalone com inline styles)

**Ações:**
1. Verificar se há links para `a academia.html` em:
   - `README.md`
   - `src/pages/HomePage.tsx`
   - Qualquer outro arquivo
2. Se o conteúdo já existe no React (AcademiaPage), deletar `a academia.html`
3. Se houver conteúdo exclusivo no HTML, migrar para `AcademiaPage.tsx` antes de deletar
4. Deletar `a academia.html`

**Verificação:** `grep -r "academia.html" .` deve retornar 0 resultados.

---

## Fase 8: Infraestrutura — ESLint + Prettier

**Ações:**
1. Instalar `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `prettier`, `eslint-config-prettier`
2. Criar `eslint.config.js` (flat config):
   ```js
   import js from '@eslint/js'
   import tseslint from 'typescript-eslint'
   import reactHooks from 'eslint-plugin-react-hooks'

   export default [
     js.configs.recommended,
     ...tseslint.configs.recommended,
     { plugins: { 'react-hooks': reactHooks }, rules: reactHooks.configs.recommended.rules },
     { ignores: ['dist/', 'calendario/dist/', 'dist-calendario/'] }
   ]
   ```
3. Criar `.prettierrc`:
   ```json
   { "semi": false, "singleQuote": true, "trailingComma": "es5", "printWidth": 100 }
   ```
4. Atualizar `package.json` scripts:
   ```json
   "lint": "eslint src/ --fix",
   "lint:check": "eslint src/",
   "format": "prettier --write src/",
   "format:check": "prettier --check src/",
   "typecheck": "tsc --noEmit"
   ```
5. Rodar `npm run lint` e corrigir erros encontrados
6. Rodar `npm run format` para formatar todo o codebase

**Verificação:** `npm run lint:check && npm run format:check && npm run typecheck` — todos passam.

---

## Fase 9: Testes básicos com Vitest

**Ações:**
1. Instalar `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
2. Criar `vitest.config.ts`:
   ```ts
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts' }
   })
   ```
3. Criar `src/test/setup.ts` com `@testing-library/jest-dom` matchers
4. Escrever testes para:
   - `src/lib/sanitize.ts` — renderMarkdown sanitiza XSS
   - `src/lib/api.ts` — timeout, error handling
   - `src/components/PostCard.tsx` — renderiza título, tags
   - `src/components/Navbar.tsx` — navegação, theme toggle
5. Atualizar `package.json`:
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:coverage": "vitest run --coverage"
   ```

**Verificação:** `npm run test` — todos os testes passam.

---

## Fase 10: Mass Assignment Fix

**Arquivo:** `server.js:642-657` (`PATCH /api/posts`)

**Ações:**
1. Adicionar whitelist de campos editáveis (como já existe em `PATCH /api/events`):
   ```js
   const POST_FIELDS = ['title', 'subtitle', 'content', 'category', 'author_name', 'cover_image', 'tags', 'is_pinned', 'status', 'published_at']
   ```
2. Filtrar `req.body` contra o whitelist antes do update
3. Adicionar limite de tamanho para `content` (ex: 50.000 caracteres)
4. Escapar caracteres especiais no parâmetro `search` de `GET /api/posts` (linha 590)

---

## Fase 11: Limpeza final e build

**Ações:**
1. Deletar diretório `guias/` (vazio)
2. Deletar `dist-calendario/` (build output não deve ficar no repo)
3. Deletar `calendario/dist/` (build output não deve ficar no repo)
4. Atualizar `.gitignore`:
   ```
   dist/
   dist-calendario/
   calendario/dist/
   ```
5. Remover `calendario/.env.example` do tracking:
   ```bash
   git rm --cached calendario/.env.example
   ```
6. Rodar `npm run build` na raiz e no calendario
7. Verificar que tudo compila sem erros

---

## Ordem de Execução

```
Fase 1 (XSS) ──┐
               ├──→ Fase 3 (Cores) ──→ Fase 6 (Cores Calendario)
Fase 2 (Router)┘         │
                          ├──→ Fase 4 (Duplicatas) ──→ Fase 5 (Componentizar Calendario)
                          │
Fase 8 (ESLint) ──────────┤
Fase 9 (Testes) ─────────┤
Fase 10 (Mass Assign) ───┤
Fase 7 (Legado) ──────────┤
Fase 11 (Limpeza) ────────┘
```

**Dependências críticas:**
- Fase 1 (XSS) **antes** de qualquer coisa — é vulnerabilidade de segurança
- Fase 2 (Router) **antes** da Fase 3 (Cores) — muda a estrutura de imports
- Fase 4 (Duplicatas) **antes** da Fase 5 (Componentizar Calendario) — calendario precisa importar types/api do root primeiro
- Fase 8 (ESLint) **antes** da Fase 9 (Testes) — padroniza o código antes de testar

---

## Resumo de Mudanças por Arquivo

| Arquivo | Ação | Fase |
|---|---|---|
| `package.json` | +5 deps (marked, dompurify, react-router-dom, vitest, eslint) | 1,2,8,9 |
| `src/lib/sanitize.ts` | **Novo** — markdown + sanitização | 1 |
| `src/App.tsx` | Refatorar para React Router | 2 |
| `src/pages/NotFoundPage.tsx` | **Novo** — página 404 | 2 |
| `src/components/Navbar.tsx` | NavLink + substituir cores | 2,3 |
| `src/pages/*.tsx` (5 arquivos) | Substituir cores hardcoded | 3 |
| `src/components/*.tsx` (4 arquivos) | Substituir cores hardcoded | 3 |
| `src/index.css` | +4 tokens CSS | 3 |
| `calendario/src/lib/api.ts` | Re-export do root | 4 |
| `calendario/src/types.ts` | Re-export do root | 4 |
| `calendario/server.js` | **Deletar** | 4 |
| `calendario/supabase-schema.sql` | **Deletar** | 4 |
| `calendario/src/App.tsx` | Decompor em ~12 componentes | 5 |
| `calendario/src/components/*.tsx` | **~10 novos** componentes | 5 |
| `calendario/src/hooks/*.ts` | **~3 novos** hooks | 5 |
| `calendario/src/utils/constants.ts` | **Novo** — constantes extraídas | 5 |
| `calendario/src/App.tsx` + components | Substituir cores hardcoded | 6 |
| `a academia.html` | **Deletar** | 7 |
| `eslint.config.js` | **Novo** | 8 |
| `.prettierrc` | **Novo** | 8 |
| `vitest.config.ts` | **Novo** | 9 |
| `src/test/setup.ts` | **Novo** | 9 |
| `src/**/*.test.ts` | **~5 novos** arquivos de teste | 9 |
| `server.js` | +whitelist posts, +limit content, +escape search | 10 |
| `.gitignore` | Atualizar patterns | 11 |
| `calendario/.env.example` | `git rm --cached` | 11 |

---

## Estimativa de Esforço

| Fase | Esforço | Prioridade |
|---|---|---|
| Fase 1: XSS | ~3h | Crítica |
| Fase 2: React Router | ~4h | Alta |
| Fase 3: Cores (main) | ~3h | Média |
| Fase 4: Duplicatas | ~2h | Média |
| Fase 5: Componentizar Calendario | ~6h | Média |
| Fase 6: Cores (calendario) | ~2h | Média |
| Fase 7: Legado | ~30min | Baixa |
| Fase 8: ESLint + Prettier | ~1h | Média |
| Fase 9: Testes | ~3h | Média |
| Fase 10: Mass Assignment | ~1h | Alta |
| Fase 11: Limpeza | ~30min | Baixa |
| **Total** | **~26h (~4 dias)** | |
