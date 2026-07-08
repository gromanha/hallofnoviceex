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

**Creative North Star: "The Campus Hearth"**

The HoN design system evokes a warm, lived-in academic space — part university library, part cozy common room. Every surface should feel like a place you want to sit down and study in. The ivory parchment background (`#FAF6ED`) is the foundation: not sterile white, not dark gaming den, but the warm glow of aged paper under lamplight. Teal carries the institutional identity (the Sharlayan academy), gold marks moments of importance and distinction, and lavender adds a quiet scholarly softness that prevents the palette from feeling too rigid.

This system explicitly rejects the aggressive dark-and-neon visual language of generic gaming portals. No glassmorphism, no gradient text, no bounce animations, no confrontational UI. It also rejects corporate SaaS sterility — this is a place with soul, not a dashboard. The design should feel like it belongs to a real community that genuinely cares about learning.

**Key Characteristics:**
- Warm parchment foundation with institutional teal identity
- Serif display type (Cinzel) paired with clean modern sans-serif body (Inter)
- Soft shadows and gentle transitions — never jarring
- Generous whitespace and calm hierarchy
- Dark mode as "Eorzean Nightfall" — deeper tones, not inverted extremes
- Gold accents reserved for moments of distinction

## 2. Colors

The palette is rooted in the Sharlayan aesthetic: teal as institutional identity, gold as scholarly distinction, lavender as quiet warmth, all resting on an ivory parchment canvas. Colors are used deliberately — teal for structure and navigation, gold for emphasis and achievement, lavender for soft accents and secondary elements.

