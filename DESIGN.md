<!-- SEED: established with the user before implementation; re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: Hall of the Novice EX
description: Arcane Dashboard — gaming-grade dark interface for a magical FFXIV academy
---

# Design System: Hall of the Novice EX

## Overview

**Creative North Star: "The Arcane Dashboard"**

A magical academy that runs on a gaming-grade control panel. The Sharlayan scholar's desk reimagined as a sleek dark interface — deep slate backgrounds, luminous teal accents, regal gold identity, glass-morphism depth, and serif-forward typography. The warmth of academia meets the precision of a game launcher. Every surface feels active, alive, and purposeful.

The system refuses the warm parchment default of academic guilds. Instead it borrows from esports dashboards and game UIs: high-contrast dark grounds, luminous accent colors that pop against slate, semi-transparent glass cards with subtle blur, and a typographic hierarchy that commands attention. The magical academy identity lives in the gold accents, the ceremonial Cinzel for display headings, and the copy's scholarly voice carried by Cormorant Garamond.

**Key Characteristics:**
- Deep slate ground (#1a1f2e) — dark but not oppressive, with lighter surface layers
- Luminous teal (#5BA4B5) as the primary action color — calm, arcane, commanding
- Muted gold (#c9a84c) as the secondary identity color — academic, prestigious
- Lavender (#9B7EC8) for tertiary highlights — mystical, distinctive
- Glass-morphism cards with backdrop-blur and subtle borders
- Cormorant Garamond for body text, Space Grotesk for display, Cinzel for ceremonial headings
- Generous spacing with dashboard-style grid layout
- Motion: subtle glow on hover, smooth page transitions, floating particles

## Colors

The palette is built for dark-mode-first browsing with a lightened slate ground that avoids pitch-black oppression. Vibrant accents pop against the dark surface.

### Primary
- **Arcane Teal** (#5BA4B5): Primary action color — CTAs, active states, highlights, interactive accents. Calm, arcane, commanding against dark grounds.
- **Arcane Teal Deep** (#2D6A6A): Hover/pressed state for primary actions. Deeper saturation on interaction.

### Secondary
- **Sharlayan Gold** (#c9a84c): Identity and prestige — headings, borders, decorative accents, admin badges. Carries the academic authority.
- **Sharlayan Gold Accent** (#d4b85c): Hover state for gold elements.

### Tertiary
- **Arcane Lavender** (#9B7EC8): Mystical highlights — counters, secondary data, mystical emphasis. Used sparingly for data that needs distinction without urgency.

### Neutral
- **Deep Slate** (#1a1f2e): Primary background — dark but warm, not pure black.
- **Slate Surface** (#232a3b): Card and panel backgrounds — one step lighter than ground.
- **Slate Elevated** (#2a3244): Elevated surfaces, modals, dropdowns — highest layer.
- **Slate Border** (#374151): Subtle borders and dividers — visible but not loud.
- **Muted Text** (#94a3b8): Secondary text, labels, placeholders — readable against dark surfaces.
- **Light Text** (#e2e8f0): Primary body text — high contrast against dark ground.
- **White Text** (#f8fafc): Headings and emphasis — maximum contrast.

### Named Rules
**The Accent Rarity Rule.** Arcane Teal is used on ≤15% of any given screen. Its rarity is what makes it command attention. When everything is teal, nothing is.

**The Gold Identity Rule.** Sharlayan Gold appears only on elements that carry institutional identity — the logo mark, section headings, admin badges, and decorative borders. It never serves as a functional action color.

## Typography

**Display Font:** Space Grotesk (with fallback: system-ui, sans-serif) — hero headlines, page titles
**Body Font:** Cormorant Garamond (with fallback: Inter, system-ui, sans-serif) — body text, prose, scholarly voice
**Heading Font:** Cinzel (with fallback: Georgia, serif) — section headings, ceremonial display moments
**Label Font:** Inter (with fallback: system-ui, sans-serif) — navigation items, badges, metadata

**Character:** The pairing is scholarly and commanding — Cormorant Garamond carries the academic gravitas in body text, Space Grotesk brings geometric boldness for display headlines, and Cinzel appears as the ceremonial heading face for institutional authority. Inter serves the functional label role.

### Hierarchy
- **Display** (700 weight, clamp(2rem, 5vw, 3.5rem), line-height 1.1): Hero headlines, page titles — the loudest voice on the page.
- **Headline** (600 weight, 1.5rem, line-height 1.2): Section headings — clear structure markers.
- **Title** (600 weight, 1.125rem, line-height 1.3): Card titles, subsection headers —紧凑 and scannable.
- **Body** (400 weight, 0.875rem, line-height 1.6): Main content text — measured at 65–75ch max width.
- **Label** (500 weight, 0.75rem, letter-spacing 0.05em, uppercase): Navigation items, badges, metadata — compact and functional.

### Named Rules
**The Three-Face Rule.** Space Grotesk owns display and hero headlines. Cinzel owns section headings and ceremonial display. Cormorant Garamond owns body and prose. Inter owns labels and metadata. Each face has a clear role — mixing them breaks the hierarchy.

## Layout

Dashboard-style grid with a max-width of 1280px (max-w-7xl). The homepage uses a hero section followed by a responsive card grid. Navigation is a persistent sidebar (desktop) with a hamburger-triggered overlay (mobile) plus a bottom navigation bar for quick access. Spacing follows an 8px base unit: sections separated by 64px, cards within sections by 24px, internal card padding by 24px.

Mobile: single-column stack, bottom navigation bar, reduced card density. The hero scales down but retains its dark ground and accent hierarchy.

## Elevation & Depth

The system uses glass-morphism for depth: semi-transparent backgrounds with backdrop-blur, not heavy shadows. Shadows are reserved for hover states and elevated panels.

### Shadow Vocabulary
- **Card Rest** (`box-shadow: 0 1px 3px rgba(0,0,0,0.3)`): Subtle baseline lift on all cards at rest.
- **Card Hover** (`box-shadow: 0 8px 24px rgba(91,164,181,0.15)`): Teal-tinted glow on interactive card hover — the signature depth moment.
- **Panel Elevated** (`box-shadow: 0 12px 40px rgba(0,0,0,0.4)`): Modals, dropdowns, elevated panels — the highest rest state.

### Named Rules
**The Glass Rule.** Cards and panels use `background: rgba(35,42,59,0.8)` with `backdrop-filter: blur(12px)` and a 1px border of `rgba(55,65,81,0.5)`. This creates depth through transparency, not shadow weight. Heavy shadows are hover-only.

## Shapes

Rounded-2xl (16px) is the dominant radius — applied to cards, buttons, badges, and containers. This creates a friendly, approachable feel that softens the dark palette. Inputs use rounded-xl (12px). The navbar uses no radius (full-bleed). Buttons use rounded-xl (12px) for a slightly tighter feel than cards.

## Components

### Buttons
- **Shape:** rounded-xl (12px)
- **Primary:** Arcane Teal background, white text, 12px 24px padding, bold weight. Hover: deeper teal + subtle scale(1.02).
- **Secondary:** Transparent background, teal border, teal text. Hover: teal background at 10% opacity.
- **Ghost:** Transparent, no border. Hover: slate-elevated background.

### Cards
- **Corner Style:** rounded-2xl (16px)
- **Background:** Glass-morphism: rgba(35,42,59,0.8) with backdrop-blur(12px)
- **Shadow Strategy:** Rest shadow at baseline, teal-tinted glow on hover
- **Border:** 1px solid rgba(55,65,81,0.5)
- **Internal Padding:** 24px

### Navigation
- **Style:** Persistent sidebar (256px), slate-surface gradient background, golden ornamental borders
- **Desktop:** Vertical links with custom SVG icons, active state = teal glow-bar on left edge
- **Mobile:** Hamburger-triggered overlay sidebar + fixed bottom bar with icon-only links

### Badges / Chips
- **Style:** Rounded-full, small, uppercase labels
- **Variants:** Teal (primary action), Gold (identity), Lavender (mystical), Sage (success)
