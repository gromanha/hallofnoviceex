---
name: Calendario Hall of the Novice EX
description: Interactive academic event calendar for the FFXIV guild — scholarly, warm, immersive.
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
  neutral-surface-alt: "#F6F3EA"
  neutral-text: "#3E4A56"
  neutral-muted: "#6B7A8A"
  neutral-border: "rgba(29, 106, 106, 0.1)"
  error: "#BA1A1A"
  error-container: "#FFDAD6"
  focus-ring: "#735C00"
typography:
  display:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "clamp(1.5rem, 4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    letterSpacing: "0.08em"
    textTransform: "uppercase"
  mono:
    fontFamily: "Space Grotesk, monospace"
    fontSize: "12px"
    fontWeight: 500
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-accent:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-muted}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-elevated:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input:
    backgroundColor: "{colors.neutral-surface-alt}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-muted}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  nav-link-active:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  chip:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  modal:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: Calendario Hall of the Novice EX

## 1. Overview

**Creative North Star: "The Schedule Board"**

The calendario design system evokes an ancient academy's schedule board — a living document pinned to a parchment wall, where events are cataloged with the quiet authority of a well-organized institution. Every surface rests on warm ivory parchment; teal carries the institutional identity of the Sharlayan academy; gold marks moments of distinction and active states; lavender adds scholarly softness that prevents the palette from feeling rigid.

This system explicitly rejects the sterile utilitarianism of generic calendar apps (Google Calendar, Outlook) and the neon-timed urgency of gaming event trackers. It is not a corporate scheduling tool — it is a guild artifact, a living record of the academy's activities that feels at home in a fantasy university.

**Key Characteristics:**
- Warm parchment foundation with institutional teal identity
- Serif display type (Cinzel) paired with modern sans-serif body (Hanken Grotesk)
- Soft ambient shadows and gentle transitions — never jarring
- Generous whitespace and calm hierarchy
- Gold reserved for active states and moments of distinction
- Color-coded event types that create visual rhythm without clutter

## 2. Colors

The palette is rooted in the Sharlayan aesthetic: teal as institutional identity, gold as scholarly distinction, lavender as quiet warmth, all resting on an ivory parchment canvas. Colors are used deliberately — teal for structure and navigation, gold for emphasis and achievement, lavender for soft accents.

