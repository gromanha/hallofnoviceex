---
name: Hall of the Novice EX
description: A campus portal for the FFXIV Free Company "Hall of the Novice EX" — scholarly, warm, immersive.
colors:
  primary: "#1D6A6A"
  primary-deep: "#124949"
  primary-light: "#E8F4F4"
  secondary: "#D4AF37"
  secondary-light: "#F5E6B8"
  secondary-accent: "#E5C158"
  tertiary: "#9B8BB4"
  tertiary-light: "#EDE8F3"
  crystal: "#5ECFCF"
  crystal-light: "#D4F5F5"
  rose: "#C46B7D"
  rose-light: "#F4E3E7"
  sage: "#6B8F71"
  sage-light: "#E3EDE5"
  neutral-bg: "#FAF6ED"
  neutral-surface: "#FFFFFF"
  neutral-surface-alt: "#FFFFFF"
  neutral-text: "#3E4A56"
  neutral-muted: "#6B7A8A"
  neutral-border: "rgba(29, 106, 106, 0.1)"
  dark-bg: "#121921"
  dark-surface: "#18222C"
  dark-surface-alt: "#1E2B37"
  dark-text: "#E2E8F0"
  dark-muted: "#94A3B8"
  dark-border: "rgba(229, 193, 88, 0.1)"
typography:
  display:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 900
    lineHeight: 1.2
  headline:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.5px"
rounded:
  sm: "8px"
  md: "14px"
  lg: "20px"
  pill: "25px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-accent:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    padding: "20px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-muted}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  nav-link-active:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
---

# Design System: Hall of the Novice EX

## 1. Overview

**Creative North Star: "The Majestic Battle Academy"**

The HoN design system is born from the watercolor illustrations of a Sharlayan-inspired seaside academy — a place where teal domes rise above lavender fields, ice-blue crystals pulse with magical light, and students in scholarly robes gather beneath Gothic arches to learn the arts of battle and healing. Every design decision traces back to these illustrations: the warm cream stone of the architecture, the gold ornamental trim framing each doorway, the floating books drifting through a sunlit grand hall.

The aesthetic is rooted in the **FFXIV watercolor concept art style** — soft hand-drawn textures, gentle lighting, natural elements integrated into architecture, and a palette that feels lived-in rather than manufactured. This is not a gaming portal. It is a digital campus.

**Key Characteristics:**
- Warm parchment foundation with institutional teal identity
- Watercolor-inspired gradients and soft transitions — never harsh
- Gothic arches and domed silhouettes informing layout structure
- Gold accents reserved for moments of distinction
- Crystal cyan for magical and interactive highlights
- Lavender and lily-white for scholarly calm and natural beauty
- Serif display type (Cinzel) paired with clean modern sans-serif body (Inter)

This system explicitly rejects aggressive dark-and-neon gaming aesthetics, glassmorphism, gradient text, bounce animations, and corporate SaaS sterility. The design should feel like a real community that genuinely cares about learning — a place where patience is pedagogy and every surface invites you to sit down and study.

## 2. Colors

The palette is extracted directly from the "imagens academia" illustrations. Every hue has a physical anchor in the artwork: the teal of the academy domes, the gold of the ornamental trim, the lavender of the fields surrounding the campus, the ice-blue glow of magical crystals illuminating the grand hall.

### Primary — Sharlayan Teal

The institutional anchor. Appears on domes, staircases, banners, ceiling vaults, and student robes across all illustrations.

- **Sharlayan Teal** `#1D6A6A` — Headers, active navigation, links, primary buttons, section titles. The color that says "this is HoN."
- **Deep Teal** `#124949` — Hover states, dark-mode primary, emphasis. The shadowed side of the dome.
- **Teal Mist** `#E8F4F4` — Card hover backgrounds, stat card tints, light-mode active states. Sunlight filtering through teal glass.

### Secondary — Scholar's Gold

The accent of distinction. Appears on the ornamental trim of every archway, the rope border of the logo medallion, and the golden crest mounted above the grand staircase.

- **Scholar's Gold** `#D4AF37` — CTAs, active-state borders, hero buttons, section dividers, achievement markers. Used sparingly — its rarity is the point.
- **Gold Parchment** `#F5E6B8` — Tag backgrounds, card header gradients, subtle highlights. The warmer sibling for larger surfaces.
- **Gold Highlight** `#E5C158` — Hover states on gold elements, dark-mode secondary accents. Sunlit gold.

