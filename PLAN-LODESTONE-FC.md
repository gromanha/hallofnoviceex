# Plano: Integração de Dados da FC do Lodestone via @xivapi/nodestone

## Visão Geral

Integrar dados públicos da Free Company "Hall of Novice EX" (ID: 9234349560946612399) do Lodestone
no site, exibindo:
1. **Card de informações da FC** na sidebar esquerda (nome, tag, GC, membros, ranking, crest)
2. **Painel de membros** na lateral direita do site (portraits + nomes dos membros da FC)

### Stack atual
- React 19 + Vite 6 + TypeScript
- Express 4 (server.js, porta 3001)
- Tailwind CSS v4
- lucide-react (ícones)
- motion (animações)
- Já integra XIVAPI v2 para game data (items, recipes, etc.)

### Por que nodestone
- A XIVAPI **v2** (que o projeto usa) **não tem endpoints de Free Company**
- Os endpoints da v1 e do cafemaker estão fora do ar (403/530)
- `@xivapi/nodestone` é a lib Node.js official do XIVAPI para fazer parse do Lodestone
- Usa CSS selectors (`lodestone-css-selectors`) + `linkedom` (DOM parser leve)
- Faz parsing server-side, sem problemas de CORS

---

## Passo 1: Instalar dependência

```bash
npm install @xivapi/nodestone
```

Dependências transitivas arrastadas automaticamente:
- `linkedom` (DOM parser)
- `axios` (HTTP client)
- `lodestone-css-selectors` (CSS selectors do Lodestone)

---

## Passo 2: Variável de ambiente

Adicionar ao `.env`:
```
LODESTONE_FC_ID=9234349560946612399
```

---

## Passo 3: Criar `api/lib/lodestone.js` — módulo wrapper

### Responsabilidade
Wrapper sobre os parsers do nodestone com cache em memória.

### Funções exportadas
- `getFCProfile(fcId)` → perfil completo da FC
- `getFCMembers(fcId, page)` → lista de membros (1 página = 50 membros)
- `getFCAllMembers(fcId)` → todas as páginas (loop com delay de 1s entre páginas)

### Dados retornados — Perfil FC

```typescript
{
  FreeCompany: {
    ID: number,
    Name: string,                    // "Hall of Novice EX"
    Tag: string,                     // "«HoN»"
    Slogan: string,                  // "Onde todo erro é uma aula..."
    Server: {
      World: string,                 // "Behemoth"
      DC: string                     // "Primal"
    },
    GrandCompany: {
      Name: string,                  // "Order of the Twin Adder"
      Rank: string                   // "Allied"
    },
    Formed: { Timestamp: number },
    ActiveState: string,             // "Always"
    Recruitment: string,             // "Open"
    ActiveMemberCount: number,       // 66
    Rank: string,                    // "30"
    CrestLayers: {
      Bottom: string,                // URL da imagem
      Middle: string,
      Top: string
    },
    Estate: {
      Name: string,
      Plot: string,                  // "Plot 35, 19 Ward, Mist (Large)"
      Greeting: string,
      NoEstate: boolean
    },
    Ranking: {
      Weekly: number,                // 78
      Monthly: number                // 58
    }
  }
}
```

### Dados retornados — Membros

```typescript
{
  FreeCompanyMembers: {
    List: Array<{
      ID: number,                    // Character ID no Lodestone
      Name: string,                  // Nome do personagem
      Avatar: string,                // URL da imagem de retrato
      Server: {
        World: string,
        DC: string
      },
      FCRank: string,                // Rank na FC ("1", "2", etc.)
      Rank: { RankName: string },    // "Free Leader", "Member", etc.
      RankIcon: string               // URL do ícone do rank
    }>,
    PageInfo: {
      CurrentPage: number,
      NumPages: number
    }
  }
}
```

### Cache
- TTL: 1 hora (dados de FC mudam raramente)
- Armazenamento: `Map` em memória no server
- Keys: `fc:profile:{fcId}`, `fc:members:{fcId}:{page}`

### Nota sobre Express 4 vs 5
O nodestone depende de `Request` do Express 5. Como o server usa Express 4,
criar um objeto `req` mock:
```javascript
const mockReq = {
  params: { fcId },
  query: {}
};
const data = await freeCompanyParser.parse(mockReq, 'FreeCompany.');
```

---

## Passo 4: Criar rotas no `server.js`

### Rota 1: Perfil da FC
```
GET /api/lodestone/fc
```
- Retorna o perfil completo da FC
- Cache: 1h
- Rate limit: reutilizar `externalRateLimit` existente
- Resposta: JSON com o objeto `FreeCompany`