### Primary
- **Sharlayan Teal** (#1D6A6A): The institutional anchor. Used for headers, active navigation, primary buttons, and section titles. This is the color that says "this is HoN."
- **Deep Teal** (#124949): The deepened variant for hover states, dark backgrounds, and emphasis moments. Provides weight without introducing a new hue.
- **Teal Mist** (#E8F4F4): A barely-there teal wash for card hover backgrounds, stat card tints, and light-mode active states. Adds institutional warmth without shouting.

### Secondary
- **Scholar's Gold** (#D4AF37): The accent of distinction. Reserved for CTAs, active-state borders, selected calendar days, and moments of achievement. Used sparingly — its rarity is the point.
- **Gold Parchment** (#F5E6B8): A warm, muted gold for tag backgrounds and subtle highlights. Softer sibling for larger surfaces.
- **Gold Highlight** (#E5C158): A brighter gold for hover states on gold elements and interactive accents.

### Tertiary
- **Campus Lavender** (#9B8BB4): A soft, scholarly purple for secondary tags, decorative accents, and visual variety. Adds depth without competing with teal.
- **Lavender Mist** (#EDE8F3): The palest lavender tint for tag backgrounds and gentle surface washes.

### Neutral
- **Parchment Ivory** (#FAF6ED): The canvas background. Not white — warm, aged, inviting. Every surface rests on this.
- **Pearl White** (#FFFFFF): Card and modal backgrounds. Clean but not stark against the ivory canvas.
- **Linen** (#F6F3EA): Sidebar background and alternating surface tint. Slightly warmer than pure white.
- **Slate Ink** (#3E4A56): Primary text color. A deep blue-gray that reads as authoritative without the harshness of pure black.
- **Muted Slate** (#6B7A8A): Secondary text, labels, metadata. Provides hierarchy without visual noise.
- **Teal Border** (rgba(29, 106, 106, 0.1)): A barely-visible teal-tinted divider. Adds institutional cohesion to borders and separators.
- **Error** (#BA1A1A): Destructive actions and error states. Used sparingly.
- **Error Container** (#FFDAD6): Light error background for alerts and validation messages.
- **Focus Ring** (#735C00): A warm gold-brown for keyboard focus indicators. Visible against all backgrounds.

### Named Rules
**The Gold Scarcity Rule.** Scholar's Gold appears on ≤10% of any given screen. Its rarity is what makes it meaningful. Use it for CTAs, achievement markers, and active-state accents — never for backgrounds or large fills.

**The Parchment Foundation Rule.** The warm ivory background (#FAF6ED) is non-negotiable. Never replace it with pure white (#FFF) or cool gray. The warmth of the canvas is what makes the entire system feel inviting rather than clinical.

## 3. Typography

**Display Font:** Cinzel (with Georgia, serif fallback)
**Body Font:** Hanken Grotesk (with system-ui, sans-serif fallback)
**Label/Mono Font:** Space Grotesk (with system-ui, sans-serif fallback)

**Character:** Cinzel brings the weight of academic authority — its serif letterforms echo carved stone and embossed book covers. Hanken Grotesk provides the modern clarity needed for body text and UI elements. Space Grotesk handles labels, metadata, and mono-spaced content. Together, they balance tradition with readability: the old world meeting the new, like a well-organized lecture hall.

### Hierarchy
- **Display** (700 weight, clamp(1.5rem, 4vw, 2.5rem), 1.2 line-height): Calendar title, section headers. The largest text on the page, always Cinzel.
- **Headline** (600 weight, 18px, 1.3 line-height): Sidebar section titles, modal titles, event detail headings. Structured and clear.
- **Title** (600 weight, 15px, 1.35 line-height): Event titles in the ledger, card headers, list items. Concise hierarchy markers.
- **Body** (400 weight, 14px, 1.6 line-height): Event descriptions, event details, readable content. Generous line-height for comfortable reading.
- **Label** (600 weight, 10px, 0.08em letter-spacing, uppercase): Filter labels, metadata, category tags. Compact and structured.
- **Mono** (500 weight, 12px): Day numbers, timestamps, technical identifiers.

### Named Rules
**The Serif Authority Rule.** Cinzel is reserved for display, headlines, and titles — moments where the design speaks with authority. It never appears in body text, labels, or UI chrome. Hanken Grotesk handles everything that needs to be read quickly and at small sizes.

## 4. Elevation

The system uses a hybrid approach: soft ambient shadows for cards and containers, with tonal layering (teal/gold/lavender tints) for visual hierarchy. Shadows are always diffused and generous — never tight, never harsh. The goal is depth that feels like objects resting on parchment, not floating above it.

### Shadow Vocabulary
- **Card Ambient** (`box-shadow: 0 1px 3px rgba(62, 74, 86, 0.06)`): Default state for cards and containers. Almost imperceptible — just enough to suggest the surface is slightly lifted.
- **Card Hover** (`box-shadow: 0 4px 12px rgba(62, 74, 86, 0.1)`): Appears on hover/focus. A gentle "breathing" lift that rewards interaction.
- **Modal Elevated** (`box-shadow: 0 16px 48px rgba(62, 74, 86, 0.15)`): Modal overlays and focused elements. The highest lift in the system.
- **Crystal Glow** (`box-shadow: 0 0 12px rgba(171, 200, 245, 0.4)`): Decorative glow for crystal icons and special indicators. Not structural depth.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, elevation, focus). A card that always casts a shadow feels heavy; one that lifts gently on hover feels alive.

## 5. Components

### Buttons
- **Shape:** Gently rounded (12px radius), generous padding for confident click targets.
- **Primary (Teal):** Deep teal background (#1D6A6A), white text. Used for primary actions (save, submit, navigate). Deepens on hover (#124949).
- **Accent (Gold):** Scholar's gold background (#D4AF37), deep teal text. Reserved for the single most important CTA on any screen. Used sparingly.
- **Ghost:** Transparent background, muted text. Used for secondary actions (cancel, close). Subtle hover state with background tint.
- **Hover/Focus:** All buttons transition with the system easing curve (0.2s cubic-bezier(0.4, 0, 0.2, 1)). Focus ring uses the warm gold-brown (#735C00).

### Calendar Cells
- **Shape:** Gently rounded (12px radius), responsive height.
- **Background:** Warm parchment (#FAF6ED) with subtle texture. Selected state uses gold fill (#D4AF37).
- **Shadow Strategy:** Flat at rest, lifted on hover (2px upward translate + ambient shadow).
- **Border:** 1px solid teal-tinted border. On hover, border shifts to gold — a subtle signal of attention.
- **Selected State:** Gold background, deep teal text, subtle pulse animation for the current day.

### Cards / Event Ledger
- **Shape:** Rounded corners (16px radius), generous padding.
- **Background:** Pearl white (#FFFFFF) on the parchment canvas.
- **Shadow Strategy:** Flat at rest (ambient shadow), lifted on hover (elevated shadow).
- **Border:** 1px solid teal-tinted border. On hover, border shifts to gold.
- **Internal Padding:** 16px standard. Event cards have timeline connectors and icon markers.

### Sidebar Navigation
- **Style:** Fixed left sidebar, warm linen background (#F6F3EA), right border.
- **Typography:** 14px Hanken Grotesk, 400 weight. Active state uses gold background with deep teal text.
- **Default:** Muted text, transparent background.
- **Hover:** Teal-tinted background, teal text color.
- **Active:** Gold background (#D4AF37), deep teal text. The gold fill is the "you are here" marker.
- **Mobile:** Collapses to off-canvas (translateX(-100%)), toggled by hamburger button.

### Chips / Tags
- **Style:** Small pill badges (9999px radius, 10px uppercase text).
- **Category variants:** Teal background for general, gold for premium/special, lavender for secondary.
- **State:** Always displayed; no toggle behavior. Purely informational.

### Modal (Event Form)
- **Shape:** 480px max-width, 20px radius.
- **Background:** Warm parchment (#FAF6ED).
- **Border:** 2px gold border (#D4AF37) — the "open ledger" treatment. Formal and distinctive.
- **Header:** Gold accent bar at top, title in gold. Close button on right.
- **Body:** Generous 24px padding. Form fields use linen background with teal-tinted borders.

### Inputs / Fields
- **Style:** Linen background (#F6F3EA), teal-tinted border, 12px radius.
- **Focus:** Gold ring (#735C00) with subtle glow. Border shifts to teal.
- **Labels:** 10px uppercase Space Grotesk, gold color (#D4AF37). Compact and structured.

## 6. Do's and Don'ts

### Do:
- **Do** use the warm parchment background (#FAF6ED) as the canvas for every surface. It is the foundation of the system's inviting character.
- **Do** reserve Scholar's Gold (#D4AF37) for moments of distinction — CTAs, active states, selected days. Its scarcity is what makes it meaningful.
- **Do** use Cinzel for display and headlines to carry the academic authority of the brand. Let Hanken Grotesk handle everything else.
- **Do** keep shadows diffused and ambient. The system breathes through gentle lifts, not dramatic drops.
- **Do** use the gold border shift on card hover as a subtle "attention" signal — it's a signature pattern.
- **Do** use generous whitespace and calm hierarchy. "Patience is pedagogy" applies to the layout itself.
- **Do** color-code event types with teal, gold, and lavender to create visual rhythm without clutter.

### Don't:
- **Don't** use generic calendar app aesthetics — sterile white backgrounds, flat utilitarian design, no personality. Quoting PRODUCT.md: *"Generic calendar apps (Google Calendar, Outlook) — sterile, utilitarian, no soul."*
- **Don't** use gaming event tracker aesthetics — neon timers, countdown urgency, aggressive dark themes. Quoting PRODUCT.md: *"Gaming event trackers with neon timers and countdown urgency."*
- **Don't** replace the warm parchment background with pure white (#FFF) or cool gray. The warmth of the canvas is non-negotiable.
- **Don't** use Cinzel in body text, labels, or UI chrome. It is reserved for moments of authority only.
- **Don't** overuse gold. If every element is gold, none of them are special. The Gold Scarcity Rule is absolute.
- **Don't** use tight, harsh shadows. If a shadow looks like it belongs on a material design button from 2014, it's too dark and too small.
- **Don't** add decorative elements that don't serve scheduling or navigation. Every pixel should either inform or guide.
- **Don't** use navy blue (#002446) as the primary color. The institutional identity is Sharlayan Teal (#1D6A6A), aligned with the main HoN brand.
