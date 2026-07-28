# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Jogadores FFXIV brasileiros:** membros e potenciais membros da Free Company que buscam guias, eventos, calendário e conteúdo educacional em PT-BR. Estão em situações de jogo (organização de learning parties, busca por guias de raids Extreme/Savage/Ultimate) e precisam de uma experiência imersiva e acessível.
- **Liderança da FC (Reitoria e Corpo Docente):** professores e administradores que gerenciam eventos, posts, categorias de receitas e conteúdo do site. Precisam de uma interface de administração funcional para manter o site atualizado.

Ambos os públicos são igualmente importantes; o site serve tanto quanto plataforma de conteúdo quanto ferramenta de gestão.

## Product Purpose

A Free Company **Hall of the Novice EX [HoN]** é uma comunidade brasileira de Final Fantasy XIV projetada para ser um ambiente de aprendizado seguro, imersivo e totalmente livre de toxicidade. O site é o hub digital da comunidade — onde jogadores descobrem a FC, consomem guias traduzidos, acompanham eventos, exploram receitas do jogo e se conectam com o Discord.

Sucesso significa: novos jogadores encontram e se matriculam na academia pelo Discord, membros existentes acessam guias e eventos facilmente, e a liderança mantém o conteúdo atualizado sem fricção.

## Positioning

Inspirada na cidade de Old Sharlayan, a FC se posiciona como uma **Academia de Magia, Batalha e Artesanato** — expandindo o conceito do Hall of the Novice do jogo base para conteúdos Extreme, Savage e Ultimate, com didática paciente e imersão temática completa. O diferencial é a combinação de: (1) ensino sem toxicidade, (2) estrutura acadêmica imersiva com cargos e hierarquia, (3) biblioteca de guias em PT-BR, e (4) vivência social além do combate.

## Operating Context

- **Plataforma digital:** site web responsivo acessado via desktop e mobile
- **Ecosistema:** integrado com Discord para comunidade e matrícula, Supabase para backend/auth, e deploy via Vercel
- **Conteúdo:** posts/codice (guias, notícias, anúncios), calendário de eventos (learning parties, raids), receitas do jogo (crafting cookbook)
- **Fluxo de matrícula:** visitante → Discord → registro de personagem via bot → visitar FC house in-game
- **Administração:** login JWT, painel para gerenciar eventos, posts, categorias e receitas

## Capabilities and Constraints

- **Funcionalidades existentes (preservar):**
  - Página Home com hero, featured posts, quick links
  - Página Academia (sobre a FC, pilares, corpo docente, campus)
  - Calendário de eventos com filtros por tipo (Spells, Tactics, Alchemy, Ritual)
  - Posts/Codice com sistema de categorias (notícias, códice, guias, anúncios, crafting)
  - Receitas do jogo com sistema de categorias (café da manhã, aperitivos, pães, sopas, pratos principais, sobremesas, bebidas)
  - Painel Admin com CRUD para eventos, posts, categorias, receitas
  - Autenticação JWT com bcrypt e cookies
  - Dark/light theme toggle
  - Animações de página com Framer Motion
  - Acessibilidade: skip link, sr-only, semântica HTML
- **Restrições técnicas:**
  - React 19 + TypeScript + Vite
  - Tailwind CSS v4
  - Supabase (PostgreSQL + RLS)
  - Express.js backend (server.js)
  - Deploy via Vercel
- **Marca:** nome "Hall of the Novice EX [HoN]", logo existente em /assets/logo.png, identidade Sharlayan acadêmica, voz em PT-BR
- **Restrições legais:** © 2026 Hall of the Novice EX. Todos os direitos reservados à Square Enix

## Brand Commitments

- **Nome:** Hall of the Novice EX [HoN]
- **Voz:** Didática, acolhedora, sem toxicidade — fala como um professor paciente
- **Personalidade:** Acadêmica, imersiva, sábia — inspirada em Sharlayan
- **Lema:** "Onde o conhecimento se torna a sua maior magia"
- **Lema pessoal do Reitor:** "Fortuna favet Prudentibus" (A sorte favorece os preparados)
- **Idioma:** PT-BR

## Evidence on Hand

- Logo: `/assets/logo.png`
- Schema Supabase com tabelas: admins, events, event_types, posts, recipe_categories, recipes
- Posts seed: "Códice de Fundação" e "Guia Zodiac Weapon"
- Event types seed: Spells, Tactics, Alchemy, Ritual, Outros
- Receitas: categorias com 8 tipos (breakfast → drinks)
- Fonts loaded: Cinzel (headings), Inter (body), Playfair Display, Space Grotesk, Hanken Grotesk
- README completo com toda a narrativa da FC (pilares, corpo docente, campus, guias)

## Product Principles

1. **Acessibilidade primeiro:** conteúdo e navegação funcionam para todos, independente de dispositivo ou habilidade
2. **Imersão temática:** o site deve sentir-se como uma extensão do mundo de Sharlayan — não um site genérico de guilda
3. **Conteúdo é rei:** guias, eventos e receitas são o coração; a interface deve servir ao conteúdo, não competir com ele
4. **Comunidade antes de tudo:** cada elemento deve reforçar pertencimento e reduzir barreiras para novos membros
5. **Clareza sobre ornamento:** decisão visual deve ser tomada primeiro por clareza e usabilidade, depois por expressão estética

## Accessibility & Inclusion

- Skip link "Pular para o conteúdo principal" já implementado
- Tema dark/light disponível
- Linguagem PT-BR como padrão
- Sem restrições de acessibilidade documentadas além das práticas gerais já adotadas
