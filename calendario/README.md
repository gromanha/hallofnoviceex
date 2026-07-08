# Calendario Hall of the Novice EX

Interactive academic event calendar for the Hall of the Novice EX [HoN] FFXIV guild. Members browse events by day and month, filter by type, and see details at a glance. Admins manage the calendar through a secure CRUD panel.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | Tailwind CSS 4 + custom CSS |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| Backend | Express 4, Node.js |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Database | Supabase (PostgreSQL) |
| Cookies | cookie-parser (httpOnly, sameSite: strict) |

## Prerequisites

- Node.js >= 18
- A [Supabase](https://supabase.com) project (free tier works)

## Quick Start

```bash
# 1. Install dependencies
cd calendario
npm install

# 2. Create your .env from the example
cp .env.example .env

# 3. Fill in your Supabase credentials in .env
#    (see "Environment Variables" below)

# 4. Run the database schema
#    Open Supabase Dashboard > SQL Editor, paste and run:
#    calendario/supabase-schema.sql

# 5. Start dev servers (Vite :3000 + Express :3001)
npm run dev
```

Open `http://localhost:3000/calendario/`

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Where to get | Description |
|----------|-------------|-------------|
| `SUPABASE_URL` | Supabase Dashboard > Settings > API | `https://YOUR_PROJECT.supabase.co` |
| `SUPABASE_ANON_KEY` | Same as above | Public anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as above | Admin key (**server only**, never exposed to client) |
| `JWT_SECRET` | Generate with `openssl rand -hex 64` | Signs admin session cookies |
| `SETUP_TOKEN` | Choose a strong random string | One-time token to create the first admin |
| `PORT` | Default `3001` | Express server port |

**Never commit `.env` to git.** It is already in `.gitignore`.

## First Admin Setup

After starting the server and running the schema:

```bash
# Create the first admin account
curl -X POST http://localhost:3001/api/auth?op=setup \
  -H "Content-Type: application/json" \
  -H "X-Setup-Token: YOUR_SETUP_TOKEN" \
  -d '{"username":"admin","password":"your-strong-password","display_name":"Admin"}'
```

This endpoint only works while zero admins exist in the database. After the first admin is created, `setup` is permanently disabled.

## Project Structure

```
calendario/
├── server.js              # Express API (auth, events CRUD, event-types CRUD)
├── vite.config.ts         # Vite config with /api proxy to :3001
├── tsconfig.json          # TypeScript config (noEmit, react-jsx)
├── supabase-schema.sql    # Database schema (run in Supabase SQL Editor)
├── package.json
├── .env.example           # Template for environment variables
├── index.html             # SPA entry point
├── src/
│   ├── main.tsx           # React root mount
│   ├── App.tsx            # Public calendar + hash routing
│   ├── index.css          # Tailwind + custom animations
│   ├── types.ts           # TypeScript interfaces
│   ├── hashRouter.ts      # Lightweight hash-based router (#/, #/admin)
│   ├── lib/
│   │   └── api.ts         # Fetch wrappers with timeout + error handling
│   ├── hooks/
│   │   ├── useAuth.ts     # Auth state (login, logout, session refresh)
│   │   └── useFocusTrap.ts# Modal focus trap + Escape key handling
│   ├── components/
│   │   ├── LoginGate.tsx  # Admin login screen
│   │   └── AdminPanel.tsx # Event + type CRUD panel
│   └── assets/
│       ├── logo.png       # Guild logo
│       ├── id.png         # Calendar background
│       ├── id.jpeg        # Alternate background
│       └── door.png       # Decorative asset
```

## Architecture

```
Browser ──fetch──> Vite dev proxy (/api/*) ──> Express :3001 ──> Supabase
                    localhost:3000              server.js         REST API
```

- **Public reads**: `GET /api/events`, `GET /api/event-types` (no auth)
- **Admin writes**: `POST/PATCH/DELETE /api/events`, `POST/PATCH/DELETE /api/event-types` (require cookie JWT)
- **Auth**: `GET /api/auth?op=me`, `POST /api/auth?op=login|logout|setup`

## API Reference

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/events` | List all events |
| `GET` | `/api/event-types` | List all event types (sorted) |

### Admin (requires `hon_admin` cookie)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth?op=me` | Get current admin profile |
| `POST` | `/api/auth?op=login` | Login (sets cookie) |
| `POST` | `/api/auth?op=logout` | Logout (clears cookie) |
| `POST` | `/api/auth?op=setup` | Create first admin (requires `X-Setup-Token` header) |
| `POST` | `/api/events` | Create event |
| `PATCH` | `/api/events` | Update event (body: `{id, ...fields}`) |
| `DELETE` | `/api/events` | Delete event (body: `{id}`) |
| `POST` | `/api/event-types` | Create event type |
| `PATCH` | `/api/event-types` | Update event type (body: `{id, ...fields}`) |
| `DELETE` | `/api/event-types` | Delete event type (body: `{id}`) |

### Validation

All write endpoints validate:
- UUID format for IDs
- Month names (Portuguese: Janeiro–Dezembro)
- Day range per month (1–31, respecting actual calendar)
- Type keys (`/^[a-z0-9][a-z0-9_-]{0,30}$/`)
- Hex colors (`/#^[0-9a-f]{6}$/i`)
- Image URLs (http/https only, blocks javascript/data/vbscript)
- String lengths (titles: 200, descriptions: 2000, etc.)

### Rate Limiting

Auth endpoints (`/api/auth`) are rate-limited to 20 requests per IP per 15-minute window.

## Database Schema

Three tables, all with RLS enabled:

### `admins`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| username | TEXT | NOT NULL, UNIQUE |
| password_hash | TEXT | NOT NULL |
| display_name | TEXT | nullable |
| created_at | TIMESTAMPTZ | default now() |

### `events`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| month | TEXT | NOT NULL (Portuguese month name) |
| day | INTEGER | NOT NULL (1–31) |
| time | TEXT | NOT NULL (e.g. "09:00 — 11:30") |
| title | TEXT | NOT NULL |
| description | TEXT | default '' |
| instructor | TEXT | default '' |
| type | TEXT | NOT NULL (FK to event_types.key) |
| image | TEXT | default '' |
| crystal | BOOLEAN | default false |
| stars | BOOLEAN | default false |
| indicators | TEXT[] | default '{}' |
| mana_progress | INTEGER | default 0 |
| spots | INTEGER | nullable |
| rank | TEXT | nullable |
| created_by | UUID | FK → admins(id) |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | nullable |

### `event_types`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| key | TEXT | NOT NULL, UNIQUE |
| label | TEXT | NOT NULL |
| color | TEXT | default '#1a3a5f' |
| icon | TEXT | default 'Wand2' (Lucide icon name) |
| sort_order | INTEGER | default 0 |
| created_at | TIMESTAMPTZ | default now() |

RLS policies: public `SELECT` on `events` and `event_types`. All writes go through `server.js` using the service role key (bypasses RLS).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite (:3000) + Express (:3001) concurrently |
| `npm run dev:vite` | Start only the Vite dev server |
| `npm run dev:api` | Start only the Express API server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run start` | Start production Express server |

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in Vercel
3. Set **Root Directory** to `calendario/`
4. Set **Output Directory** to `dist/`
5. Add environment variables in Vercel Dashboard > Settings
6. The `vercel.json` rewrites handle `/calendario/*` routing

## Security

- Passwords hashed with bcryptjs (12 rounds)
- JWT cookie: `httpOnly`, `sameSite: strict`, `secure` in production
- `SETUP_TOKEN` used once to create the first admin, then permanently disabled
- `.env` in `.gitignore` — never committed
- Service role key only in `server.js` — never exposed to the browser
- Input validation on all endpoints (UUID, month, day, type key, color, URL)
- Rate limiting on auth endpoints (20 req/15 min/IP)
- Security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
- Request timeout (15s) on client-side fetch
- Image URLs sanitized (blocks javascript: and data: protocols)
