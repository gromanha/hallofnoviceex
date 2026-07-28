---
name: Hall of the Novice EX
description: A campus portal for the FFXIV Free Company "Hall of the Novice EX" — scholarly, warm, immersive.
colors:
  primary: "#1B4F7E"
  primary-deep: "#143D64"
  primary-light: "#E1EDF7"
  secondary: "#C9A84C"
  secondary-light: "#F0E5C4"
  secondary-accent: "#D4B85C"
  tertiary: "#7B6FA0"
  tertiary-light: "#E8E4F0"
  crystal: "#5DADE2"
  crystal-light: "#D6EAF8"
  rose: "#C0616E"
  rose-light: "#F2D7DA"
  sage: "#5D9B5A"
  sage-light: "#D5EDDA"
  indigo: "#2C3E7E"
  indigo-light: "#D5D9EF"
  amber: "#D4760E"
  amber-light: "#FDEBD0"
  copper: "#7D6648"
  copper-light: "#EDE0D0"
  crimson: "#922B21"
  crimson-light: "#F5B7B1"
  neutral-bg: "#F5F0E6"
  neutral-surface: "#FFFFFF"
  neutral-surface-alt: "#F0ECE0"
  neutral-text: "#2C3E50"
  neutral-muted: "#5A6B7D"
  neutral-border: "rgba(27, 79, 126, 0.1)"
  dark-bg: "#0D1B2A"
  dark-surface: "#152238"
  dark-surface-alt: "#1A2A40"
  dark-text: "#D6E4F0"
  dark-muted: "#8BA4C0"
  dark-border: "rgba(212, 168, 76, 0.1)"
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

The HoN design system is born from the FFXIV Lodestone and in-game UI — a place where deep blues rise alongside lavender fields, ice-blue crystals pulse with magical light, and students in scholarly robes gather beneath Gothic arches to learn the arts of battle and healing. Every design decision traces back to the game's visual language: the warm stone of Eorzean architecture, the gold ornamental trim framing each doorway, the floating books drifting through a sunlit grand hall.

The aesthetic is rooted in the **FFXIV Lodestone and in-game UI style** — clean institutional design, warm parchment textures, gentle lighting, natural elements integrated into architecture, and a palette that feels lived-in rather than manufactured. This is not a gaming portal. It is a digital campus.

**Key Characteristics:**
- Warm parchment foundation with institutional blue identity
- Watercolor-inspired gradients and soft transitions — never harsh
- Gothic arches and domed silhouettes informing layout structure
- Gold accents reserved for moments of distinction
- Crystal cyan for magical and interactive highlights
- Lavender and lily-white for scholarly calm and natural beauty
- Serif display type (Cinzel) paired with clean modern sans-serif body (Inter)

This system explicitly rejects aggressive dark-and-neon gaming aesthetics, glassmorphism, gradient text, bounce animations, and corporate SaaS sterility. The design should feel like a real community that genuinely cares about learning — a place where patience is pedagogy and every surface invites you to sit down and study.

## 2. Colors

The palette is drawn from the FFXIV Lodestone interface and the game's in-game color language — deep Hydaelyn blues, Lodestone gold, crystal cyan, and the warm parchment tones of Eorzean scrolls. Every hue has a physical anchor in the game's visual identity.

The palette is extracted from the FFXIV Lodestone UI themes and in-game color language — deep Hydaelyn blues, Lodestone gold, crystal cyan, and the warm parchment tones of Eorzean scrolls. Every hue has a physical anchor in the game's visual identity.

### Primary — Lodestone Blue

The institutional anchor. Deep blue reminiscent of the Lodestone interface and Hydaelyn's celestial light.

- **Lodestone Blue** `#1B4F7E` — Headers, active navigation, links, primary buttons, section titles. The color that says "this is HoN."
- **Deep Blue** `#143D64` — Hover states, dark-mode primary, emphasis. The shadowed depths of the ocean.
- **Blue Mist** `#E1EDF7` — Card hover backgrounds, stat card tints, light-mode active states. Sunlight filtering through crystal water.

