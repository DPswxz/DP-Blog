# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VitePress Theme Akari — a Material You (Material Design 3) blog/documentation theme for VitePress, built with Vue 3, MDUI v2, GSAP, and Pinia.

## Commands

- **Dev server:** `npm run docs:dev`
- **Build:** `npm run docs:build` (automatically runs `tools/content-fixer.mjs` as a pre-build step)
- **Preview:** `npm run docs:preview`

No test or lint commands are configured.

## Architecture

### Theme source: `docs/.vitepress/theme/`

- `index.ts` — Theme entry point. Registers Pinia, configures analytics plugins (Matomo/Google).
- `Layout.vue` — Root layout component, handles routing to HomePage/PostPage/NotFound.
- `global.ts` — Pinia store (`useThemeGlobalStore`) for shared state.
- `types.ts` — TypeScript interfaces: `Post` (article data) and `AkariThemeConfig` (theme configuration).
- `translations.ts` — i18n strings for `en-US` and `zh-CN`.
- `components/` — Vue components: `HomePage`, `PostPage`, `PostCard`, `Footer`, `NavList`, `SearchDialog`, `ClickToTop`, `SiteNotice`, `NotFound`.

### Configuration: `docs/.vitepress/config.ts`

Single file containing both VitePress site config and `AkariThemeConfig`. Theme config is spread into `themeConfig`. MDUI custom elements are registered via `vue.template.compilerOptions.isCustomElement`.

### Build tools: `tools/`

- `content-fixer.mjs` — Pre-build script that auto-fills missing frontmatter fields (`color`, `color_dark`, `date`, `description`) by extracting colors from cover images using `@napi-rs/canvas`.
- `new-post.js` — Scaffolds new markdown posts.
- `image-utils.ts` / `color-picker.mjs` — Color extraction utilities.

### Content: `docs/*.md`

Markdown files with frontmatter fields: `title`, `layout`, `description`, `cover_image`, `cover_image_dark`, `color`, `color_dark`, `date`, `cc_license`, `categorys`.

### Path alias

`@theme/*` maps to `docs/.vitepress/theme/*` (configured in `docs/.vitepress/tsconfig.json`).

## Key Conventions

- MDUI components are used as custom HTML elements (`<mdui-*>`) throughout Vue templates.
- Dark/light mode is time-based (6AM–6PM = light) with manual toggle.
- Theme colors are randomly selected from `defaultColorsSet` in config.
- The `content-fixer.mjs` script handles color extraction and description generation at build time — these frontmatter fields don't need to be set manually.
- VitePress `appearance` is set to `false`; the theme manages its own dark mode.

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) deploys on push to `master` branch via SSH using Node.js 20.