### Rota 2: Membros da FC
```
GET /api/lodestone/fc/members?page=1
```
- Retorna lista de membros com paginação
- Cache: 1h
- Rate limit: reutilizar `externalRateLimit`
- Query param `page` (default: 1, 50 membros por página)
- Resposta: JSON com `FreeCompanyMembers.List` e `FreeCompanyMembers.PageInfo`

### Rota 3: Todos os membros (opcional, para o painel lateral)
```
GET /api/lodestone/fc/members/all
```
- Busca todas as páginas automaticamente (loop com delay 1s)
- Cache: 1h
- Rate limit: reutilizar `externalRateLimit`
- Útil para o painel de membros que precisa de todos de uma vez

---

## Passo 5: Criar `src/lib/useLodestoneFC.ts` — hook React

### Hook: `useLodestoneFC()`

```typescript
interface UseLodestoneFCReturn {
  fc: LodestoneFCData | null;
  members: LodestoneMember[];
  memberPageInfo: { CurrentPage: number; NumPages: number } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  loadMoreMembers: () => void;
  hasMoreMembers: boolean;
}
```

### Comportamento
1. Faz fetch de `GET /api/lodestone/fc` + `GET /api/lodestone/fc/members/all` em paralelo
2. Cacheia no cliente por 1h (localStorage com timestamp)
3. `refetch()` para atualização manual
4. Retry automático (1 retry após 5s em caso de erro)
5. `loadMoreMembers()` para paginação incremental (se não carregou todas de uma vez)

---

## Passo 6: Criar `src/components/FCCard.tsx` — Card de info da FC (sidebar)

### Localização
Dentro da sidebar esquerda, entre a `<nav>` e o footer de ações.

### Layout
```
┌──────────────────────────────┐
│  ┌──────┐  «HoN»            │
│  │crest │  Hall of Novice EX│
│  │layers│  Behemoth · Primal│
│  └──────┘                   │
├──────────────────────────────┤
│  GC  Twin Adder (Allied)    │
│  membros  66   rank  #30    │
├──────────────────────────────┤
│  recrutando  ● aberto       │
│  buscando:                   │
│  [🛡 Tank] [🩺 Healer]      │
│  [⚔ DPS] [🔨 Crafter]      │
│  [⛏ Gatherer]              │
├──────────────────────────────┤
│  Ver no Lodestone ↗         │
└──────────────────────────────┘
```

### Detalhes de implementação
- **Crest:** Renderizar 3 `<img>` sobrepostas com `position: relative/absolute`
- **Skeleton:** Placeholder pulsante com 3 blocos cinza
- **Roles:** Ícones lucide-react (Shield, Heart, Swords, Hammer, Pickaxe) — sem emojis
- **Badge recrutamento:** Ponto verde/vermelho + texto
- **Link externo:** Target `_blank`, ícon `ExternalLink` do lucide
- **Colapsável:** `<details>`/`<summary>` para expandir/recolher (economizar espaço)
- **Responsivo:** No mobile, mostrar apenas crest + tag (compacto)

---

## Passo 7: Criar `src/components/MembersPanel.tsx` — Painel lateral direito

### Localização
Lado direito do site, como terceira coluna no layout.

### Layout do site modificado
```
[Sidebar 256px] [Content flex-1] [MembersPanel ~300px]
```

### Layout do painel
```
┌────────────────────────────────┐
│  Membros da FC          ↻     │
│  66 membros online            │
├────────────────────────────────┤
│  ┌────┐  Nome do Personagem   │
│  │ 🖼 │  Mago Vermelho        │
│  └────┘  Behemoth             │
│  ─── Free Leader ───          │
├────────────────────────────────┤
│  ┌────┐  Outro Personagem     │
│  │ 🖼 │  Guerreiro            │
│  └────┘  Behemoth             │
│  ─── Member ───               │
├────────────────────────────────┤
│  ┌────┐  Mais um              │
│  │ 🖼 │  Curandeiro           │
│  └────┘  Behemoth             │
│  ─── Member ───               │
├────────────────────────────────┤
│  ... (scroll infinito)        │
└────────────────────────────────┘
```

### Detalhes de implementação
- **Largura:** `w-72` (288px) ou `w-80` (320px)
- **Visível apenas em desktop:** `hidden lg:block`
- **Scroll:** `overflow-y-auto` com scroll customizado (reaproveitar `.sidebar-scroll`)
- **Portrait:** Avatar do Lodestone (`Avatar` URL), `rounded-full`, 48x48px
- **Nome:** Font bold, truncate se muito longo
- **Classe/Job:** Se disponível, mostrar ícone da classe
- **Rank na FC:** Badge pequeno abaixo do nome
- **Server:** Texto small cinza
- **Agrupamento:** Opcionalmente agrupar por rank (Free Leader, Officers, Members)
- **Busca:** Input de filtro no topo para buscar membro por nome
- **Atualização:** Botão de refresh que chama `refetch()`
- **Skeleton:** 8-10 placeholders pulsantes enquanto carrega
- **Vazio:** Se a API falhar, mostrar mensagem amigável com link pro Lodestone