### Secondary — Lodestone Gold

The accent of distinction. Warm gold extracted from the Lodestone's ornamental UI trim and treasure markers.

- **Lodestone Gold** `#C9A84C` — CTAs, active-state borders, hero buttons, section dividers, achievement markers. Used sparingly — its rarity is the point.
- **Gold Parchment** `#F0E5C4` — Tag backgrounds, card header gradients, subtle highlights. The warmer sibling for larger surfaces.
- **Gold Highlight** `#D4B85C` — Hover states on gold elements, dark-mode secondary accents. Sunlit gold.

### Tertiary — Campus Lavender

The quiet scholarly softness. Appears in the lavender fields surrounding the academy, in the decorative floral accents, and in the gentle color washes of the illustrations.

- **Campus Lavender** `#7B6FA0` — Secondary tags, sidebar footer gradients, decorative accents. Adds depth without competing with blue.
- **Lavender Mist** `#E8E4F0` — Tag backgrounds, gentle surface washes. The palest breath of purple.

### Crystal — Magical Accent

Extracted from the glowing crystals that illuminate Eorzean dungeons and the magical aether currents. Reserved for moments of enchantment.

- **Crystal Blue** `#5DADE2` — Interactive highlights, magical/tooltip accents, crystal glow effects. Used with restraint — it represents active magic.
- **Crystal Mist** `#D6EAF8` — Crystal glow backgrounds, subtle magical tints.

### Supporting — Flora & Rose

From the botanical elements in the game world — the Black Shroud foliage, the rose gardens of Ishgard, and the warm tones of Eorzean sunsets.

- **Rose Academic** `#C0616E` — Supporting accent, secondary CTAs where blue would conflict. Warm and inviting.
- **Rose Mist** `#F2D7DA` — Rose-tinted backgrounds.
- **Sage Green** `#5D9B5A` — Garden foliage accent, nature-related content. Growth and vitality.
- **Sage Mist** `#D5EDDA` — Sage-tinted backgrounds.

### Extended — Battle, Magic, Craft & Earth

From the wider world of Eorzea — the intensity of high-difficulty encounters, the depth of arcane knowledge, the warmth of the forge, and the groundedness of the land. These families encode content meaning, not decoration.

- **Indigo Deep** `#2C3E7E` — Premium content, night-themed sections, arcane knowledge markers. The color of starlit study and deep magic.
- **Indigo Mist** `#D5D9EF` — Indigo-tinted backgrounds for premium or special content.
- **Amber Ember** `#D4760E` — Fire, crafting, warnings, seasonal events. Evokes hearth warmth and forge energy.
- **Amber Mist** `#FDEBD0` — Amber-tinted backgrounds for crafting and seasonal content.
- **Copper Forged** `#7D6648` — Gathering, housing, earthy content. Distinct from the scholarly gold — warmer, more grounded.
- **Copper Mist** `#EDE0D0` — Copper-tinted backgrounds for gathering and housing content.
- **Crimson Blade** `#922B21` — Combat warnings, boss mechanics, high-difficulty content. The color of intensity and danger.
- **Crimson Mist** `#F5B7B1` — Crimson-tinted backgrounds for combat and warning content.

### Neutral

The stone and shadow of the architecture, translated into UI foundation tones.

- **Parchment Ivory** `#F5F0E6` — The canvas background. Warm sunlit stone — not white, not cool gray. Every surface rests on this.
- **Pearl White** `#FFFFFF` — Sidebar and card backgrounds. Clean but not stark against the ivory canvas.
- **Slate Ink** `#2C3E50` — Primary text. Deep blue-gray that reads as authoritative without harshness.
- **Muted Slate** `#5A6B7D` — Secondary text, labels, metadata.
- **Blue Border** `rgba(27, 79, 126, 0.1)` — Barely-visible blue-tinted divider. Adds institutional cohesion.

