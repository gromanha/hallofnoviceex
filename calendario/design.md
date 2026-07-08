# Design Document — Calendario Hall of the Novice EX

## Visao Geral

Calendario interativo de atividades academicas de uma academia de magia ficticia.
O usuario publico navega o calendario, seleciona dias e ve os eventos.
Um administrador autenticado gerencia (CRUD) os eventos por um painel separado.

---

## Arquitetura

```
calendario/
├── server.js                 # Express API (porta 3001)
├── vite.config.ts            # Vite + proxy /api → :3001
├── supabase-schema.sql       # SQL para criar tabelas no Supabase
├── .env                      # Variaveis de ambiente (NAO committar)
├── src/
│   ├── main.tsx              # Entry point React
│   ├── App.tsx               # Roteamento por hash + calendario publico
│   ├── types.ts              # Types TypeScript
│   ├── index.css             # Tailwind + custom CSS (animacoes, textures)
│   ├── hashRouter.ts         # Hash router leve (#/ e #/admin)
│   ├── lib/
│   │   └── api.ts            # Fetch wrappers (GET/POST/PATCH/DELETE) + timeout
│   ├── hooks/
│   │   ├── useAuth.ts        # Hook de autenticacao (login/logout/me)
│   │   └── useFocusTrap.ts   # Focus trap para modais (a11y)
│   ├── components/
│   │   ├── LoginGate.tsx     # Tela de login do admin
│   │   └── AdminPanel.tsx    # Painel CRUD de eventos
│   └── assets/
│       ├── logo.png          # Logo do site
│       ├── id.png            # Background do calendario
│       └── door.png          # Asset decorativo
```

### Fluxo de dados

```
Browser  ──fetch──>  Vite proxy (/api/*)  ──>  Express server.js  ──>  Supabase
                      localhost:3000           localhost:3001             REST API
```

- **Eventos publicos**: `GET /api/events`, `GET /api/event-types` (anon, sem auth)
- **CRUD admin**: `POST/PATCH/DELETE /api/events`, `POST/PATCH/DELETE /api/event-types` (requer cookie JWT)
- **Auth**: `GET /api/auth?op=me`, `POST /api/auth?op=login|logout|setup`

---

## Stack Tecnica

| Camada       | Tecnologia                          |
|--------------|-------------------------------------|
| Frontend     | React 19, TypeScript, Vite 6        |
| Estilo       | Tailwind CSS 4 + CSS custom         |
| Animacoes    | Motion (Framer Motion)              |
| Icones       | Lucide React                        |
| Backend      | Express 4, Node.js                  |
| Auth         | JWT (jsonwebtoken) + bcryptjs       |
| Banco        | Supabase (PostgreSQL managed)       |
| Cookies      | cookie-parser (httpOnly, sameSite)  |
| Dev          | concurrently (Vite + Express)       |

---

## Paleta de Cores

Tema visual: pergaminho antigo + ouro + azul profundo.

| Token                    | Cor      | Uso                                 |
|--------------------------|----------|-------------------------------------|
| `--color-surface`        | `#fcf9f0`| Fundo principal (papel pergaminho)  |
| `--color-primary`        | `#002446`| Azul escuro — botoes, titulos       |
| `--color-secondary`      | `#735c00`| Dourado — bordas, acentos, cristais |
| `--color-secondary-container` | `#fed65b` | Amarelo ouro — highlights, selected |
| `--color-outline`        | `#73777f`| Texto secundario                    |
| `--color-outline-variant`| `#c3c6cf`| Bordas leves                        |
| `--color-error`          | `#ba1a1a`| Erros, deletar                      |
| `--color-error-container`| `#ffdad6`| Fundo de erro                       |
| `--color-surface-container` | `#f1eee5` | Cards, painel direito             |
| `--color-primary-container` | `#1a3a5f` | Fundo header admin, toasts        |
| `--color-primary-fixed-dim` | `#abc8f5` | Cristais, detalhes azuis claros  |

