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

Dockerized multi-stage build (Node 20-alpine, standalone output). `docker-compose.yml` runs only the `portfolio` service on the external `proxy-network` Docker network; routing and SSL come from `VIRTUAL_HOST` / `LETSENCRYPT_HOST` (`ifan.alriansyah.my.id`).

`proxy-network/` holds the shared reverse proxy used by all apps on the server (this site, kultura-app, olew-app, olew-admin): `nginx-proxy` + `acme-companion` (Let's Encrypt). Global nginx settings are in `proxy-network/proxy.conf`; per-host overrides are `proxy-network/<host>_location` files mounted into `vhost.d`. `init-letsencrypt.sh` starts the proxy if it isn't running, then deploys the portfolio.

Environment variables in `.env`: `DOMAIN`, `EMAIL`, `NODE_ENV`.
