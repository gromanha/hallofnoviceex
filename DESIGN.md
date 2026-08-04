# Design System: Hall of the Novice EX

## Overview

**Creative North Star: "The Magical Campus"**

O visitante está dentro do campus da Majestic Battle Academy. Cada seção do site é um "cômodo" ou "área" da escola de magia. A navegação é caminhar pelo campus — do saguão iluminado para a biblioteca, dos jardins para a sala de aula. A interface desaparece; a experiência é imersiva, acolhora e viva.

O sistema abandona o dashboard gaming escuro e abraça uma estética de ilustração aquática — tons quentes de parchment, arquitetura gótica com arcos e colunas, cristais brilhantes, livros flutuantes, e jardins de lavanda. Cada superfície tem textura e profundidade natural. A identidade vive na paleta da academia: teal domos, gold ornamental, lavanda mística, e sage da natureza.

**Características-chave:**
- Ground cream quente (#F5EFE0) — iluminado, acolhedor, não frio
- Academy Teal (#5BA4B5) como cor de ação principal — calmo, arcano, comandante
- Academy Gold (#C9A84C) como cor de identidade — acadêmico, prestigiado
- Academy Lavender (#9B7EC8) para highlights terciários — místico, distintivo
- Academy Sage (#7BA68A) para elementos naturais — sucesso, crescimento
- Cards com textura de parchment e bordas douradas sutil
- Cormorant Garamond para corpo, Cinzel para heading cerimonial, Inter para labels
- Espaçamento generoso com layout de campus
- Motion: livros flutuando, cristais brilhando,ivy balançando

## Colors

A paleta é construída para light-mode-first com escuro como variação noturna. Tons quentes e naturais dominam; accents vibrantes ganham contraste contra o ground claro.

### Primary
- **Academy Teal** (#5BA4B5): Cor de ação principal — CTAs, estados ativos, destaques, accents interativos. Calmo, arcano, comandante contra grounds claros.
- **Academy Teal Deep** (#3D8A96): Estado hover/pressed para ações primárias. Mais saturação na interação.
- **Academy Teal Light** (#8EC5D0): Backgrounds sutis, highlights de texto, badges.

### Secondary
- **Academy Gold** (#C9A84C): Identidade e prestígio — headings, bordas, accents decorativos, badges de admin. Carrega a autoridade acadêmica.
- **Academy Gold Accent** (#D4B85C): Estado hover para elementos gold.
- **Academy Gold Muted** (#B89A3F): Versão mais sutil para bordas e divisores.

### Tertiary
- **Academy Lavender** (#9B7EC8): Highlights místicos — contadores, dados secundários, ênfase mística. Usado com moderação para dados que precisam de distinção sem urgência.
- **Academy Lavender Light** (#C4B0E0): Backgrounds suaves, badges secundários.

### Nature
- **Academy Sage** (#7BA68A): Elementos naturais — estados de sucesso, badges de progresso, natureza. Conecta ao jardim da academia.
- **Academy Sage Light** (#A8CDB5): Backgrounds de sucesso, badges sutis.

### Neutral (Light Mode — padrão)
- **Academy Cream** (#F5EFE0): Background principal — warm, iluminado, não branco puro.
- **Stone Light** (#E8E0D0): Superfícies de cards e painéis — um passo acima do ground.
- **Stone Medium** (#C4B8A0): Bordas e divisores — visível mas não alto.
- **Stone Dark** (#8B7E6A): Texto secundário, labels, placeholders — legível contra surfaces claros.
- **Ink Dark** (#2D3436): Texto principal — alto contraste contra grounds claros.
- **Ink Black** (#1A1A2E): Headings e ênfase — contraste máximo.

### Named Rules
**The Accent Rarity Rule.** Academy Teal é usado em ≤15% de qualquer tela. Sua raridade é o que faz com que ganhe atenção. Quando tudo é teal, nada é.

**The Gold Identity Rule.** Academy Gold aparece apenas em elementos que carregam identidade institucional — o logotipo, headings de seção, badges de admin e bordas decorativas. Nunca serve como cor de ação funcional.

**The Campus Light Rule.** O campus é iluminado. Backgrounds são sempre claros e quentes. Escuro é uma variação, não o padrão.

## Typography

**Display Font:** Cinzel (com fallback: Georgia, serif) — hero headlines, títulos de página cerimonial
**Body Font:** Cormorant Garamond (com fallback: Inter, system-ui, sans-serif) — texto corpo, prosa, voz acadêmica
**Heading Font:** EB Garamond (com fallback: Cormorant Garamond, serif) — headings de seção, momentos de exibição
**Label Font:** Inter (com fallback: system-ui, sans-serif) — itens de navegação, badges, metadados

**Característica:** O casamento é acadêmico e cerimonial — Cormorant Garamond carrega a gravidade acadêmica no corpo, Cinzel traz autoridade para headings cerimoniais, EB Garamond elegância para headings de seção, e Inter serve o papel funcional de label.

### Hierarchy
- **Display** (700 weight, clamp(2rem, 5vw, 3.5rem), line-height 1.1): Hero headlines, títulos de página — a voz mais alta na página.
- **Headline** (600 weight, 1.5rem, line-height 1.2): Headings de seção — marcadores de estrutura claros.
- **Title** (600 weight, 1.125rem, line-height 1.3): Títulos de cards, subseções — compacto e escaneável.
- **Body** (400 weight, 0.875rem, line-height 1.6): Texto conteúdo principal — medido em 65–75ch largura máxima.
- **Label** (500 weight, 0.75rem, letter-spacing 0.05em, uppercase): Itens de navegação, badges, metadados — compacto e funcional.

### Named Rules
**The Three-Face Rule.** Cinzel tem display e hero headlines. EB Garamond tem headings de seção. Cormorant Garamond tem corpo e prosa. Inter tem labels e metadados. Cada face tem um papel claro — misturá-las quebra a hierarquia.

## Layout

Layout de campus com largura máxima de 1280px (max-w-7xl). A homepage usa uma seção hero seguida de grid responsivo de cards. Navegação é uma sidebar persistente (desktop) com overlay ativado por hamburger (mobile) mais barra de navegação inferior para acesso rápido. Espaçamento segue uma unidade base de 8px: seções separadas por 64px, cards dentro de seções por 24px, padding interno de cards por 24px.

Mobile: stack coluna única, barra de navegação inferior, densidade de cards reduzida. O hero escala para baixo mas retém seu ground claro e hierarquia de accent.

### Campus Sections
Cada seção do site representa uma área do campus:
- **Hero** → Vista panorâmica do campus (entrada principal)
- **Academia** → Sala de aula / Biblioteca
- **Calendário** → Quadro de eventos do pátio
- **Receitas** → Cozinha mágica
- **Game Data** → Biblioteca de tomos
- **Footer** → Portão de saída do campus

## Elevation & Depth

O sistema usa textura e bordas para profundidade, não glass-morphism pesado. Sombras são reservadas para hover states e painéis elevados.

### Shadow Vocabulary
- **Card Rest** (`box-shadow: 0 2px 8px rgba(0,0,0,0.06)`): Levantar sutil em todos os cards em repouso.
- **Card Hover** (`box-shadow: 0 8px 24px rgba(91,164,181,0.12)`): Brilho teal-tinted em hover de card interativo — o momento de profundidade assinatura.
- **Panel Elevated** (`box-shadow: 0 12px 40px rgba(0,0,0,0.1)`): Modals, dropdowns, painéis elevados — o estado de repouso mais alto.

### Named Rules
**The Parchment Rule.** Cards e painéis usam `background: var(--stone-light)` com `border: 1px solid var(--stone-medium)` e `border-radius: 16px`. Isso cria profundidade através de textura e borda, não transparência. Sombras pesadas são apenas em hover.

## Shapes

Rounded-2xl (16px) é o radius dominante — aplicado a cards, botões, badges e containers. Isso cria uma sensação amigável e acolhedora que suaviza a paleta. Inputs usam rounded-xl (12px). A navbar usa sem radius (full-bleed). Botões usam rounded-xl (12px) para um feel mais compacto que cards.

### Ornamental Shapes
- **Gothic Arches:** Formas de arco para headings de seção e divisores — evoca a arquitetura da academia
- **Crystal Points:** Formas de cristal para badges e ícones — evoca a magia
- **Ivy Borders:** Bordas com padrão de hera para seções decorativas — evoca os jardins
- **Column Dividers:** Divisores estilo coluna gótica para separar seções

## Components

### Buttons
- **Shape:** rounded-xl (12px)
- **Primary:** Academy Teal background, white text, 12px 24px padding, bold weight. Hover: deeper teal + subtle scale(1.02).
- **Secondary:** Transparent background, gold border, gold text. Hover: gold background at 10% opacity.
- **Ghost:** Transparent, no border. Hover: stone-light background.

### Cards
- **Corner Style:** rounded-2xl (16px)
- **Background:** Stone Light (#E8E0D0) with subtle parchment texture
- **Shadow Strategy:** Rest shadow at baseline, teal-tinted glow on hover
- **Border:** 1px solid Stone Medium (#C4B8A0)
- **Internal Padding:** 24px
- **Decorative:** Optional gold top-border for identity cards, ivy corner ornament for special cards

### Navigation (Sidebar)
- **Style:** Persistent sidebar (256px), academy cream gradient background, golden ornamental borders
- **Desktop:** Vertical links with custom SVG icons, active state = teal glow-bar on left edge
- **Mobile:** Hamburger-triggered overlay sidebar + fixed bottom bar with icon-only links
- **Decorative:** Floating book animation at bottom, crystal divider between sections

### Badges / Chips
- **Style:** Rounded-full, small, uppercase labels
- **Variants:** Teal (primary action), Gold (identity), Lavender (mystical), Sage (success)

### Section Headers
- **Style:** Cinzel font, gold color, optional ornamental underline (crystal divider or ivy line)
- **Decorative:** Small floating crystal icon to the left of heading

### Hero Section
- **Style:** Full-width panoramic image of the campus with gradient overlay
- **Content:** Large Cinzel heading, subtitle in Cormorant Garamond, search bar, quick stats
- **Decorative:** Floating books, crystal particles, ivy borders

## Decorative Elements

### SVG Library
- **ivy-corner.svg:** Corner ornament with ivy leaves — used on cards and sections
- **crystal-divider.svg:** Horizontal divider with crystal point — used between sections
- **floating-book.svg:** Animated floating book — used in hero and sidebar
- **lavender-sprig.svg:** Lavender sprig decoration — used in footer and cards
- **column-ornament.svg:** Gothic column ornament — used in section headers
- **rune-circle.svg:** Magical rune circle — used as background texture
- **academy-crest.svg:** Academy crest — used in sidebar and login

### Animations
- **Floating Books:** Gentle up-down oscillation on hero and sidebar books
- **Crystal Glow:** Subtle pulse on crystal elements
- **Ivy Sway:** Gentle left-right sway on ivy decorations
- **Card Hover:** Teal-tinted shadow expansion + slight scale
- **Page Transitions:** Fade-in with slight upward slide

## Responsive

### Desktop (1024px+)
- Persistent sidebar (256px)
- Multi-column card grid (3 columns)
- Full hero with panoramic image
- All decorative elements visible

### Tablet (768px-1023px)
- Collapsed sidebar (icon-only, 64px)
- 2-column card grid
- Hero scaled down
- Reduced decorative density

### Mobile (< 768px)
- Hidden sidebar with hamburger trigger
- Bottom navigation bar
- Single-column stack
- Hero compressed to key visual + text
- Minimal decorative elements
- Touch-friendly targets (44px minimum)

## Dark Mode: "Noturno no Campus"

Dark mode é uma variação noturna, não o padrão. O campus à noite:
- Ground: Deep navy (#1A1F2E) — azulado, não preto
- Surface: Slate (#232A3B)
- Accents: Mesmas cores mas com mais brilho/luminosidade
- Decorative: Cristais brilhantes mais pronunciados, livros com glow
- Sensação: Mágico, misterioso, mas ainda acolhedor

## Accessibility

- Skip link "Pular para o conteúdo principal"
- Contraste WCAG AA em todos os textos
- Focus visible em todos os elementos interativos
- Reduced motion: desabilita todas as animações
- Screen reader: sr-only labels em ícones decorativos
- Semantic HTML: landmarks, headings hierarchy, alt text

## Performance

- Imagens AI em WebP com lazy loading
- Blur placeholders para imagens de card
- CSS custom properties para temas (sem re-render)
- Font preloading (critical fonts only)
- Framer Motion com reducedMotion="user"
- SVG inline para decorative elements (sem requests extras)
