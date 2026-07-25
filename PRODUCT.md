# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Brazilian FFXIV players seeking a safe, immersive learning environment. They arrive via Discord or community referral, looking for guides, learning parties (Extreme/Savage/Ultimate raids), and a toxic-free community hub. Their context is one of discovery — they want to learn the game at a deeper level without elitism or gatekeeping.

## Product Purpose

The Hall of the Novice EX [HoN] is a community portal for a Final Fantasy XIV Free Company that expands the in-game "Hall of the Novice" concept to advanced content. The site serves as the digital campus: a place to discover the guild, access PT-BR guides, check upcoming events and learning parties, and understand the academy's philosophy. Success means players feel welcomed, educated, and connected before they even step into the FC house.

## Positioning

HoN combines the Sharlayan academy fantasy theme with a zero-tolerance toxicity-free culture. No other FFXIV community site wraps an academic, mentorship-driven identity around genuinely safe learning — generic gaming portals offer neither the immersive theming nor the cultural commitment to patience and inclusion.

## Operating Context

Members discover HoN through Discord or community referral, then read guides and codex articles to learn advanced content. The interactive calendar drives attendance at learning parties (Extreme/Savage/Ultimate raids) and guild events. The lifecycle is: discover → read → attend → belong. The admin panel is used by faculty to publish guides and manage events.

## Capabilities and Constraints

- **Guide CMS:** Full CRUD for articles with categories (Codice, Combate EX/Savage, Crafting & Gathering, Noticias), pinning, draft/published status, cover images, tags, and Markdown rendering.
- **Activity Calendar:** Interactive calendar with event types, filtering, animated detail modals, and day highlighting.
- **Admin Panel:** Password-protected (JWT + httpOnly cookie) with management tabs for posts, events, and event types.
- **Dark/Light Theme:** Toggle persisted via localStorage, applied via CSS custom properties.
- **Tech Stack:** React 19 + TypeScript, Vite 6, Tailwind CSS v4, Express.js API, Supabase (PostgreSQL).
- **Constraint:** Content is PT-BR first. The interface and copy must feel native, not translated.

## Brand Commitments

Scholarly, Warm, Immersive. The voice is that of a wise mentor — authoritative but patient, never condescending. The tone balances academic formality (the Sharlayan university fantasy) with genuine community warmth. Name: Hall of the Novice EX [HoN]. Anti-references: generic gaming portals (neon colors, aggressive dark themes, e-sports aesthetics), glassmorphism, gradient text, bounce animations, corporate SaaS sterility.

## Evidence on Hand

Post content (guides and articles) exists and is published. The DESIGN.md defines a complete visual system. The app is a working MVP with functional features.

## Product Principles

1. **Patience is pedagogy**: Every element should feel like it's teaching, not shouting. Calm hierarchy, clear reading paths, generous whitespace.
2. **Immersive theming, not cosplay**: The Sharlayan academy theme informs the experience without becoming a literal game asset. It should feel like a real institution, not a screenshot.
3. **Toxicity-free by design**: The visual language is welcoming and safe. No aggressive gradients, no dark-and-edgy color schemes, no confrontational UI patterns.
4. **PT-BR first**: Content is in Brazilian Portuguese. The interface, copy, and interactions should feel native, not translated.
5. **Show, don't tell**: The site embodies the academy's values through its UX rather than stating them in banners.

## Accessibility & Inclusion

Standard accessibility: readable text sizes, sufficient color contrast (the teal/gold/ivory palette already performs well), keyboard navigation support. No specific WCAG compliance target at this time, but the design should naturally avoid common pitfalls (low contrast text, tiny click targets, missing focus states).