### Layout responsivo
- **Desktop (lg+):** Visível como coluna fixa à direita
- **Tablet (md):** Oculto, acessível via botão toggle no header
- **Mobile:** Oculto, sem acesso (espaço limitado)

---

## Passo 8: Modificar `DashboardLayout.tsx`

### Layout atual
```tsx
<div className="flex flex-1 min-h-0">
  <Sidebar />
  <div className="flex-1 min-w-0 overflow-y-auto pb-16 lg:pb-0">
    {children}
  </div>
</div>
```

### Layout modificado
```tsx
<div className="flex flex-1 min-h-0">
  <Sidebar />
  <div className="flex-1 min-w-0 overflow-y-auto pb-16 lg:pb-0">
    {children}
  </div>
  <MembersPanel />  {/* hidden lg:block */}
</div>
```

---

## Passo 9: Modificar `Sidebar.tsx`

### Mudanças
- Importar `useLodestoneFC` e `FCCard`
- Adicionar `<FCCard />` entre a `<nav>` e o footer de ações
- No mobile (bottom nav), **não mostrar** o FCCard

---

## Passo 10: Estilos CSS (`src/index.css`)

### Novos estilos necessários

```css
/* Skeleton loading para cards */
.fccard-skeleton { ... }

/* Crest layers sobrepostas */
.fccard-crest { position: relative; ... }
.fccard-crest img { position: absolute; ... }

/* Badge de status */
.fccard-badge { ... }
.fccard-badge--open { background: var(--color-green); }
.fccard-badge--closed { background: var(--color-on-surface-variant); }

/* Barra de reputação */
.fccard-reputation-bar { ... }

/* Painel de membros */
.members-panel { ... }
.members-panel::-webkit-scrollbar { ... }

/* Portrait do membro */
.member-portrait { ... }

/* Scroll do painel de membros */
.members-scroll { ... }
```

---

## Arquivos a criar/modificar

| # | Arquivo | Ação | Dependências |
|---|---------|------|--------------|
| 1 | `package.json` | `npm install @xivapi/nodestone` | — |
| 2 | `.env` | Adicionar `LODESTONE_FC_ID=9234349560946612399` | — |
| 3 | `api/lib/lodestone.js` | **Novo** — wrapper nodestone + cache | `@xivapi/nodestone` |
| 4 | `server.js` | Adicionar 3 rotas (`/api/lodestone/fc`, `/members`, `/members/all`) | `api/lib/lodestone.js` |
| 5 | `src/lib/useLodestoneFC.ts` | **Novo** — hook React | — |
| 6 | `src/components/FCCard.tsx` | **Novo** — card de info da FC | `useLodestoneFC`, `lucide-react` |
| 7 | `src/components/MembersPanel.tsx` | **Novo** — painel lateral de membros | `useLodestoneFC`, `lucide-react` |
| 8 | `src/components/DashboardLayout.tsx` | Modificar — adicionar 3ª coluna | `MembersPanel` |
| 9 | `src/components/Sidebar.tsx` | Modificar — integrar FCCard | `FCCard`, `useLodestoneFC` |
| 10 | `src/index.css` | Adicionar estilos novos | — |

---

## Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Conflito Express 4 vs 5 | Criar mock `req` object — parsers não precisam de servidor Express real |
| Lodestone muda markup | `lodestone-css-selectors` é mantido pelo XIVAPI; atualizar npm package |
| Rate limit do Lodestone | Cache 1h + rate limit server-side; 1 request por chamada |
| Membros: múltiplas páginas | Loop automático com delay 1s; ou carregar página por página sob demanda |
| Crest images com CORS | Images do Lodestone geralmente aceitam CORS; se não, criar proxy no server |
| Performance com 66+ membros | Virtualizar lista se necessário; portrait em lazy load |
| Tipos TypeScript | Nodestone publica `.d.ts`; funciona sem config extra |

---

## Ordem de Implementação

1. Instalar `@xivapi/nodestone` + variável de ambiente
2. Criar `api/lib/lodestone.js` (wrapper + cache)
3. Adicionar rotas no `server.js` (testar com curl/Postman)
4. Criar `useLodestoneFC.ts` (hook)
5. Criar `FCCard.tsx` (card na sidebar)
6. Criar `MembersPanel.tsx` (painel lateral direito)
7. Modificar `DashboardLayout.tsx` (3ª coluna)
8. Modificar `Sidebar.tsx` (integrar FCCard)
9. Adicionar estilos em `index.css`
10. Testar em desktop + mobile + dark/light mode
