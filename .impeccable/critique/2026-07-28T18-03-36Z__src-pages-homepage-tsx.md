---
target: src/pages/HomePage.tsx
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
p2_count: 2
p3_count: 2
timestamp: 2026-07-28T18-03-36Z
slug: src-pages-homepage-tsx
---
# Hall of the Novice EX — Design Critique

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading shimmer + error banners work; missing optimistic feedback on admin saves |
| 2 | Match System / Real World | 4 | Strong FFXIV Sharlayan immersion, PT-BR voice, domain-appropriate terminology |
| 3 | User Control and Freedom | 3 | Escape key + back nav work; admin modals lack undo for accidental deletes |
| 4 | Consistency and Standards | 2 | Admin uses hardcoded slate-400/slate-500 while public pages use CSS vars; gradient header breaks glass pattern |
| 5 | Error Prevention | 3 | Confirmation dialogs on destructive actions; form validation is minimal |
| 6 | Recognition Rather Than Recall | 3 | Labels on icons, visible filter chips; calendar day cells too small to recognize events |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts, no bulk actions in admin, no drag-reorder for event types |
| 8 | Aesthetic and Minimalist Design | 3 | Clean hierarchy, glass-morphism is well-executed; admin gradient header is visually heavy |
| 9 | Error Recovery | 3 | Clear error messages in PT-BR, non-blocking; event form reopens on error preserving state |
| 10 | Help and Documentation | 2 | No contextual help, tooltips, or guided tours for new admins |
| **Total** | | **28/40** | **Good** |

## Design Specificity Verdict

The design IS authored for this product. The Arcane Dashboard concept with deep slate + orange-gold accents + glass-morphism is distinctive and grounded in the FFXIV Sharlayan academy identity. Color system rules show deliberate restraint. Typography with Space Grotesk for display + Cinzel for ceremonial moments is purposeful. Specificity is diluted by Inter as body font, admin panel visual inconsistency, and missing homepage hero.

Detector found 1 issue: overused-font (Inter) in src/index.css:47.

## What's Working

1. The glass-morphism system is excellent — backdrop-blur + card-glow hover creates genuine depth.
2. Color system with rules (Accent Rarity, Gold Identity) prevents palette spam.
3. Immersive PT-BR copy and voice consistently Sharlayan-academic.

## Priority Issues

### [P1] Homepage has no hero
The homepage opens with a small Quick Actions banner and post grid. No visual anchor for first-time visitors.

### [P2] Admin panel visual inconsistency
Admin gradient header breaks glass-morphism pattern. Hardcoded slate-* colors instead of CSS vars.

### [P2] Calendar day cells are too cramped
min-h-[90px] with 9px text makes event titles unreadable without clicking.

### [P3] Filter button proliferation
10px font size below comfortable tap targets. 5-8 chips per page creates visual noise.

### [P3] Inter font undermines distinctiveness
Most common web font dilutes the magical academy personality.

## Minor Observations

- Calendario missing accent (should be Calendario with accent)
- Cafe da Manha missing accents
- parchment-texture CSS class defined but unused
- Event form allows invalid dates (Feb 30, Feb 31)

## Questions to Consider

- What would the homepage feel like with a cinematic hero?
- Does the admin need to look this different from the public site?
- Is the calendar serving its purpose if buried behind nav?
- What if filters were smarter with progressive disclosure?