---

## Tipografia

| Fonte            | CSS Class  | Uso                                    |
|------------------|------------|----------------------------------------|
| Playfair Display | `font-serif`| Titulos de eventos, numeracao dos dias |
| Hanken Grotesk   | `font-sans` | Texto corrido, descricoes              |
| Space Grotesk    | `font-caps` | Labels uppercase, badges, filtros      |
| Cinzel           | `font-cinzel`| Titulo principal do calendario        |

---

## Layout (3 colunas)

```
┌──────────────────────────────────────────────────────────────┐
│  SIDEBAR ESQUERDA  │   CALENDARIO CENTRAL   │  LEDGER DIREITO│
│  (filtros, logo)   │   (grade de dias)      │  (eventos do   │
│                    │                        │   dia selecionado│
│  w-56/xl:w-64      │   flex-1               │  w-80/xl:w-96   │
│  bg #f6f3ea         │   bg #fcf9f0           │  bg #f1eee5     │
└──────────────────────────────────────────────────────────────┘
```

- **Sidebar esquerda**: Logo, botao "Painel Admin", filtros por tipo, profecia do dia
- **Calendario central**: Grade 7 colunas (D S T Q Q S S), 5-6 semanas, navegacao por mes
- **Ledger direito**: Lista de eventos do dia selecionado com timeline vertical

Em mobile, as colunas empilham verticalmente.

---

## Componentes

### App.tsx (publico)
- Roteamento por hash: `#/` = calendario, `#/admin` = autenticacao
- Busca eventos via `GET /api/events` no mount
- Calendario interativo: selecao de dia, filtros por tipo
- Toast de "Profecia do Dia" (aleatoria)
- Navegacao entre meses (12 meses a partir do atual)

### LoginGate.tsx
- Formulario de usuario + senha
- Erros exibidos inline (credenciais invalidas, etc.)
- Link "Voltar para o calendario publico"

### AdminPanel.tsx
- Toolbar: titulo, contador de eventos, botoes "Recarregar" e "Novo Evento"
- Tabela com todos os eventos: dia, mes, horario, titulo, tipo, instrutor, acoes
- Modal de criacao/edicao com campos: mes, dia, horario, titulo, descricao, instrutor, tipo, imagem URL, cristal, estrelas
- Botao de deletar com confirmacao

### LoginGate.tsx
- Card centralizado com borda dourada, topo gold bar
- Icone BookOpen, titulo "Reitoria - HoN EX"
- Campos: Usuario, Senha
- Botao "Entrar no Painel" com icone Sparkles

---

## Tipos de Evento (EventType)

| Valor        | Label                    | Cor indicador     |
|--------------|--------------------------|-------------------|
| `spells`     | Spells (Magias)          | `#1a3a5f` (azul)  |
| `tactics`    | Tactics (Taticas)        | `#735c00` (ouro)  |
| `alchemy`    | Alquimia (Alchemy)       | `emerald-700`     |
| `ritual`     | Ritual Sagrado           | `purple-700`      |
| `other`      | Outros                   | `#1a3a5f` (padrao)|

---

## Animacoes e Efeitos

| Efeito             | Classe CSS           | Descricao                                    |
|--------------------|----------------------|----------------------------------------------|
| Pergaminho         | `parchment-texture`  | Textura de papel sobre superficies           |
| Cantos filigrana   | `filigree-corner`    | SVG ornamental no canto superior-esquerdo    |
| Cristal flutuante  | `floating-crystal`   | Flutuacao vertical + brilho pulsante (4s)    |
| Brilho cristal     | `crystal-glow`       | Box-shadow azul claro pulsante               |
| Pulso "Hoje"       | `today-pulse`        | Borda dourada pulsante no dia atual          |
| Brilho arcano      | `arcane-glow`        | Hover com sombra azul + dourada, translate   |
| Toast notificacao  | motion `AnimatePresence` | Slide-in de cima com spring animation    |