### Tertiary — Campus Lavender

The quiet scholarly softness. Appears in the lavender fields surrounding the academy, in the decorative floral accents, and in the gentle color washes of the illustrations.

- **Campus Lavender** `#9B8BB4` — Secondary tags, sidebar footer gradients, decorative accents. Adds depth without competing with teal.
- **Lavender Mist** `#EDE8F3` — Tag backgrounds, gentle surface washes. The palest breath of purple.

### Crystal — Magical Accent

Extracted from the glowing ice-blue crystals that illuminate the grand hall and the magical symbols on floating books. Reserved for moments of enchantment.

- **Crystal Cyan** `#5ECFCF` — Interactive highlights, magical/tooltip accents, crystal glow effects. Used with restraint — it represents active magic.
- **Crystal Mist** `#D4F5F5` — Crystal glow backgrounds, subtle magical tints.

### Supporting — Flora & Rose

From the botanical elements in the illustrations — white lilies, green garden foliage, and the warm rose tones in the sunset sky.

- **Rose Academic** `#C46B7D` — Supporting accent, secondary CTAs where teal would conflict. Warm and inviting.
- **Rose Mist** `#F4E3E7` — Rose-tinted backgrounds.
- **Sage Green** `#6B8F71` — Garden foliage accent, nature-related content. Growth and vitality.
- **Sage Mist** `#E3EDE5` — Sage-tinted backgrounds.

### Neutral

The stone and shadow of the architecture, translated into UI foundation tones.

- **Parchment Ivory** `#FAF6ED` — The canvas background. Warm sunlit stone — not white, not cool gray. Every surface rests on this.
- **Pearl White** `#FFFFFF` — Sidebar and card backgrounds. Clean but not stark against the ivory canvas.
- **Slate Ink** `#3E4A56` — Primary text. Deep blue-gray that reads as authoritative without harshness.
- **Muted Slate** `#6B7A8A` — Secondary text, labels, metadata.
- **Teal Border** `rgba(29, 106, 106, 0.1)` — Barely-visible teal-tinted divider. Adds institutional cohesion.

### Named Rules

**The Gold Scarcity Rule.** Scholar's Gold appears on ≤10% of any given screen. Its rarity is what makes it meaningful. Use it for CTAs, achievement markers, and active-state accents — never for backgrounds, large fills, or decorative fills.

**The Parchment Foundation Rule.** The warm ivory background is non-negotiable. Never replace it with pure white (`#FFF`) or cool gray. The warmth of the canvas is what makes the entire system feel inviting rather than clinical.

**The Crystal Glow Rule.** Crystal Cyan is reserved for magical and interactive highlights — tooltips, interactive accents, subtle glow effects. It represents active magic in the world. Never use it for large surfaces or as a primary color.

## 3. Typography

**Display Font:** Cinzel (with Georgia, serif fallback)
**Body Font:** Inter (with system-ui, sans-serif fallback)

**Character:** Cinzel brings the weight of academic authority — its serif letterforms echo the carved stone inscriptions and embossed book covers visible in the grand hall. Inter provides the modern clarity needed for body text and UI elements. Together, they balance tradition with readability: the old world meeting the new, like a well-organized lecture hall beneath vaulted ceilings.

### Hierarchy

- **Display** (900 weight, `clamp(2rem, 5vw, 3rem)`, 1.2 line-height) — Hero banner headlines. The largest, most authoritative text on any page. Always Cinzel.
- **Headline** (700 weight, 22px, 1.3 line-height) — Section titles within content, widget titles, modal titles. Structured and clear.
- **Title** (700 weight, 16px, 1.35 line-height) — Card titles, post titles, list headers. Concise hierarchy markers.
- **Body** (400 weight, 15px, 1.75 line-height) — All readable content. Generous line-height for comfortable reading. Max width ~65ch in modal reading view.
- **Label** (700 weight, 11px, 0.5px letter-spacing, uppercase) — Tags, stat labels, metadata. Compact and structured.

### Named Rules

