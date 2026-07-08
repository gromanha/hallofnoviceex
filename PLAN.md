# PLAN: Implement New DESIGN.md Across the Project

## Goal

Apply the updated root `DESIGN.md` (image-grounded design system derived from "imagens academia" illustrations) consistently across both the main site and the calendario sub-project.

---

## Scope

| Target | Tech Stack | Current State |
|---|---|---|
| Main site (`index.html`) | Vanilla HTML/CSS/JS | CSS vars already match most tokens; needs 3 new color families |
| Calendario (`calendario/`) | React + Tailwind CSS v4 | Has own `DESIGN.md` (275 lines) that diverges from root; CSS vars in `index.css` |
| Calendario build (`dist-calendario/`) | Static output | Rebuilt after calendario changes |

---

## Phase 1: Main Site (`index.html`)

### Step 1 — Add new color tokens to `:root`

Add after existing CSS variables (around line 73), before the closing `}`:

```css
/* Crystal — Magical Accent */
--crystal: #5ECFCF;
--crystal-light: #D4F5F5;

/* Flora & Rose — Supporting */
--rose: #C46B7D;
--rose-light: #F4E3E7;
--sage: #6B8F71;
--sage-light: #E3EDE5;
```

### Step 2 — Add dark mode equivalents

Add inside the `[data-theme="dark"]` block (around line 111), before the closing `}`:

```css
--crystal: #7EEEE5;
--crystal-light: rgba(126, 238, 229, 0.1);
--rose: #E88B9A;
--rose-light: rgba(232, 139, 154, 0.1);
--sage: #7FB888;
--sage-light: rgba(127, 184, 136, 0.1);
```

### Step 3 — Add watercolor gradient + crystal glow utility classes

Add before the closing `</style>` tag (around line 1498):

```css
/* ── Watercolor Gradients (from DESIGN.md) ── */
.wash-teal {
  background: linear-gradient(135deg, var(--teal-light) 0%, transparent 100%);
}
.wash-gold {
  background: linear-gradient(135deg, var(--gold-light) 0%, transparent 100%);
}
.wash-sunset {
  background: linear-gradient(135deg, var(--teal-light) 0%, var(--lavender-light) 100%);
}

/* ── Crystal Glow (from DESIGN.md) ── */
.crystal-glow {
  box-shadow: 0 0 12px rgba(94, 207, 207, 0.15);
}
```

### Notes for Phase 1
- No structural HTML changes needed
- No JavaScript changes needed
- All changes are additive — existing behavior is preserved
- The existing component styles (buttons, cards, nav, modal) already align with the root DESIGN.md

---

## Phase 2: Calendario DESIGN.md

### Step 4 — Replace `calendario/DESIGN.md`

Replace the entire 275-line file with a new version (~320 lines) derived from the root DESIGN.md, adapted for the calendar context.

