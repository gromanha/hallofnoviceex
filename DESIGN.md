<!-- SEED: established with the user before implementation; re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: Hall of the Novice EX
description: Arcane Dashboard — gaming-grade dark interface for a magical FFXIV academy
---

# Design System: Hall of the Novice EX

## Overview

**Creative North Star: "The Arcane Dashboard"**

A magical academy that runs on a gaming-grade control panel. The Sharlayan scholar's desk reimagined as a sleek dark interface — deep slate backgrounds, vibrant orange-gold accents, glass-morphism depth, and bold sans-serif typography. The warmth of academia meets the precision of a game launcher. Every surface feels active, alive, and purposeful.

The system refuses the warm parchment default of academic guilds. Instead it borrows from esports dashboards and game UIs: high-contrast dark grounds, luminous accent colors that pop against slate, semi-transparent glass cards with subtle blur, and a typographic hierarchy that commands attention. The magical academy identity lives in the gold accents, the careful use of Cinzel for display moments, and the copy's scholarly voice.

**Key Characteristics:**
- Deep slate ground (#1a1f2e) — dark but not oppressive, with lighter surface layers
- Vibrant orange (#f97316) as the primary action color — urgent, alive, commanding
- Muted gold (#c9a84c) as the secondary identity color — academic, prestigious
- Steel-blue (#5dade2) for informational highlights — calm, trustworthy
- Glass-morphism cards with backdrop-blur and subtle borders
- Bold sans-serif display type (Space Grotesk) paired with clean body (Inter)
- Generous spacing with dashboard-style grid layout
- Motion: subtle glow on hover, smooth page transitions, countdown urgency

## Colors

The palette is built for dark-mode-first browsing with a lightened slate ground that avoids pitch-black oppression. Vibrant accents pop against the dark surface.

### Primary
- **Arcane Orange** (#f97316): Primary action color — CTAs, active states, highlights, urgent elements. Used on buttons, links, badges, and interactive accents.
- **Arcane Orange Deep** (#c2410c): Hover/pressed state for primary actions. Deeper saturation on interaction.

### Secondary
- **Sharlayan Gold** (#c9a84c): Identity and prestige — headings, borders, decorative accents, admin badges. Carries the academic authority.
- **Sharlayan Gold Light** (#f0e5c4): Subtle gold tint for backgrounds and highlights.

### Tertiary
- **Eorzean Blue** (#5dade2): Informational highlights — counters, secondary data, calm emphasis. Used sparingly for data that needs attention without urgency.

### Neutral
- **Deep Slate** (#1a1f2e): Primary background — dark but warm, not pure black.
- **Slate Surface** (#232a3b): Card and panel backgrounds — one step lighter than ground.
- **Slate Elevated** (#2a3244): Elevated surfaces, modals, dropdowns — highest layer.
- **Slate Border** (#374151): Subtle borders and dividers — visible but not loud.
- **Muted Text** (#94a3b8): Secondary text, labels, placeholders — readable against dark surfaces.
- **Light Text** (#e2e8f0): Primary body text — high contrast against dark ground.
- **White Text** (#f8fafc): Headings and emphasis — maximum contrast.

### Named Rules
**The Accent Rarity Rule.** Arcane Orange is used on ≤15% of any given screen. Its rarity is what makes it command attention. When everything is orange, nothing is.

**The Gold Identity Rule.** Sharlayan Gold appears only on elements that carry institutional identity — the logo mark, section headings, admin badges, and decorative borders. It never serves as a functional action color.

## Typography

**Display Font:** Space Grotesk (with fallback: system-ui, sans-serif)
**Body Font:** Inter (with fallback: system-ui, sans-serif)
**Accent Font:** Cinzel (with fallback: Georgia, serif) — reserved for the academy name and ceremonial headings only.

**Character:** The pairing is confident and modern — Space Grotesk brings geometric boldness for display moments, Inter provides neutral clarity for body text. Cinzel appears only as a signature accent for the academy name, creating a ceremonial touch without cluttering the hierarchy.

### Hierarchy
- **Display** (700 weight, clamp(2rem, 5vw, 3.5rem), line-height 1.1): Hero headlines, page titles — the loudest voice on the page.
- **Headline** (600 weight, 1.5rem, line-height 1.2): Section headings — clear structure markers.
- **Title** (600 weight, 1.125rem, line-height 1.3): Card titles, subsection headers —紧凑 and scannable.
- **Body** (400 weight, 0.875rem, line-height 1.6): Main content text — measured at 65–75ch max width.
- **Label** (500 weight, 0.75rem, letter-spacing 0.05em, uppercase): Navigation items, badges, metadata — compact and functional.

### Named Rules
**The Two-Face Rule.** Space Grotesk owns display and headline roles. Inter owns body and label. Cinzel appears only on the academy name "Hall of the Novice EX" and nowhere else. Mixing display faces breaks the hierarchy.

## Layout

Dashboard-style grid with a max-width of 1280px (max-w-7xl). The homepage uses a hero section followed by a responsive card grid. Navigation is a sticky top bar with horizontal links (desktop) collapsing to a bottom bar (mobile). Spacing follows an 8px base unit: sections separated by 64px, cards within sections by 24px, internal card padding by 24px.

Mobile: single-column stack, bottom navigation bar, reduced card density. The hero scales down but retains its dark ground and accent hierarchy.

## Elevation & Depth

The system uses glass-morphism for depth: semi-transparent backgrounds with backdrop-blur, not heavy shadows. Shadows are reserved for hover states and elevated panels.

### Shadow Vocabulary
- **Card Rest** (`box-shadow: 0 1px 3px rgba(0,0,0,0.3)`): Subtle baseline lift on all cards at rest.
- **Card Hover** (`box-shadow: 0 8px 24px rgba(249,115,22,0.15)`): Orange-tinted glow on interactive card hover — the signature depth moment.
- **Panel Elevated** (`box-shadow: 0 12px 40px rgba(0,0,0,0.4)`): Modals, dropdowns, elevated panels — the highest rest state.

### Named Rules
**The Glass Rule.** Cards and panels use `background: rgba(35,42,59,0.8)` with `backdrop-filter: blur(12px)` and a 1px border of `rgba(55,65,81,0.5)`. This creates depth through transparency, not shadow weight. Heavy shadows are hover-only.

## Shapes

Rounded-2xl (16px) is the dominant radius — applied to cards, buttons, badges, and containers. This creates a friendly, approachable feel that softens the dark palette. Inputs use rounded-xl (12px). The navbar uses no radius (full-bleed). Buttons use rounded-xl (12px) for a slightly tighter feel than cards.

## Components

### Buttons
- **Shape:** rounded-xl (12px)
- **Primary:** Arcane Orange background, white text, 12px 24px padding, bold weight. Hover: deeper orange + subtle scale(1.02).
- **Secondary:** Transparent background, orange border, orange text. Hover: orange background at 10% opacity.
- **Ghost:** Transparent, no border. Hover: slate-elevated background.

### Cards
- **Corner Style:** rounded-2xl (16px)
- **Background:** Glass-morphism: rgba(35,42,59,0.8) with backdrop-blur(12px)
- **Shadow Strategy:** Rest shadow at baseline, orange-tinted glow on hover
- **Border:** 1px solid rgba(55,65,81,0.5)
- **Internal Padding:** 24px

### Navigation
- **Style:** Sticky top bar, slate-surface background with backdrop-blur, bottom border of gold at 30% opacity
- **Desktop:** Horizontal links with icons, active state = orange background pill
- **Mobile:** Bottom bar with icon-only links, active = orange text

### Badges / Chips
- **Style:** Rounded-full, small, uppercase labels
- **Variants:** Orange (primary action), Gold (identity), Blue (info), Sage (success)