**The Serif Authority Rule.** Cinzel is reserved for display, headlines, and titles — moments where the design speaks with authority. It never appears in body text, labels, or UI chrome. Inter handles everything that needs to be read quickly and at small sizes.

## 4. Architecture & Motifs

The structural language of the UI is drawn from the academy's architecture as depicted in the illustrations: Gothic arches, domed spires, ornamental gold trim, and the great winged crest that presides over the grand hall.

### Architectural Vocabulary

- **Gothic Arches** — The primary structural motif. Arched shapes inform card headers, modal frames, and decorative borders. Where rectangles feel corporate, arches feel institutional.
- **Domes & Spires** — The silhouettes that define the academy skyline. Referenced in logo placement, hero section shapes, and section dividers.
- **Gold Ornamental Trim** — Thin gold lines framing important elements: section borders, modal edges, active-state outlines. The "gilded frame" treatment.
- **The Winged Crest** — The golden shield with teal crystal center, mounted above the grand staircase. Used as the primary brand mark and hero emblem. Contains the four role icons (Sword, Shield, Staff, Book).
- **Cream Stone Texture** — The warm, slightly uneven quality of sunlit stone. Referenced in the parchment background and subtle surface textures.

### Applying Architecture to Layout

- Card corners use gentle rounding (14px) — soft but structured, like the curved archways.
- Section dividers use thin gold lines — echoing the ornamental trim between architectural elements.
- The hero banner uses a gradient overlay that mimics warm sunlight falling on stone.
- Sidebar borders use a barely-visible teal tint — institutional without being heavy.

## 5. Flora & Nature Symbolism

The illustrations integrate nature into the academy's identity: lavender fields surround the campus, white lilies frame the entrance, green trees soften the stone architecture. These botanical elements carry symbolic weight and inform the supporting color palette.

### Botanical Elements

- **White Lilies** — Purity, new beginnings, the arrival of new students. Appear in the logo medallion flanking the academy building, and in the foreground of exterior illustrations. Referenced in lily-white accent tones and new-student onboarding UI elements.
- **Lavender Fields** — Scholarly calm, patience, the contemplative life. The purple haze surrounding the campus in every exterior view. Referenced in the lavender color family and secondary decorative accents.
- **Green Foliage** — Growth, community, vitality. The trees and garden elements that soften the stone architecture. Referenced in sage green accents and nature-related content markers.
- **Cherry Blossoms** — The campus cherry tree (purple-lavanda bloom) is a landmark. Referenced in the rose academic accent and celebratory/growth moments.

### Applying Nature to UI

- Botanical elements appear as subtle decorative touches — in card header gradients, sidebar footer backgrounds, and section transitions.
- Never dominate the layout. Nature is the frame, not the subject.
- The teal-gold-lavender gradient wash on card headers echoes the sunset sky over the campus gardens.

## 6. Iconography

The visual language of symbols is drawn from the logo medallion and the magical elements in the interior illustrations.

### Brand Icons

- **The Winged Crest** — The primary brand mark. A golden shield frame with teal crystal center, flanked by stylized wings. Used for the logo, hero section emblem, and official documents.
- **Four Role Icons** — From the bottom of the logo medallion: Sword (DPS/Offensive), Shield (Tank/Defensive), Staff (Healer/Support), Book (Scholar/Knowledge). Used for role-based navigation and content categorization.
- **Crystal Icon** — A faceted teal crystal, representing magical energy and interactive elements. Used for tooltips, magical content markers, and interactive highlights.

### Content Icons

- **Floating Books** — From the grand hall illustration: magical books drifting through the air with glowing symbols. Used as a motif for guides, learning content, and the library section.
- **Academic Seal** — The circular medallion format of the logo. Used for certificates, achievements, and formal documentation.
- **Botanical Frames** — Lilies and lavender used as decorative borders for special content sections.

### Icon Principles

- Icons should feel hand-drawn or engraved, not flat or mechanical.
- Gold and teal are the primary icon colors. Lavender for secondary icons.
- Crystal cyan for interactive/magical icon states only.

## 7. Elevation & Effects

The system uses a hybrid approach: soft ambient shadows for cards and containers, with tonal layering (teal/gold/lavender tints) for visual hierarchy. Effects are inspired by the lighting in the illustrations — warm, diffused, magical.