**Preserve from existing calendario DESIGN.md:**
- "The Schedule Board" creative north star
- Hanken Grotesk as body font (not Inter)
- Space Grotesk as label/mono font
- Calendar-specific components: Calendar Cells, Event Ledger, Timeline, Event Form Modal
- Event type color-coding (spells, tactics, alchemy, ritual)
- Linen (#F6F3EA) as sidebar background

**Add from root DESIGN.md:**
- Architecture & Motifs section (Gothic arches, domes, gold trim, winged crest)
- Flora & Nature Symbolism section (lilies, lavender, sage, cherry blossoms)
- Iconography section (crest, role icons, crystal, floating books)
- Dark Mode — "Eorzean Nightfall" section with transformation table
- Crystal Cyan color token and Crystal Glow Rule
- Rose and Sage supporting color tokens
- Watercolor gradient families
- Enhanced Do's and Don'ts with image-grounded rules

**New color tokens to add to YAML frontmatter:**
```yaml
crystal: "#5ECFCF"
crystal-light: "#D4F5F5"
rose: "#C46B7D"
rose-light: "#F4E3E7"
sage: "#6B8F71"
sage-light: "#E3EDE5"
```

---

## Phase 3: Calendario CSS (`calendario/src/index.css`)

### Step 5 — Add new Tailwind theme tokens

Add inside the `@theme` block (around line 188), after existing color tokens:

```css
/* Crystal — Magical Accent */
--color-crystal: #5ECFCF;
--color-crystal-light: #D4F5F5;

/* Flora & Rose — Supporting */
--color-rose: #C46B7D;
--color-rose-light: #F4E3E7;
--color-sage: #6B8F71;
--color-sage-light: #E3EDE5;
```

### Step 6 — Add watercolor gradient utility classes

Add after the `@theme` block (after line 188), before the base custom definitions:

```css
/* ── Watercolor Gradients (from DESIGN.md) ── */
.wash-teal {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, transparent 100%);
}
.wash-gold {
  background: linear-gradient(135deg, var(--color-secondary-light) 0%, transparent 100%);
}
.wash-sunset {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-tertiary-light) 100%);
}
```

### Step 7 — Update `.crystal-glow` effect

Change line 212-214 from:

```css
.crystal-glow {
  box-shadow: 0 0 15px rgba(29, 106, 106, 0.4);
}
```

To:

```css
.crystal-glow {
  box-shadow: 0 0 12px rgba(94, 207, 207, 0.15);
}
```

This aligns with the root DESIGN.md's Crystal Glow Rule — using the new crystal cyan (`#5ECFCF`) instead of heavy teal.

---

## Phase 4: Calendario Component Audit

### Step 8 — Audit components for hardcoded colors

Review the following 6 component files for any hardcoded color values that should reference the new design system tokens:

| File | What to check |
|---|---|
| `App.tsx` | `EVENT_TYPE_COLORS` map (line 110-116) — already aligned, verify no changes needed |
| `AdminPanel.tsx` | Form inputs, buttons, status indicators |
| `LoginGate.tsx` | Background, card, button colors |
| `WelcomeBanner.tsx` | Background gradient, text colors |
| `FilterHint.tsx` | Background, accent colors |
| `EmptyCalendarState.tsx` | Illustration colors, text |

**Expected outcome:** Most components use Tailwind classes referencing `@theme` tokens (e.g., `bg-primary`, `text-secondary`), so they will automatically pick up new tokens. Only hardcoded hex values need updating.

---

## Phase 5: Build & Verify

### Step 9 — Build and lint

```bash
# TypeScript check
cd calendario && npm run lint

# Production build
cd calendario && npm run build
```

### Verification Checklist

- [ ] Root `DESIGN.md` exists and contains 10 sections (~393 lines)
- [ ] `calendario/DESIGN.md` exists and contains 8 sections (~320 lines)
- [ ] Main site `index.html` has crystal/rose/sage CSS variables in both light and dark mode
- [ ] Main site `index.html` has watercolor gradient and crystal glow utility classes
- [ ] Calendario `index.css` has crystal/rose/sage tokens in `@theme` block
- [ ] Calendario `index.css` has watercolor gradient utilities
- [ ] Calendario `index.css` `.crystal-glow` uses `rgba(94, 207, 207, 0.15)`
- [ ] No TypeScript errors (`npm run lint` passes)
- [ ] Build succeeds (`npm run build` completes)
- [ ] No hardcoded hex colors in components that should reference tokens

---

## File Change Summary

| File | Action | Est. Lines Changed |
|---|---|---|
| `DESIGN.md` | Already replaced (done) | 230 → 393 |
| `index.html` | Edit (3 additions) | +20 lines |
| `calendario/DESIGN.md` | Full rewrite | 275 → ~320 |
| `calendario/src/index.css` | Edit (3 additions) | +25 lines |
| `calendario/src/App.tsx` | Audit only | ~0 lines |
| `calendario/src/components/*.tsx` | Audit only | ~0 lines |

**Total net new lines:** ~170
**Deleted lines:** 0 (all changes are additive or full rewrites)
**Risk level:** Low — no behavioral changes, only token additions and documentation updates

---

## Execution Order

1. `index.html` — Add CSS variables to `:root`
2. `index.html` — Add dark mode CSS variables
3. `index.html` — Add utility classes
4. `calendario/DESIGN.md` — Full rewrite
5. `calendario/src/index.css` — Add `@theme` tokens
6. `calendario/src/index.css` — Add gradient utilities
7. `calendario/src/index.css` — Update `.crystal-glow`
8. Calendario components — Audit for hardcoded colors
9. Calendario — Run `npm run lint` + `npm run build`
