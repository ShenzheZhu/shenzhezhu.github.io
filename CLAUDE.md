# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal academic website for Shenzhe (Cho) Zhu. Vanilla HTML/CSS/JS — no build tools, no package manager, no framework.

## Development

Serve locally with a static HTTP server (required for `fetch("pages/...")` to work):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. There are no automated tests; validate changes manually in a browser.

**Manual checks after any change:**
- Hash navigation between sections (`#about`, `#publications`, `#misc`)
- Mobile header/menu toggle and sidebar close-on-nav
- Homepage gallery autoplay, looping, and captions
- Publication tabs (`Selected` / `All`), year grouping, and lightbox
- Image/PDF links and responsive layout at desktop and mobile widths

## Architecture

`index.html` is the SPA shell — it never reloads. `script.js` drives all behavior: hash-based routing, page fetching, gallery, pub filtering, lightbox, mobile menu, and scroll-reveal. `style.css` contains all layout, typography, and responsive rules.

**Navigation flow:** URL hash → `hashchange` or nav click → `loadPage(page)` → `fetch("pages/<page>.html")` → inject into `<main id="content">`. On `publications` load, `groupPublicationsByYear()` and `initPubTabs()` run. On `home` load, `initGallery()` runs.

**Page fragments** live in `pages/` (`home.html`, `about.html`, `publications.html`, `misc.html`). These are bare HTML snippets — no `<html>`/`<head>`/`<body>` wrappers.

**Assets:**
- `asset/gallery/` — homepage slideshow images (referenced by `<div class="gallery-slide" data-caption="...">`)
- `asset/paper_fig/` — publication figures (referenced by `.pub-image` elements)
- `asset/fonts/` — local font files

**Publication entries** use `data-year` and `data-selected="true"` attributes on `.publication` elements. `groupPublicationsByYear()` reorganizes them into `.year-section` wrappers at runtime; `initPubTabs()` filters by `data-selected`.

## Coding Conventions

- 2-space indentation in HTML, CSS, and JS
- CSS classes: `kebab-case` (e.g., `mobile-header-name`, `gallery-track`)
- JS identifiers: `camelCase` (e.g., `loadPage`, `initGallery`)
- New assets: short lowercase filenames in the matching `asset/` subdirectory

## Design System

**Theme:** Dark mode default (`#191817` warm ink black). Light mode available. Muted Bronze (`#C5A585`) is the sole accent — use sparingly.

**Typography:** Georgia for headings (scholarly warmth), Helvetica Neue for body. Archivo Narrow and Space Mono loaded via Google Fonts.

**Aesthetic direction:** Editorial minimalism — SSENSE-style high contrast, generous whitespace, restrained color. Avoid Bootstrap-like defaults, decorative flourishes, or gratuitous animation.

**Principles:**
1. Remove before adding — every element must justify its presence
2. Let typography, spacing, and hierarchy do the work
3. Dark palette should feel warm (warm blacks, not cold grays)

## Commit Style

Short, lowercase imperative subjects scoped to one visible change, e.g.:
```
make gallery loop seamless by cloning first slide
```