### Primary
- **Sharlayan Teal** (#1D6A6A): The institutional anchor. Used for headers, active navigation, links, primary buttons, and section titles. This is the color that says "this is HoN."
- **Deep Teal** (#124949): The deepened variant for hover states, dark-mode primary, and emphasis moments. Provides weight without introducing a new hue.
- **Teal Mist** (#E8F4F4): A barely-there teal wash used for card hover backgrounds, stat card tints, and light-mode active states. Adds institutional warmth without shouting.

### Secondary
- **Scholar's Gold** (#D4AF37): The accent of distinction. Reserved for CTAs, active-state borders, hero buttons, section dividers, and moments of achievement. Used sparingly — its rarity is the point.
- **Gold Parchment** (#F5E6B8): A warm, muted gold for tag backgrounds, card header gradients, and subtle highlights. softer sibling for larger surfaces.
- **Gold Highlight** (#E5C158): A brighter gold for hover states on gold elements and dark-mode secondary accents.

### Tertiary
- **Campus Lavender** (#9B8BB4): A soft, scholarly purple for secondary tags, sidebar footer gradients, and subtle decorative accents. Adds depth without competing with teal.
- **Lavender Mist** (#EDE8F3): The palest lavender tint for tag backgrounds and gentle surface washes.

### Neutral
- **Parchment Ivory** (#FAF6ED): The canvas background. Not white — warm, aged, inviting. Every surface rests on this.
- **Pearl White** (#FFFFFF): Sidebar and card backgrounds. Clean but not stark against the ivory canvas.
- **Slate Ink** (#3E4A56): Primary text color. A deep blue-gray that reads as authoritative without the harshness of pure black.
- **Muted Slate** (#6B7A8A): Secondary text, labels, metadata. Provides hierarchy without visual noise.
- **Teal Border** (rgba(29, 106, 106, 0.1)): A barely-visible teal-tinted divider. Adds institutional cohesion to borders and separators.

### Named Rules
**The Gold Scarcity Rule.** Scholar's Gold appears on ≤10% of any given screen. Its rarity is what makes it meaningful. Use it for CTAs, achievement markers, and active-state accents — never for backgrounds, large fills, or decorative fills.

**The Parchment Foundation Rule.** The warm ivory background is non-negotiable. Never replace it with pure white (#FFF) or cool gray. The warmth of the canvas is what makes the entire system feel inviting rather than clinical.

## 3. Typography

**Display Font:** Cinzel (with Georgia, serif fallback)
**Body Font:** Inter (with system-ui, sans-serif fallback)

**Character:** Cinzel brings the weight of academic authority — its serif letterforms echo carved stone and embossed book covers. Inter provides the modern clarity needed for body text and UI elements. Together, they balance tradition with readability: the old world meeting the new, like a well-organized lecture hall.

### Hierarchy
- **Display** (900 weight, clamp(2rem, 5vw, 3rem), 1.2 line-height): Hero banner headlines. The largest, most authoritative text on any page. Always Cinzel.
- **Headline** (700 weight, 22px, 1.3 line-height): Section titles within content, widget titles, modal titles. Structured and clear.
- **Title** (700 weight, 16px, 1.35 line-height): Card titles, post titles, list headers. Concise hierarchy markers.
- **Body** (400 weight, 15px, 1.75 line-height): All readable content. Generous line-height for comfortable reading. Max width ~65ch in modal reading view.
- **Label** (700 weight, 11px, 0.5px letter-spacing, uppercase): Tags, stat labels, metadata. Compact and structured.

### Named Rules
**The Serif Authority Rule.** Cinzel is reserved for display, headlines, and titles — moments where the design speaks with authority. It never appears in body text, labels, or UI chrome. Inter handles everything that needs to be read quickly and at small sizes.

## 4. Elevation

The system uses a hybrid approach: soft ambient shadows for cards and containers, with tonal layering (teal/gold/lavender tints) for visual hierarchy. Shadows are always diffused and generous — never tight, never harsh. The goal is depth that feels like objects resting on parchment, not floating above it.

### Shadow Vocabulary
- **Card Ambient** (`box-shadow: 0 2px 8px rgba(62, 74, 86, 0.04)`): Default state for cards, widgets, and containers. Almost imperceptible — just enough to suggest the surface is slightly lifted.
- **Card Hover** (`box-shadow: 0 8px 24px rgba(62, 74, 86, 0.08)`): Appears on hover/focus. A gentle "breathing" lift that rewards interaction.
- **Card Elevated** (`box-shadow: 0 16px 40px rgba(62, 74, 86, 0.12)`): Modal overlays, hero banners, and dragged/focused elements. The highest lift in the system.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, elevation, focus). A card that always casts a shadow feels heavy; one that lifts gently on hover feels alive.

## 5. Components

### Buttons
- **Shape:** Pill-rounded (25px radius), generous padding for confident click targets.
- **Primary (Teal):** Deep teal background (#1D6A6A), white text, gradient to darker teal on hover. Used for secondary CTAs and navigation actions (Discord, event joins).
- **Accent (Gold):** Scholar's gold background (#D4AF37), deep teal text. Reserved for the single most important CTA on any screen ("Ver Tratado Zodiac Weapon"). Elevated shadow on hover.
- **Ghost (Icon):** Transparent background with subtle border. Used for header icons (theme toggle, notifications). Lifts on hover with border color shift.
- **Hover/Focus:** All buttons transition with the system easing curve (0.3s cubic-bezier(0.4, 0, 0.2, 1)). Hover adds 1-2px upward translation and deepened shadow.

### Cards
- **Corner Style:** Gently rounded (14px radius) — soft but structured.
- **Background:** Pearl white (#FFFFFF) on the parchment canvas.
- **Shadow Strategy:** Flat at rest (ambient shadow), lifted on hover (elevated shadow). The card "breathes" with interaction.
- **Border:** 1px solid teal-tinted border (rgba(29, 106, 106, 0.1)). On hover, the border shifts to gold — a subtle signal of attention.
- **Internal Padding:** 20px standard. Post cards have gradient headers (teal/gold/lavender tints) with emoji icons, creating visual variety within a consistent structure.

### Navigation (Sidebar)
- **Style:** Fixed left sidebar, 280px width, white background with right border.
- **Typography:** 14px Inter, 500 weight. Active state uses 600 weight.
- **Default:** Muted text, transparent background.
- **Hover:** Teal-tinted background (#E8F4F4), teal text color. Icon scales up slightly (1.15x).
- **Active:** Same as hover but with added gold-tinted border (rgba(212, 175, 55, 0.25)) and subtle shadow. The gold border is the "you are here" marker.
- **Mobile:** Collapses to off-canvas (translateX(-100%)), toggled by hamburger.

### Chips / Tags
- **Style:** Small pill badges (15px radius, 11px uppercase text).
- **Category variants:** Teal background for general, gold background for premium/special, lavender for secondary categories.
- **State:** Always displayed; no toggle behavior. Purely informational.

### Stats Cards
- **Style:** Compact stat blocks in a 2x2 grid. Rounded corners (8px).
- **Background:** Color-tinted variants (teal, gold, lavender) to add visual rhythm.
- **Content:** Large Cinzel numeral + small uppercase label. The number is the hero.

### Modal (Reading Overlay)
- **Shape:** 800px max-width, 85vh height, 20px radius.
- **Background:** Parchment ivory (#FAF6ED) in light mode, deep charcoal (#1A222A) in dark mode. Always warm.
- **Border:** 3px double gold border — the "open book" treatment. Formal and distinctive.
- **Header:** Gradient wash (teal or gold tint) with tag + title. Close button rotates 90deg on hover.
- **Body:** Generous 40px padding, 1.75 line-height. Tables, code blocks, and callout boxes are styled for comfortable long-form reading.

## 6. Do's and Don'ts

### Do:
- **Do** use the warm parchment background (#FAF6ED) as the canvas for every surface. It is the foundation of the system's inviting character.
- **Do** reserve Scholar's Gold (#D4AF37) for moments of distinction — CTAs, achievement markers, active-state accents. Its scarcity is what makes it meaningful.
- **Do** use Cinzel for display and headlines to carry the academic authority of the brand. Let Inter handle everything else.
- **Do** keep shadows diffused and ambient. The system breathes through gentle lifts, not dramatic drops.
- **Do** use the gold border shift on card hover as a subtle "attention" signal — it's a signature pattern.
- **Do** support dark mode as "Eorzean Nightfall" — deeper charcoal tones, not inverted extremes. The gold accent brightens in dark mode to maintain its role.
- **Do** use generous whitespace and calm hierarchy. "Patience is pedagogy" applies to the layout itself.

### Don't:
- **Don't** use generic gaming portal aesthetics — neon colors, aggressive dark backgrounds, e-sports visual language, toxic-elitist UI patterns. Quoting PRODUCT.md: *"This is not a speedrun leaderboard or a PvP ranking board."*
- **Don't** use glassmorphism, gradient text, bounce animations, or anything that reads as "AI-generated gaming site."
- **Don't** replace the warm parchment background with pure white (#FFF) or cool gray. The warmth of the canvas is non-negotiable.
- **Don't** use Cinzel in body text, labels, or UI chrome. It is reserved for moments of authority only.
- **Don't** overuse gold. If every button is gold, none of them are special. The Gold Scarcity Rule is absolute.
- **Don't** use tight, harsh shadows. If a shadow looks like it belongs on a material design button from 2014, it's too dark and too small.
- **Don't** add decorative elements that don't serve learning or navigation. Every pixel should either teach or guide.