### Named Rules

**The Gold Scarcity Rule.** Scholar's Gold appears on ≤10% of any given screen. Its rarity is what makes it meaningful. Use it for CTAs, achievement markers, and active-state accents — never for backgrounds, large fills, or decorative fills.

**The Parchment Foundation Rule.** The warm ivory background is non-negotiable. Never replace it with pure white (`#FFF`) or cool gray. The warmth of the canvas is what makes the entire system feel inviting rather than clinical.

**The Crystal Glow Rule.** Crystal Blue is reserved for magical and interactive highlights — tooltips, interactive accents, subtle glow effects. It represents active magic in the world. Never use it for large surfaces or as a primary color.

**The Extended Families Rule.** Indigo, Amber, Copper, and Crimson encode content meaning — difficulty, category, domain. They appear on ≤15% of any screen individually. Never use them as general-purpose accents or decoration; each hue must correspond to a specific content type (indigo = premium/arcane, amber = fire/crafting/seasonal, copper = gathering/housing/earth, crimson = combat/warning).

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
- **The Winged Crest** — The golden shield with blue crystal center, mounted above the grand staircase. Used as the primary brand mark and hero emblem. Contains the four role icons (Sword, Shield, Staff, Book).
- **Cream Stone Texture** — The warm, slightly uneven quality of sunlit stone. Referenced in the parchment background and subtle surface textures.

### Applying Architecture to Layout

- Card corners use gentle rounding (14px) — soft but structured, like the curved archways.
- Section dividers use thin gold lines — echoing the ornamental trim between architectural elements.
- The hero banner uses a gradient overlay that mimics warm sunlight falling on stone.
- Sidebar borders use a barely-visible blue tint — institutional without being heavy.

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
- The blue-gold-lavender gradient wash on card headers echoes the sunset sky over the campus gardens.

## 6. Iconography

The visual language of symbols is drawn from the logo medallion and the magical elements in the interior illustrations.

### Brand Icons

- **The Winged Crest** — The primary brand mark. A golden shield frame with blue crystal center, flanked by stylized wings. Used for the logo, hero section emblem, and official documents.
- **Four Role Icons** — From the bottom of the logo medallion: Sword (DPS/Offensive), Shield (Tank/Defensive), Staff (Healer/Support), Book (Scholar/Knowledge). Used for role-based navigation and content categorization.
- **Crystal Icon** — A faceted blue crystal, representing magical energy and interactive elements. Used for tooltips, magical content markers, and interactive highlights.

### Content Icons

- **Floating Books** — From the grand hall illustration: magical books drifting through the air with glowing symbols. Used as a motif for guides, learning content, and the library section.
- **Academic Seal** — The circular medallion format of the logo. Used for certificates, achievements, and formal documentation.
- **Botanical Frames** — Lilies and lavender used as decorative borders for special content sections.

### Icon Principles

- Icons should feel hand-drawn or engraved, not flat or mechanical.
- Gold and blue are the primary icon colors. Lavender for secondary icons.
- Crystal cyan for interactive/magical icon states only.

## 7. Elevation & Effects

The system uses a hybrid approach: soft ambient shadows for cards and containers, with tonal layering (blue/gold/lavender tints) for visual hierarchy. Effects are inspired by the lighting in the illustrations — warm, diffused, magical.

### Crystal Glow Effect

A soft blue luminance used for interactive highlights and magical elements. Inspired by the glowing crystals in Eorzean dungeons.

```css
box-shadow: 0 0 12px rgba(93, 173, 226, 0.15);
```

Used sparingly: tooltip triggers, active magical elements, interactive crystal icons.

### Watercolor Gradients

Soft multi-color washes inspired by the illustration style. Used for card headers and section dividers.

```css
background: linear-gradient(135deg, var(--blue-light) 0%, var(--lavender-light) 100%);
```

