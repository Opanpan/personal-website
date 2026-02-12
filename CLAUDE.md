# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio/resume website built with Next.js 14, TypeScript, and Tailwind CSS. Single-page layout with hash-based navigation (#home, #about, #experience, #projects, #skills, #contact). Supports English and Indonesian via i18next.

## Commands

```bash
npm run dev       # Dev server on localhost:3000
npm run build     # Production build (standalone output)
npm run start     # Run production server
npm run lint      # ESLint via next lint
```

No test framework is configured.

## Architecture

**Rendering strategy:** All page components are dynamically imported with `ssr: false` in `src/pages/index.tsx` for client-side rendering with code splitting.

**Key directories:**
- `src/components/` — Page section components (Hero, About, Experience, Projects, Skills, Contact, Navigation, Footer, Quote)
- `src/pages/` — Next.js pages (_app.tsx wraps providers, _document.tsx has global SEO meta, index.tsx assembles sections)
- `src/hooks/useTheme.tsx` — Theme context provider (dark/light mode via class strategy, persisted to localStorage)
- `src/lib/` — Data and config: `projects.ts` (project data), `techStack.ts` (skills data), `i18n.ts` (i18next setup), `framer-features.ts` (lazy-loaded Framer Motion features)
- `src/locales/{en,id}/common.json` — Translation files

**Styling:** Tailwind CSS with custom utility classes defined in `src/styles/globals.css` (`.glass`, `.glass-card`, `.card-hover`, `.btn-primary`, `.text-gradient`). Dark mode uses Tailwind's `class` strategy. Custom CSS variables for theme colors (`--bg-primary`, `--text-primary`, etc.).

**Animations:** Framer Motion (`LazyMotion` with `domMax`) for interactive animations; AOS library for scroll-triggered entrance animations.

**i18n:** i18next with browser language detection. Language switcher in Navigation. All user-facing strings go in `src/locales/{en,id}/common.json`.

**Path aliases:** `@/*` maps to `src/*` (configured in tsconfig.json).

## Deployment

Dockerized multi-stage build (Node 20-alpine, standalone output). Docker Compose includes:
- `portfolio` service (Next.js on port 3000)
- `nginx` reverse proxy with SSL (production profile)
- `certbot` for Let's Encrypt (production profile)

Environment variables in `.env`: `DOMAIN`, `EMAIL`, `NODE_ENV`.