---

## API (server.js)

### Endpoints publicos

| Metodo | Rota              | Descricao                    |
|--------|-------------------|------------------------------|
| GET    | `/api/health`     | Health check                 |
| GET    | `/api/events`     | Lista todos os eventos       |
| GET    | `/api/event-types`| Lista tipos de atividade     |

### Endpoints autenticados (cookie `hon_admin`)

| Metodo | Rota                       | Descricao              |
|--------|----------------------------|------------------------|
| GET    | `/api/auth?op=me`          | Perfil do admin logado |
| POST   | `/api/auth?op=login`       | Login (seta cookie)    |
| POST   | `/api/auth?op=logout`      | Limpa cookie           |
| POST   | `/api/auth?op=setup`       | Cria 1o admin (X-Setup-Token) |
| POST   | `/api/events`              | Cria evento            |
| PATCH  | `/api/events`              | Atualiza evento        |
| DELETE | `/api/events`              | Deleta evento          |
| POST   | `/api/event-types`         | Cria tipo              |
| PATCH  | `/api/event-types`         | Atualiza tipo          |
| DELETE | `/api/event-types`         | Deleta tipo            |

---

## Supabase (Schema)

### Tabela `admins`

| Coluna        | Tipo   | Constraints        |
|---------------|--------|--------------------|
| id            | UUID   | PK, default uuid() |
| username      | TEXT   | NOT NULL, UNIQUE   |
| password_hash | TEXT   | NOT NULL           |
| display_name  | TEXT   | nullable           |
| created_at    | TIMESTAMPTZ | default now()  |

### Tabela `events`

| Coluna        | Tipo     | Constraints              |
|---------------|----------|--------------------------|
| id            | UUID     | PK, default uuid()       |
| month         | TEXT     | NOT NULL                 |
| day           | INTEGER  | NOT NULL                 |
| time          | TEXT     | NOT NULL                 |
| title         | TEXT     | NOT NULL                 |
| description   | TEXT     | default ''               |
| instructor    | TEXT     | default ''               |
| type          | TEXT     | NOT NULL (spells/etc)    |
| image         | TEXT     | default ''               |
| crystal       | BOOLEAN  | default false            |
| stars         | BOOLEAN  | default false            |
| indicators    | TEXT[]   | default '{}'             |
| mana_progress | INTEGER  | default 0                |
| spots         | INTEGER  | nullable                 |
| rank          | TEXT     | nullable                 |
| created_by    | UUID     | FK → admins(id)          |
| created_at    | TIMESTAMPTZ | default now()        |
| updated_at    | TIMESTAMPTZ | nullable              |

RLS habilitado. SELECT publico. Inserts/updates/deletes apenas via service_role (server.js).

---

## Deploy

- **Dev**: `npm run dev` (concurrently Vite :3000 + Express :3001)
- **Build**: `npm run build` → `dist/`
- **Producao**: Vite build servido estaticamente, API em server.js (Ex: Vercel, Railway, Render)
- **Vercel**: `base: '/calendario/'` no vite.config.ts, rewrites necessarios

---

## Seguranca

- Senhas hasheadas com `bcryptjs` (12 rounds)
- Cookie JWT `httpOnly`, `sameSite: strict`, `secure` em producao
- JWT com algoritmo explicito `HS256`, secret minimo 32 caracteres
- `SETUP_TOKEN` usado uma unica vez para criar o primeiro admin (comparacao timing-safe)
- `.env` no `.gitignore` (nunca committado)
- Service role key apenas no server.js (nunca exposta ao browser)
- Validacao de inputs em todos os endpoints (UUID, mes, dia, tipo, cor, URL)
- Rate limiting nos endpoints de auth (20 req/15 min/IP)
- Headers de seguranca (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
- Timeout de 15s no client-side fetch
- URLs de imagem sanitizadas (bloqueia javascript: e data:)