Three gradient families:
- **Blue Wash** — `var(--blue-light)` to transparent. General content.
- **Gold Wash** — `var(--gold-light)` to transparent. Premium/achievement content.
- **Sunset Wash** — `var(--blue-light)` through `var(--lavender-light)`. Hero banners and special sections.

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
- **Primary (Blue):** Deep blue background (`#1B4F7E`), white text, gradient to darker blue on hover. Used for secondary CTAs and navigation actions.
- **Accent (Gold):** Lodestone gold background (`#C9A84C`), deep blue text. Reserved for the single most important CTA on any screen. Elevated shadow on hover.
- **Ghost (Icon):** Transparent background with subtle border. Used for header icons (theme toggle, notifications). Lifts on hover with border color shift.
- **Hover/Focus:** All buttons transition with the system easing curve (0.3s cubic-bezier(0.4, 0, 0.2, 1)). Hover adds 1-2px upward translation and deepened shadow.

### Cards

- **Corner Style:** Gently rounded (14px radius) — soft but structured, like the arched architecture.
- **Background:** Pearl white (`#FFFFFF`) on the parchment canvas.
- **Shadow Strategy:** Flat at rest (ambient shadow), lifted on hover (elevated shadow). The card "breathes" with interaction.
- **Border:** 1px solid blue-tinted border. On hover, the border shifts to gold — a subtle "gilded frame" signal of attention.
- **Internal Padding:** 20px standard. Post cards have watercolor gradient headers (blue/gold/lavender washes) with emoji icons, creating visual variety within a consistent structure.

### Navigation (Sidebar)

- **Style:** Fixed left sidebar, 280px width, white background with right border.
- **Typography:** 14px Inter, 500 weight. Active state uses 600 weight.
- **Default:** Muted text, transparent background.
- **Hover:** Blue-tinted background, blue text color. Icon scales up slightly (1.15x).
- **Active:** Same as hover but with added gold-tinted border and subtle shadow. The gold border is the "you are here" marker.
- **Mobile:** Collapses to off-canvas (`translateX(-100%)`), toggled by hamburger.

### Chips / Tags

- **Style:** Small pill badges (15px radius, 11px uppercase text).
- **Chip variants:** Blue background for general, gold background for premium/special, lavender for secondary, crystal for magical/interactive, indigo for premium/arcane content, amber for fire/crafting/seasonal, copper for gathering/housing, crimson for combat/warning.
- **State:** Always displayed; no toggle behavior. Purely informational.

### Stats Cards

- **Style:** Compact stat blocks in a 2x2 grid. Rounded corners (8px).
- **Background:** Color-tinted variants (blue, gold, lavender, indigo, amber, copper, crimson) to add visual rhythm — echoing the watercolor washes in the illustrations.
- **Content:** Large Cinzel numeral + small uppercase label. The number is the hero.

### Modal (Reading Overlay)

- **Shape:** 800px max-width, 85vh height, 20px radius.
- **Background:** Parchment ivory in light mode, deep charcoal in dark mode. Always warm.
- **Border:** 3px double gold border — the "open book" treatment. Formal and distinctive, like the gilded edges of an academy tome.
- **Header:** Watercolor gradient wash (blue or gold tint) with tag + title. Close button rotates 90deg on hover.
- **Body:** Generous 40px padding, 1.75 line-height. Tables, code blocks, and callout boxes are styled for comfortable long-form reading.

## 9. Dark Mode — "Eorzean Nightfall"

Dark mode transforms the campus from sunlit afternoon to magical twilight. Deeper tones replace the warm surfaces, but the institutional identity remains clear.

### Transformation

