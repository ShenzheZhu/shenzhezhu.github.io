# Repository Guidelines

## Project Structure & Module Organization
`index.html` is the single entry point and SPA shell. `script.js` handles hash-based navigation, page loading, the home gallery, publication filtering, and the image lightbox. `style.css` contains the global layout, typography, and responsive rules.

Store page content as HTML fragments in `pages/` (`home.html`, `about.html`, `publications.html`, `misc.html`). Put static assets in `asset/`: use `asset/gallery/` for the homepage slideshow, `asset/paper_fig/` for publication figures, and `asset/fonts/` for local font files.

## Build, Test, and Development Commands
There is no build step or package manager in this repository. Serve the site locally with a static HTTP server so `fetch("pages/...")` works:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Use `git diff --stat` or `git diff` to review visual/content edits before committing.

## Coding Style & Naming Conventions
Follow the existing 2-space indentation in HTML, CSS, and JavaScript. Keep page files in `pages/` fragment-only; do not add full document wrappers there. Prefer semantic HTML and small, direct vanilla JS functions over new abstractions or dependencies.

Use `kebab-case` for CSS classes such as `mobile-header-name` and `gallery-track`. Use `camelCase` for JavaScript identifiers such as `loadPage` and `initGallery`. For new assets, prefer short, descriptive lowercase filenames and place them in the matching `asset/` subdirectory.

## Testing Guidelines
No automated tests are configured. Validate changes manually in a browser while running the local server. Always check:

- hash navigation between sections
- mobile header/menu behavior
- homepage gallery autoplay and captions
- publication tabs, year grouping, and lightbox behavior
- image/PDF links and responsive layout in desktop and mobile widths

## Commit & Pull Request Guidelines
Recent commits use short, lowercase imperative subjects such as `make gallery loop seamless by cloning first slide`. Keep commits focused on one visible change and write subjects in that style.

Pull requests should include a brief summary, screenshots or a short recording for UI changes, and manual test notes listing the pages and behaviors you checked. Link any related issue or content request in the PR description.
