# Critique: Hall of the Novice EX — Full App

## Report Header

Method: dual-agent (A: design-review · B: detector-scan)
Browser visualization: **not available** — no browser automation tool exposed in this session. Fallback: CLI detector findings + manual source review only.

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Shimmer skeletons present. No progress indicators on transitions or data mutations. |
| 2 | Match System / Real World | 3 | Excellent Portuguese Sharlayan voice. Inconsistent terminology across pages (3 different names for same nav item). |
| 3 | User Control and Freedom | 3 | Escape closes modals. Back buttons on detail pages. No undo for admin destructive actions. |
| 4 | Consistency and Standards | 2 | Filter chips: rounded-full vs rounded-xl between pages. Active states differ (border-bottom vs glow-bar). Dead Navbar alongside live Sidebar. |
| 5 | Error Prevention | 3 | Image fallbacks, debounced search, focus trap. No confirmation on destructive admin actions. |
| 6 | Recognition Rather Than Recall | 2 | Sidebar uses custom SVGs while dead Navbar uses Lucide — two icon languages. Three navigation systems coexist (Sidebar, dead Navbar, mobile bottom nav). |
| 7 | Flexibility and Efficiency | n/a | Persuade surface — no power-user workflows. |
| 8 | Aesthetic and Minimalist Design | 2 | Hero stacks 12+ visual layers before content. Filter bars exceed Miller's Law limits (7-10 options). |
| 9 | Error Recovery | 2 | Generic error messages ("Erro ao carregar postagens"). No retry buttons on API failures. |
| 10 | Help and Documentation | n/a | Persuade surface — not applicable. |
| **Total** | | **20/32** | **Acceptable** |

---

## Design Specificity Verdict

**DRIFTED — Product-authored but spec-abandoned.**

The Sharlayan academia metaphor is genuinely specific and charming — "Carta da Reitoria," "Fortuna favet Prudentibus," "Acervo Didático e Guias Acadêmicos." This cannot be templated. But the implementation has silently abandoned the design system spec.

**Deterministic scan summary (8 findings across 4 files):**
- `border-accent-on-rounded` (2): Navbar.tsx:19, AcademiaPage.tsx:63, CalendarPage.tsx:211 — thick accent borders on rounded elements
- `side-tab` (2): index.css:753, index.css:1029 — thick left-border accent on blockquotes (CSS, not runtime)
- `broken-image` (3): index.css:126, :199, :199 — `<img>` regex patterns in sanitize.ts flagged as potential placeholder images

**Visual overlays:** Not available. No browser automation tool exposed. Browser injection skipped.

---

## Overall Impression

The site has genuine soul — the Sharlayan academy metaphor is a real creative identity, not a template. The copy voice is exceptional. But the visual implementation drifts from its own design spec, creating a palette that reads "mystical spa" rather than the intended "esports dashboard meets arcane academy." The biggest opportunity is aligning the visual execution with the creative ambition already present in the copy.

---

## What's Working

1. **Copy voice is exceptional and product-specific.** "Carta da Reitoria aos Estudantes," the Latin proverbs, the "Acervo Didático e Guias Acadêmicos" — the academy metaphor isn't decoration, it's genuine community identity. This cannot be copy-pasted from a template.

2. **Loading/error/empty state coverage is thorough.** Shimmer skeletons on every page, image fallbacks with `onError`, empty states with actionable suggestions. The app handles failure gracefully across the board.

3. **WeekCalendarPreview is excellent information design.** Day-by-day breakdown with time-sorted events, type-colored dots, recurring event indicators, and a summary footer. Compact, scannable, emotionally neutral — the right tone for utility.

---

## Priority Issues

### P0 — Design Spec Abandoned Without Documentation