| Light Mode | Dark Mode | Rationale |
|---|---|---|
| Parchment Ivory `#F5F0E6` | Deep Night `#0D1B2A` | The campus at twilight |
| Pearl White `#FFFFFF` | Nebula Blue `#152238` | Shadowed stone |
| Lodestone Blue `#1B4F7E` | Crystal Blue `#5DADE2` | Blue brightens — crystals glow stronger at night |
| Lodestone Gold `#C9A84C` | Warm Gold `#D4A84C` | Gold warms in torchlight |
| Campus Lavender `#7B6FA0` | Soft Lavender `#A294C4` | Lavender lightens against dark surfaces |
| Crystal Blue `#5DADE2` | Vivid Crystal `#7FBFE0` | Crystals become more prominent in darkness |
| Indigo Deep `#2C3E7E` | Soft Indigo `#7B8FD4` | Indigo lightens for readability on dark surfaces |
| Amber Ember `#D4760E` | Warm Amber `#E8A54D` | Amber brightens like torchlight |
| Copper Forged `#7D6648` | Soft Copper `#A88B6B` | Copper lightens against dark stone |
| Crimson Blade `#922B21` | Vivid Crimson `#D4524E` | Crimson intensifies in the dark |

### Dark Mode Principles

- Blue and gold brighten to maintain contrast and their institutional roles.
- Crystal glow becomes more visible — magic is more apparent at night.
- Shadows deepen but remain diffused — never harsh.
- The warm parchment feel is replaced by a cool, contemplative atmosphere — "studying by crystal light."

## 10. Do's and Don'ts

### Do

- **Do** use the warm parchment background (`#F5F0E6`) as the canvas for every surface. It is the foundation of the system's inviting character.
- **Do** reserve Lodestone Gold (`#C9A84C`) for moments of distinction — CTAs, achievement markers, active-state accents. Its scarcity is what makes it meaningful.
- **Do** use Cinzel for display and headlines to carry the academic authority of the brand. Let Inter handle everything else.
- **Do** keep shadows diffused and ambient. The system breathes through gentle lifts, not dramatic drops.
- **Do** use the gold border shift on card hover as a subtle "gilded frame" attention signal — it is a signature pattern.
- **Do** support dark mode as "Eorzean Nightfall" — deeper tones, not inverted extremes. The gold accent brightens in dark mode to maintain its role.
- **Do** use generous whitespace and calm hierarchy. "Patience is pedagogy" applies to the layout itself.
- **Do** use watercolor-inspired gradients (blue-to-lavender washes) for card headers and section transitions.
- **Do** reference the architectural motifs — Gothic arches in card shapes, ornamental gold in borders, the crest as a brand mark.
- **Do** use crystal glow effects for interactive and magical highlights with restraint.
- **Do** use extended families (indigo, amber, copper, crimson) to encode content meaning — each hue maps to a domain. Let them carry hierarchy through tinted backgrounds and status indicators, never as decoration.

### Don't

- **Don't** use generic gaming portal aesthetics — neon colors, aggressive dark backgrounds, e-sports visual language, toxic-elitist UI patterns. *"This is not a speedrun leaderboard or a PvP ranking board."*
- **Don't** use glassmorphism, gradient text, bounce animations, or anything that reads as "AI-generated gaming site."
- **Don't** replace the warm parchment background with pure white (`#FFF`) or cool gray. The warmth of the canvas is non-negotiable.
- **Don't** use Cinzel in body text, labels, or UI chrome. It is reserved for moments of authority only.
- **Don't** overuse gold. If every button is gold, none of them are special. The Gold Scarcity Rule is absolute.
- **Don't** use tight, harsh shadows. If a shadow looks like it belongs on a material design button from 2014, it is too dark and too small.
- **Don't** add decorative elements that don't serve learning or navigation. Every pixel should either teach or guide.
- **Don't** use hard-stop gradients, neon transitions, or high-saturation color shifts. Gradients should feel like watercolor bleeding across wet paper.
- **Don't** use Crystal Blue for large surfaces or as a primary color. It is reserved for magical and interactive highlights only.
- **Don't** create iconography outside the established visual language. Use the crest, role icons, crystal, and floating book motifs already defined.
- **Don't** scatter extended families (indigo, amber, copper, crimson) as generic color accents. If a color doesn't map to a content domain, it doesn't belong on that element.