### Crystal Glow Effect

A soft cyan luminance used for interactive highlights and magical elements. Inspired by the ice-blue crystals in the grand hall.

```css
box-shadow: 0 0 12px rgba(94, 207, 207, 0.15);
```

Used sparingly: tooltip triggers, active magical elements, interactive crystal icons.

### Watercolor Gradients

Soft multi-color washes inspired by the illustration style. Used for card headers and section dividers.

```css
background: linear-gradient(135deg, var(--teal-light) 0%, var(--lavender-light) 100%);
```

Three gradient families:
- **Teal Wash** — `var(--teal-light)` to transparent. General content.
- **Gold Wash** — `var(--gold-light)` to transparent. Premium/achievement content.
- **Sunset Wash** — `var(--teal-light)` through `var(--lavender-light)`. Hero banners and special sections.

### Shadow Vocabulary

- **Card Ambient** (`0 2px 8px rgba(62, 74, 86, 0.04)`) — Default state for cards and containers. Almost imperceptible.
- **Card Hover** (`0 8px 24px rgba(62, 74, 86, 0.08)`) — Appears on hover/focus. A gentle "breathing" lift.
- **Card Elevated** (`0 16px 40px rgba(62, 74, 86, 0.12)`) — Modal overlays, hero banners, focused elements. The highest lift.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, elevation, focus). A card that always casts a shadow feels heavy; one that lifts gently on hover feels alive.

**The Watercolor Rule.** Gradients are always soft, multi-toned, and low-contrast. Never use hard-stop gradients, neon transitions, or high-saturation color shifts. The gradient should feel like watercolor paint bleeding across wet paper.

## 8. Components

### Buttons

- **Shape:** Pill-rounded (25px radius), generous padding for confident click targets.
- **Primary (Teal):** Deep teal background (`#1D6A6A`), white text, gradient to darker teal on hover. Used for secondary CTAs and navigation actions.
- **Accent (Gold):** Scholar's gold background (`#D4AF37`), deep teal text. Reserved for the single most important CTA on any screen. Elevated shadow on hover.
- **Ghost (Icon):** Transparent background with subtle border. Used for header icons (theme toggle, notifications). Lifts on hover with border color shift.
- **Hover/Focus:** All buttons transition with the system easing curve (0.3s cubic-bezier(0.4, 0, 0.2, 1)). Hover adds 1-2px upward translation and deepened shadow.

### Cards

- **Corner Style:** Gently rounded (14px radius) — soft but structured, like the arched architecture.
- **Background:** Pearl white (`#FFFFFF`) on the parchment canvas.
- **Shadow Strategy:** Flat at rest (ambient shadow), lifted on hover (elevated shadow). The card "breathes" with interaction.
- **Border:** 1px solid teal-tinted border. On hover, the border shifts to gold — a subtle "gilded frame" signal of attention.
- **Internal Padding:** 20px standard. Post cards have watercolor gradient headers (teal/gold/lavender washes) with emoji icons, creating visual variety within a consistent structure.

### Navigation (Sidebar)

- **Style:** Fixed left sidebar, 280px width, white background with right border.
- **Typography:** 14px Inter, 500 weight. Active state uses 600 weight.
- **Default:** Muted text, transparent background.
- **Hover:** Teal-tinted background, teal text color. Icon scales up slightly (1.15x).
- **Active:** Same as hover but with added gold-tinted border and subtle shadow. The gold border is the "you are here" marker.
- **Mobile:** Collapses to off-canvas (`translateX(-100%)`), toggled by hamburger.

### Chips / Tags

- **Style:** Small pill badges (15px radius, 11px uppercase text).
- **Category variants:** Teal background for general, gold background for premium/special, lavender for secondary, crystal for magical/interactive.
- **State:** Always displayed; no toggle behavior. Purely informational.

### Stats Cards

- **Style:** Compact stat blocks in a 2x2 grid. Rounded corners (8px).
- **Background:** Color-tinted variants (teal, gold, lavender) to add visual rhythm — echoing the watercolor washes in the illustrations.
- **Content:** Large Cinzel numeral + small uppercase label. The number is the hero.

### Modal (Reading Overlay)