**What:** Primary color is teal (#5BA4B5) instead of spec's orange (#f97316). Tertiary is lavender (#9B7EC8) instead of steel-blue (#5dade2). Body font is Cormorant Garamond instead of Inter. Space Grotesk is declared but never loaded from Google Fonts. Cinzel is used for all headings instead of academy-name-only.

**Why:** The product's visual identity doesn't match its own design system document. Anyone joining the project, any design tool generating from tokens, any stakeholder referencing DESIGN.md will be confused. The spec is now fiction.

**Fix:** Either update DESIGN.md to reflect reality (if the drift was intentional iteration) or revert tokens to spec (if accidental). Do not leave both in conflict.

**Suggested command:** `/impeccable document` (to regenerate DESIGN.md from current code) or manual token revert in index.css

---

### P1 — Dead Navbar Component Creates Confusion

**What:** `src/components/Navbar.tsx` (167 lines) is never imported by any component. It defines its own sticky header with different nav styling, different icon set (Lucide vs custom SVGs), and a completely different mobile nav pattern than Sidebar.

**Why:** Dead code rots. If someone imports it, the app will have two competing navigation systems. It suggests an incomplete refactor.

**Fix:** Delete Navbar.tsx or move to archive/. If intended for future use, add a comment.

**Suggested command:** Manual deletion

---

### P1 — Cards Use `role="link"` Instead of Actual Links

**What:** PostCard (`:22-28`) and RecipeCard use `role="link"` with `onClick` on `<article>` elements. Not actual `<a>` tags.

**Why:** Users cannot right-click "Open in new tab." Middle-click does nothing. Screen readers announce "link" but the element has no `href`. WCAG 2.1 Level A violation.

**Fix:** Wrap cards in `<a>` tags or use `<a>` as root element.

**Suggested command:** `/impeccable harden`

---

### P2 — Cinzel Overuse Violates "Two-Face Rule"

**What:** DESIGN.md states Cinzel should only appear on academy name. But `.font-cinzel` is used in: Sidebar brand, Footer headings, CalendarPage header, AcademiaPage header, calendar weekday headers, and the index.css utility.

**Why:** Using a ceremonial display serif for every heading dilutes its impact and creates visual monotony. The spec reserved it as a signature accent.

**Fix:** Remove `.font-cinzel` from all headings except academy name. Use Space Grotesk for section headings.

**Suggested command:** `/impeccable typeset`

---

### P2 — Decision Overload on Filter Bars

**What:** AcademiaPage filter bar: 5 categories + Receitas link + search = 7 interactive elements. RecipesPage: 9 categories + search = 10 elements.

**Why:** Miller's Law (~7 items). Users must scan, compare, and decide among too many options simultaneously. The Receitas link in Academia filter bar is a navigation action disguised as a filter chip.

**Fix:** Collapse categories into dropdown on mobile. Remove Receitas link from filter bar (exists in Sidebar). Limit visible categories to 5 on desktop.

**Suggested command:** `/impeccable distill`

---

### P3 — GoldenDust Particles on Every Page

**What:** `App.tsx:118` renders `<GoldenDust count={10} />` globally. 10 animated particles on every page — Calendar, Recipes, Admin, 404.

**Why:** Decorative particles should enhance emotional moments (hero, empty states), not add visual noise to utility pages.

**Fix:** Move GoldenDust inside HomePage hero section.

**Suggested command:** `/impeccable quieter`

---

## Persona Red Flags

### Jordan (First-Timer)
- **"Códice Arcano" = blog?** A newcomer must decode that "Códice Arcano" means blog, "Cantina" means recipes, "Arquivo Mágico" means game data. The Sharlayan metaphor is charming for members but opaque for newcomers. Will they find the guides they came for?
- **10px server badge:** "Behemoth — Majestic Battle Academy" at HomePage:104 is 10px uppercase. Non-FFXIV players won't know what "Behemoth" means. First-timers who aren't on this server feel excluded.
- **No visible help:** No FAQ, no "what is this?", no onboarding for new visitors. The Carta da Reitoria is poetic but doesn't explain what the FC does.

### Riley (Stress Tester)
- **PostCard/RecipeCard as links:** Right-clicking cards does nothing. Middle-click does nothing. Opening in new tab is impossible. This breaks expected web behavior.
- **Past events visual graveyard:** CalendarPage past events use `opacity-40 saturate-[0.3] line-through` — a visual cemetery with no recovery path. What if someone wants to see what they missed?
- **Footer layout break:** Footer renders outside DashboardLayout. On desktop, it spans full-width while content is offset by the 256px sidebar. Structural integrity lost at page boundary.

### Casey (Distracted Mobile User)
- **Two mobile nav patterns:** Sidebar hamburger button + bottom nav bar coexist on mobile. The hamburger opens a full overlay sidebar, while the bottom nav provides quick access. Which one does the user use? Cognitive overhead.
- **Filter bars overflow on mobile:** RecipesPage 9 categories + search on a 375px screen. Horizontal scroll or overflow hidden — either way, some categories are unreachable.

---

## Minor Observations

- Footer renders outside DashboardLayout — full-width break on desktop.
- Hardcoded Lodestone FC ID in MembersCard (9234349560946612399).
- Quick Actions Banner duplicates hero content (Discord link, server info).
- Toast animation classes defined but unused.
- `text-accent-orange` utility class maps to teal — class name is a lie inherited from original spec.

---

## Questions to Consider

1. **Who is this homepage for?** Prospective members (hero CTA "Quero Me Matricular") or existing members (sidebar navigation dominates)? The Quick Actions Banner serves neither — it restates what the hero says. Pick one audience.

2. **Is the academy metaphor costing conversion?** New visitors must decode "Códice Arcano" = blog, "Cantina" = recipes. Would "Blog," "Receitas," "Eventos" convert better? The metaphor is charming for members but opaque for newcomers.

3. **The teal + lavender palette reads "mystical spa" — intentional?** The spec demanded vibrant orange for urgency. The actual teal is calming and blends into slate. Did the palette shift happen deliberately, or did someone like teal and nobody challenged it?

4. **Does reduced-motion actually work?** Framer Motion, CSS keyframes, and GoldenDust particles are three separate animation systems. The CSS `@media (prefers-reduced-motion)` block kills CSS animations. Framer Motion has its own config. GoldenDust likely ignores both. Has anyone tested with reduced-motion enabled?

5. **Why does Navbar.tsx exist?** 167 lines of dead code with its own navigation pattern. Was it the original nav replaced by Sidebar? If so, delete it. If planned, for what?
