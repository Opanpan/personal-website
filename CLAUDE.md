# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio/resume website built with Next.js 14, TypeScript, and Tailwind CSS. Supports English and Indonesian via i18next.

Two front doors:
- `/` — an explorable 3D RPG world (Indonesian island) built with three.js + React Three Fiber. Code lives in `src/world/`.
- `/classic` — the original single-page site with hash-based navigation (#home, #about, #experience, #projects, #skills, #contact). Also the fallback when WebGL is unavailable.

## Commands

```bash
npm run dev       # Dev server on localhost:3000
npm run build     # Production build (standalone output)
npm run start     # Run production server
npm run lint      # ESLint via next lint
```

No test framework is configured.

## Architecture

**Rendering strategy:** Everything is client-rendered. `src/pages/index.tsx` dynamically imports `@/world/Game` with `ssr: false`; `src/pages/classic.tsx` does the same for each section component.

**3D world (`src/world/`):**
- `config.ts` — the single source of truth for layout: zone positions, `interactables` (each opens a content panel and counts toward the quest), paths, colliders, and `resolvePosition()` collision. Gameplay is on the y=0 plane; north is -z and the camera looks north.
- `store.ts` — tiny `useSyncExternalStore` store for UI state (started, open panel, nearby, visited — persisted in localStorage under `world-visited`). Selectors must return stable values (primitives or existing references).
- `runtime.ts` — mutable per-frame state (player position, keys, joystick, click-to-move target). Never put per-frame values in React state.
- `scene/` — R3F components. Everything is procedural low-poly geometry (no model files). Use `mat()` from `materials.ts` (cached flat-shaded `MeshLambertMaterial`; Lambert is deliberate — Standard materials compile/shade too slowly on integrated GPUs). Repeated props use merged geometry + `InstancedMesh`.
- `ui/` — DOM overlays (intro, HUD, panels, map, joystick) styled with the `.rpg-*` / `.world-*` classes in `globals.css`. Panel content is pulled from the same locale keys as the classic site, plus `world.*` keys.
- Adding a project to `src/lib/projects.ts` automatically adds a market stall + interactable.
- Keep the number of lights constant between day/night (toggle intensity, don't mount/unmount) — changing light count recompiles every shader.
- Day-only / night-only objects stay mounted and toggle `visible`, gated by `useWarmup()` so their shaders compile during the initial load. Mounting new shader types later freezes integrated GPUs for seconds.
- Graphics tiers: `quality` in the store (`high` = postprocessing bloom via `scene/Effects.tsx`, 9k grass tufts, extra walkers; `low` = lighter). drei `PerformanceMonitor` in `Game.tsx` steps down automatically unless the player picked a tier (persisted as `world-quality`).
- Textures are procedural canvases in `textures.ts` (ground with painted paths, sand, stone, relief, roof, thatch, wood, glow). Use `texMat()` for textured materials and `<Glow>` sprites (Landmarks) instead of extra point lights.
- Villagers/animals live in `scene/Life.tsx`; `scene/Character.tsx` is shared by the player and NPCs. Villagers with an `npc` id show speech bubbles (lines in `world.npc.<id>` locale keys — keep facts about Ifan grounded in existing site content) and wave back when `runtime.wave` fires nearby.
- `audio.ts` synthesises all sound with Web Audio (no files); it must be `init()`ed from a user gesture. `tour.ts` drives the guided tour (`TOUR_ORDER`). `props.ts` holds player actions: emotes, jump, interact, and interactive props (`propSpots` in config; torches are click-to-toggle).
- Keys: WASD/arrows move, Shift run, Space jump, E/Enter interact, 1-3 emotes, M map, Q journey log, Esc close.

**Key directories:**
- `src/components/` — Page section components (Hero, About, Experience, Projects, Skills, Contact, Navigation, Footer, Quote)
- `src/pages/` — Next.js pages (_app.tsx wraps providers, _document.tsx has global SEO meta, index.tsx assembles sections)
- `src/hooks/useTheme.tsx` — Theme context provider (dark/light mode via class strategy, persisted to localStorage)
- `src/lib/` — Data and config: `projects.ts` (project data), `techStack.ts` (skills data), `i18n.ts` (i18next setup), `framer-features.ts` (lazy-loaded Framer Motion features)
- `src/locales/{en,id}/common.json` — Translation files

**Styling:** Tailwind CSS (content paths include `src/world/` — keep it there or world classes get purged) with custom utility classes defined in `src/styles/globals.css` (`.glass`, `.glass-card`, `.card-hover`, `.btn-primary`, `.text-gradient`). Dark mode uses Tailwind's `class` strategy. Custom CSS variables for theme colors (`--bg-primary`, `--text-primary`, etc.).

**Animations:** Framer Motion (`LazyMotion` with `domMax`) for interactive animations; AOS library for scroll-triggered entrance animations.

**i18n:** i18next with browser language detection. Language switcher in Navigation. All user-facing strings go in `src/locales/{en,id}/common.json`.

**Path aliases:** `@/*` maps to `src/*` (configured in tsconfig.json).

## Deployment

Dockerized multi-stage build (Node 20-alpine, standalone output). `docker-compose.yml` runs only the `portfolio` service on the external `proxy-network` Docker network; routing and SSL come from `VIRTUAL_HOST` / `LETSENCRYPT_HOST` (`ifan.alriansyah.my.id`).

`proxy-network/` holds the shared reverse proxy used by all apps on the server (this site, kultura-app, olew-app, olew-admin): `nginx-proxy` + `acme-companion` (Let's Encrypt). Global nginx settings are in `proxy-network/proxy.conf`; per-host overrides are `proxy-network/<host>_location` files mounted into `vhost.d`. `init-letsencrypt.sh` starts the proxy if it isn't running, then deploys the portfolio.

Environment variables in `.env`: `DOMAIN`, `EMAIL`, `NODE_ENV`.