- **Shape:** 800px max-width, 85vh height, 20px radius.
- **Background:** Parchment ivory in light mode, deep charcoal in dark mode. Always warm.
- **Border:** 3px double gold border — the "open book" treatment. Formal and distinctive, like the gilded edges of an academy tome.
- **Header:** Watercolor gradient wash (teal or gold tint) with tag + title. Close button rotates 90deg on hover.
- **Body:** Generous 40px padding, 1.75 line-height. Tables, code blocks, and callout boxes are styled for comfortable long-form reading.

## 9. Dark Mode — "Eorzean Nightfall"

Dark mode transforms the campus from sunlit afternoon to magical twilight. Deeper tones replace the warm surfaces, but the institutional identity remains clear.

### Transformation

| Light Mode | Dark Mode | Rationale |
|---|---|---|
| Parchment Ivory `#FAF6ED` | Deep Night `#121921` | The campus at twilight |
| Pearl White `#FFFFFF` | Nebula Blue `#18222C` | Shadowed stone |
| Sharlayan Teal `#1D6A6A` | Crystal Teal `#4ECDC4` | Teal brightens — crystals glow stronger at night |
| Scholar's Gold `#D4AF37` | Bright Gold `#E8C547` | Gold warms in torchlight |
| Campus Lavender `#9B8BB4` | Soft Lavender `#B8A9D4` | Lavender lightens against dark surfaces |
| Crystal Cyan `#5ECFCF` | Vivid Crystal `#7EEEE5` | Crystals become more prominent in darkness |

### Dark Mode Principles

- Teal and gold brighten to maintain contrast and their institutional roles.
- Crystal glow becomes more visible — magic is more apparent at night.
- Shadows deepen but remain diffused — never harsh.
- The warm parchment feel is replaced by a cool, contemplative atmosphere — "studying by crystal light."

## 10. Do's and Don'ts

### Do

- **Do** use the warm parchment background (`#FAF6ED`) as the canvas for every surface. It is the foundation of the system's inviting character.
- **Do** reserve Scholar's Gold (`#D4AF37`) for moments of distinction — CTAs, achievement markers, active-state accents. Its scarcity is what makes it meaningful.
- **Do** use Cinzel for display and headlines to carry the academic authority of the brand. Let Inter handle everything else.
- **Do** keep shadows diffused and ambient. The system breathes through gentle lifts, not dramatic drops.
- **Do** use the gold border shift on card hover as a subtle "gilded frame" attention signal — it is a signature pattern.
- **Do** support dark mode as "Eorzean Nightfall" — deeper tones, not inverted extremes. The gold accent brightens in dark mode to maintain its role.
- **Do** use generous whitespace and calm hierarchy. "Patience is pedagogy" applies to the layout itself.
- **Do** use watercolor-inspired gradients (teal-to-lavender washes) for card headers and section transitions.
- **Do** reference the architectural motifs — Gothic arches in card shapes, ornamental gold in borders, the crest as a brand mark.
- **Do** use crystal glow effects for interactive and magical highlights with restraint.

### Don't

- **Don't** use generic gaming portal aesthetics — neon colors, aggressive dark backgrounds, e-sports visual language, toxic-elitist UI patterns. *"This is not a speedrun leaderboard or a PvP ranking board."*
- **Don't** use glassmorphism, gradient text, bounce animations, or anything that reads as "AI-generated gaming site."
- **Don't** replace the warm parchment background with pure white (`#FFF`) or cool gray. The warmth of the canvas is non-negotiable.
- **Don't** use Cinzel in body text, labels, or UI chrome. It is reserved for moments of authority only.
- **Don't** overuse gold. If every button is gold, none of them are special. The Gold Scarcity Rule is absolute.
- **Don't** use tight, harsh shadows. If a shadow looks like it belongs on a material design button from 2014, it is too dark and too small.
- **Don't** add decorative elements that don't serve learning or navigation. Every pixel should either teach or guide.
- **Don't** use hard-stop gradients, neon transitions, or high-saturation color shifts. Gradients should feel like watercolor bleeding across wet paper.
- **Don't** use Crystal Cyan for large surfaces or as a primary color. It is reserved for magical and interactive highlights only.
- **Don't** create iconography outside the established visual language. Use the crest, role icons, crystal, and floating book motifs already defined.
