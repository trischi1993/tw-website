# upgreight Astro starter

A lean, production-ready Astro starter with optional Sanity CMS and a verified
live-preview setup. Clone this for a new client site instead of rebuilding the
plumbing each time.

## What is fixed vs. per project

Two layers. The starter ships layer 1 fully wired; you build layer 2 per client.

- **Plumbing (fixed, do not rebuild):** the two-build static/preview split, the
  Sanity live preview (Presentation + visual editing), middleware, draft-mode
  endpoints, the dormant-Sanity seam, the SEO baseline, the sitemap. Verified to
  work end to end.
- **Content + design (per project):** the schema, the section content, the
  styling, and the copy. The starter is **bilingual (DE/EN) by default** (see
  i18n); reduce to one language or add a third per project. Built per client with
  the `upgreight-astro-website` skill as the architect.

## Quickstart (new project)

```bash
cp -R template-astro my-client && cd my-client
node scripts/init.mjs --name my-client --domain https://www.myclient.com
npm install
npm run dev            # runs on the built-in seed, no Sanity required
```

`scripts/init.mjs` replaces the starter placeholders (project name, domain,
preview-Worker name, studio name) **and resets git to a single fresh commit on
`main`**, so the client repo never carries the template's (or another client's)
history — works whether you duplicated via Finder or `cp -R`. Pass `--keep-git`
to skip the reset; run inside the `template-astro` folder itself and the reset is
auto-skipped. It does NOT touch Sanity ids or tokens. Those live in `.env` (see
below), never in the repo.

## Sanity is dormant by default

The site runs entirely on local seed content (`src/lib/content/`) until you set
`PUBLIC_SANITY_PROJECT_ID`. Then the same getters route to Sanity with zero page
or component changes. To connect the CMS: copy `.env.example` to `.env`, fill it,
rebuild. Full client-facing guide: `studio/README.md`.

Content model: `siteSettings` and `homePage` (one fixed document **per language**:
`-de` / `-en`), `page` (composed of sections; bilingual via the
`@sanity/document-internationalization` plugin), and ONE neutral section type
(`sectionText`) — the design's sections are built per project. Keep schema field
names == `src/lib/sanity.ts` GROQ (filtered by `language == $lang`) == resolved
types in sync; that is the one thing that breaks the dormant-Sanity switch. The
deterministic bilingual seed lives in `studio/seed.ndjson` (regenerate with
`npm run seed:build` in `studio/`).

## Live preview (Live-Islands)

Two builds, one codebase. Production stays byte-identical and preview-free.

| | Config | Output | Where |
|---|---|---|---|
| Production | `astro.config.mjs` | `static` | Assets-only Worker (`wrangler.prod.jsonc`) |
| Preview | `astro.config.preview.mjs` | `server` + cloudflare adapter | SSR Worker (`wrangler.jsonc`) |

```bash
npm run dev:preview      # local SSR preview on the seed (port 4321)
npm run build:preview    # build the preview Worker (sets PREVIEW_DEPLOY=1)
```

**Sections are React (.tsx), rendered statically in production.** In the
preview build, the same components hydrate as a live island once the Studio's
draft-mode cookie is set (`src/preview/SectionsHost.astro` via the
`#sections-host` seam in package.json "imports"): typing in the Studio streams
into the iframe per keystroke (`usePresentationQuery` over comlink, no server
round-trip), overlay mutations (drag-reorder, duplicate, delete) apply
optimistically, and click-to-edit works through explicit `data-sanity`
attributes (`createDataAttribute`, stega stays off). The one-line
perspective-race patch in `patches/` is what makes per-keystroke updates work —
see `patches/README.md` before bumping `@sanity/visual-editing`. The house rule
is "no React in the PROD output": a build hook prunes the unused React client
chunk Astro emits, so production ships zero React JS (verified per build).

Why the rest is built this way (history adapter, imageService passthrough,
preview API version, perspective-cookie split, frame-ancestors, the Astro 7
gotchas): see the skill at
`.claude/skills/upgreight-astro-website/references/sanity.md` and
`docs/sanity-live-editing-architecture.md`. Do not change the plumbing without
reading them; each piece fixes a specific failure.

