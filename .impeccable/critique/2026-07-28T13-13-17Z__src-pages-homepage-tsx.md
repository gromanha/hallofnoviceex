---
target: src/pages/HomePage.tsx
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 1
p2_count: 3
p3_count: 1
timestamp: 2026-07-28T13-13-17Z
slug: src-pages-homepage-tsx
---
# Critique: Hall of the Novice EX — Homepage

**Target:** `src/pages/HomePage.tsx`
**Mode:** Persuade (discovery, conversion, belonging)
**Method:** dual-agent (A: design review · B: detector scan)

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Loading skeleton exists but no post-fetch feedback. API error swallowed silently. No empty-state retry. |
| 2 | Match Between System and Real World | 3 | Sharlayan academic metaphor well-executed. Minor: "diretamente do Supabase" leaks infrastructure. |
| 3 | User Control and Freedom | 3 | Standard nav, two clear hero paths. Minor: no new-tab disclosure on Discord links. |
| 4 | Consistency and Standards | 3 | Tokens applied consistently. One break: hero `border-b-4` heavier than DESIGN.md gold-line vocabulary. |
| 5 | Error Prevention | 2 | No retry on API failure. Empty state assumes admin user. |
| 6 | Recognition Rather Than Recall | 3 | Clear nav labels with icons. Post cards show full metadata. Initials-as-avatars recognizable. |
| 7 | Flexibility and Efficiency | n/a | Persuade surface; no power-user workflows. |
| 8 | Aesthetic and Minimalist Design | 3 | Clean hierarchy, no decorative clutter. Parchment texture tasteful. |
| 9 | Error Recovery | 1 | API errors produce no user-facing recovery. Empty state has no retry. |
| 10 | Help and Documentation | n/a | Persuade surface; not a tool with help needs. |

**Total: 23/32** (2 heuristics n/a) — **Acceptable**

---

## Design Specificity Verdict

**Author'd — 7/10.** This is recognizably HoN, not a generic gaming portal.

**Product-specific:** Teal-gold-ivory palette anchored to Sharlayan illustrations. Cinzel serif for institutional gravitas. Gold scarcity rule respected. Pillar section and "Corpo Docente" with role titles are unique. PT-BR native copy throughout.

**Generic:** Hero structure (badge → headline → subtext → 2 CTAs) is a template pattern. Post grid structurally identical to any blog listing. Pillar cards are flat rectangles. Architectural motifs (Gothic arches, gold trim, floating books) from DESIGN.md are defined but not deployed on the homepage.

**Opportunity missed:** The parchment texture in the hero is the only architectural motif that physically appears. The design system is richer than what's deployed.

---

## Overall Impression

The homepage has a clear, calm identity matching the "scholarly, warm, immersive" brand. It's well-structured, readable, and doesn't assault the visitor. The color system genuinely feels like an academy, not a gaming clan.

Biggest weakness: **structurally generic content wrapped in product-specific tokens.** The layout patterns are borrowed from SaaS landing page templates. The FFXIV identity lives in the words and colors, not in the structure or interaction model.

---

## What's Working

1. **Color system discipline.** Teal-gold-ivory is cohesive and product-specific. Gold used sparingly. Dark mode thoughtful with its own tokens.
2. **PostCard component.** Handles all edge cases well: image error fallback, pinned badges, category labels, tags, author/date, hover state with gold border shift. Most polished component on the page.
3. **Emotional tone of copy.** "O erro é visto apenas como a ementa da aula" is a perfect encapsulation of anti-toxicity philosophy. Copy reinforces brand without being preachy.

---

## Priority Issues

**[P1] Silent failure on API error — user stuck on loading skeleton**
If `apiGet('/api/posts')` throws, user sees empty state ("Nenhuma postagem encontrada") with no distinction between "no posts yet" and "connection failed." New visitors may leave. Empty-state copy assumes admin access.
**Fix:** Add `error` state. Show distinct error card with retry button and friendly PT-BR message.
**Command:** `/impeccable harden`

**[P2] Empty state copy addresses admin, not visitor**
Line 139: "Use o Painel Admin para criar a primeira publicação" shown to every visitor. Primary persona is a prospective member without admin access.
**Fix:** Different empty states for visitors vs. admins. Visitor: "Em breve, nossos professores publicarão guias aqui."
**Command:** `/impeccable clarify`

**[P2] Hero leaks infrastructure detail**
Line 117: "Publicadas pelo Corpo Docente diretamente do Supabase" — "Supabase" is meaningless to visitors, breaks immersion.
**Fix:** Change to "Publicadas pelo Corpo Docente."
**Command:** `/impeccable clarify`

**[P2] Architectural motifs not realized on homepage**
DESIGN.md defines Gothic arches, domed silhouettes, gold ornamental trim, floating books. Homepage uses none — flat cards, rectangles, standard rounded corners.
**Fix:** Introduce at least one motif: arched hero bottom edge, gold ornamental dividers, or subtle floating-book decoration.
**Command:** `/impeccable bolder`

**[P3] Discord links lack new-tab disclosure in CTA copy**
Lines 89, 283: external links open new tabs with no visual indicator in the CTA text.
**Fix:** Minor — acceptable in Persuade context, but consider aria-label noting external link.
**Command:** `/impeccable polish`

---

## Persona Red Flags

**Jordan (First-Timer):**
- API error → sees empty site → thinks it's abandoned → bounces
- "Ver Calendário de Aulas" CTA doesn't preview what's on the other side
- "Corpo Docente" role titles (Reitor, Conselheiro, Druida) assume RP/FXIV knowledge

**Sam (Accessibility-Dependent):**
- PostCard `article` has `onClick` but no `onKeyDown` or `tabIndex` — click-only, not keyboard accessible
- `:focus-visible` styles exist and work — good
- Color contrast passes WCAG AA throughout

**Casey (Distracted Mobile User):**
- Mobile nav bar in thumb zone — good
- Hero CTAs stack vertically on mobile — reachable
- "Pilares" renders 4 cards in single column on mobile — long scroll before team section

---

## Minor Observations

- `Navbar.tsx:37` — Active link uses hardcoded `text-white` instead of `var(--color-on-primary)`
- `PostCard.tsx` — Multiple hardcoded `slate-*` values instead of design tokens
- `Footer.tsx:7` — Hardcoded `#121921` instead of token
- `HomePage.tsx:14-27` — Animation variants recreated on every render
- `PostCard.tsx:85` — Tags limited to 3 with no overflow indicator

---

## Questions to Consider

1. What if the homepage felt more like entering a campus than scrolling a product page?
2. Is the "Corpo Docente" section earning its space — do static team cards convert visitors?
3. What happens when there are 20+ posts — does the homepage become noise?
4. Should there be a "read a guide" CTA to serve the discover → read → attend → belong lifecycle?

---

> **Trend for `src-pages-homepage-tsx`:** First run, no trend yet.