Always smoke-test the built Worker on workerd (`wrangler dev`) before deploying.

## Deploy (Cloudflare Workers)

Two Workers per project, both fed from **this one repo** via **Workers Builds**
(Cloudflare's "connect repo → build & deploy on push", the successor to the old
Pages Git integration). They differ only in build command and Wrangler config:

| Worker | Build command | Wrangler config | Serves |
|---|---|---|---|
| `<slug>-prod` | `npm run build` | `wrangler.prod.jsonc` | static `dist/`, published-only, **no token** |
| `<slug>-preview` | `npm run build:preview` | `wrangler.jsonc` (adapter output) | SSR, drafts behind the `preview-url-secret` cookie |

Production is an **assets-only Worker** — no `main`, no adapter, no server code:
it just serves the files `npm run build` produces. (`main` in a Wrangler config
is the Worker's *entry script*, unrelated to the Git branch `main`.) We moved off
Cloudflare **Pages** because Pages is frozen and the Astro Cloudflare adapter
dropped Pages support in v13; the static output is unchanged, only the host in
front of it. Static requests stay free and unlimited, same as Pages.

**One-time wiring (per Cloudflare account, in the dashboard):**
1. Install the Cloudflare GitHub App once, grant it this repo.
2. Create two Workers Builds connections on the same repo/branch:
   - prod → build `npm run build`, deploy `npx wrangler deploy -c wrangler.prod.jsonc`
   - preview → build `npm run build:preview`, deploy `npx wrangler deploy`, build var `PREVIEW_DEPLOY=1` + `PUBLIC_SANITY_PROJECT_ID`, and the read token as a **secret** (`SANITY_API_READ_TOKEN`). Never on prod.
3. Point `kunde.de` at the prod Worker (custom domain) and
   `kunde.preview.upgreight.dev` at the preview Worker.

**Publish flow:** a Sanity webhook (publish event) hits the **prod** Workers
Builds *Deploy Hook* URL → prod rebuilds in a few minutes. Editors see their
change in the preview instantly (live island); prod follows on publish. Anonymous
visitors of the preview URL only ever see published content.

`scripts/provision.mjs` (`npm run provision`) automates the scriptable parts of
this and prints the manual/dashboard steps with confirm gates — see its
`--help`. The three existing client projects stay on their current setup; this
topology is for the template and new projects only.

## SEO

The baseline lives in the Astro layer and is fixed for every project: `SEO.astro`
(title, description, canonical, OG, Twitter, all derived from `site`), the sitemap
integration, and `robots.txt`. Per-page SEO content flows from Sanity/seed. Set
`site` to the real domain (init does this) or canonicals, sitemap, and OG ship
wrong.

Defaults that are always present: a `Title | Marke`-suffix (the home page, whose
title equals the brand, stays unsuffixed), an `Organization` JSON-LD on every page
(`name`/`url`/`logo`, plus `sameAs` once `siteSettings.social` has real profiles),
and a fallback share image at `public/og-default.png` (1200×630) so no page is
image-less. **Replace `public/og-default.png` with the client's real share image
per project.**

## i18n (bilingual by default)

The starter ships **bilingual: German default at `/`, English at `/en/`**
(`prefixDefaultLocale: false`). i18n is the one thing that's expensive to retrofit,
so it's wired in; reducing to a single language is the cheap direction (below).

- `src/lib/i18n.ts` is the single source of truth: `LOCALES`, localized paths, UI
  strings, the home `alternates`. hreflang + the language switcher derive from it
  and only ever reference real translations (never a guessed URL).
- Content is per language: `getHome(locale)`, `getSiteSettings(locale)`, …; the
  seed and Sanity both return one document per language.
- Sanity = document-level i18n: singletons (`homePage`, `siteSettings`) use fixed
  IDs `-de`/`-en` with a hidden `language` field; free `page` docs use the
  `@sanity/document-internationalization` plugin (a "Translations" menu + a
  `translation.metadata` doc per page). The deterministic seed
  (`studio/seed.ndjson`) is asset-free, so the import stays reproducible.

### Add a third language (e.g. Italian)

Scales to N languages from one list — no rearchitecting:

1. `src/lib/i18n.ts`: add `'it'` to `LOCALES`, plus its `LOCALE_LABELS`,
   `LOCALE_NAMES`, `OG_LOCALE`, `HTML_LANG`, and a `UI.it` block.
2. `astro.config.mjs` + `astro.config.preview.mjs`: add `it` to `i18n.locales`
   (and the sitemap `i18n.locales`).
3. `studio/schemas/objects/language.ts`: add `{ id: 'it', title: 'Italiano' }` to
   `LANGUAGES` (feeds both the plugin and the singleton structure).
4. `studio/structure.ts`: add the Italian singleton items (`homePage-it`,
   `siteSettings-it`); add the `/it/` routes in `studio/resolve.ts` +
   `components/PagesNavigator.tsx`.
5. Author the Italian content (`seed.ts` + `studio/scripts/make-seed.mjs` →
   `npm run seed:build`) and add `src/pages/it/index.astro` (mirror `en/`).

The pages loop, hreflang, switcher and the plugin already handle any number of
languages.

### Reduce to a single language

The cheap direction — mechanical removal:

1. Delete `src/pages/en/` and remove the `i18n` blocks from both astro configs
   (and the sitemap `i18n` option).
2. `src/lib/content/`: drop the `Record<Locale, …>` wrapping in `seed.ts` and the
   `locale` params in `index.ts`/`sanity.ts` (return a single language).
3. Remove `LanguageSwitcher.astro`, the `alternates`/hreflang in `SEO.astro`, and
   the `locale`/`alternates` props threaded through `BaseLayout`/`Header`/`Footer`.
4. Studio: drop the `documentInternationalization` plugin + the `language` fields,
   and collapse the per-language singletons/structure to one each.
5. Simplify the seed to one language.

Nothing here is load-bearing for the preview plumbing, so removal is low-risk.

## Versions

Pinned via the committed `package-lock.json` so every clone is identical and
builds. The coupled set (`astro`, `@astrojs/cloudflare`, `@astrojs/react`,
`@sanity/visual-editing`, `@sanity/client`) must move together, and all
`@sanity/*` packages are pinned EXACTLY (no `^`) while `patches/` carries fixes
against them — check `patches/README.md` before any bump. Update the TEMPLATE
deliberately, run the smoke-tests, then make it the new baseline. Do not update per clone, and do not
"check for new versions before copying"; that reintroduces drift. One drift source
to watch: the deployed Studio auto-updates its runtime, so if Presentation breaks
after a Sanity-side bump, check the console for "Package version mismatch detected"
and bump `@sanity/visual-editing` to match.

## Structure

```
astro.config.mjs            static production build
astro.config.preview.mjs    preview Worker build (SSR)
wrangler.prod.jsonc         production Worker config (assets-only)
wrangler.jsonc              preview Worker config (SSR adapter)
src/
  lib/content/             seed + getters (the dormant-Sanity seam)
  lib/content/sections.ts  sections projection + mapper (browser-safe contract)
  lib/sanity.ts            GROQ + mappers (the schema contract)
  preview/                 live island (SectionsIsland) + draft-mode endpoints
  components/sections/     React sections + static host (the #sections-host seam)
  components/SEO.astro     SEO head
  components/ContactForm.astro  optional, no-JS contact form (set action + CSP)
  lib/safe-href.ts         href scheme allowlist (XSS guard for CMS links)
  lib/preview-session.ts   signed preview-session cookie (gates draft mode)
  pages/robots.txt.ts      robots.txt endpoint (Sitemap URL from `site`)
  middleware.ts            preview-only draft context + frame-ancestors + noindex
shared/                    code shared between app + Studio (editor actions/blocks)
studio/                    Sanity Studio (schemas, structure, Presentation)
patches/                   patch-package fixes (see patches/README.md)
scripts/init.mjs           per-project placeholder setup (offline)
scripts/provision.mjs      Sanity + Cloudflare provisioning (npm run provision)
```
