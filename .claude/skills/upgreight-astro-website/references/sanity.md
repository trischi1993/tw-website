# Sanity CMS

> **Stand-Hinweis (aktualisiert 2026-07-11):** Das Template ist auf **Live-Islands**
> umgebaut und der Umbau ist ABGESCHLOSSEN (Phasen A–D). Ist-Architektur:
> Sections als React/.tsx, ms-Live-Updates via `usePresentationQuery`,
> Click-to-edit über `createDataAttribute` statt stega, Overlay in der Island.
> Hausregel ist **„kein React im Prod-Output"** (Build-Assert) — NICHT mehr „kein
> React im Projekt". Der Abschnitt **„Live preview / Visual editing (the verified
> Astro 7 recipe)"** weiter unten beschreibt den **abgelösten** Vanilla-
> `enableVisualEditing()`-Weg und ist nur noch als Hintergrund/Fallback gültig.
> **Verbindlich sind: der Code + `docs/sanity-live-editing-architecture.md` +
> `docs/umbau-plan.md` (Protokoll).** Für ein neues Projekt wird das Template
> ohnehin geklont (das gesamte Live-Editing ist vorverdrahtet), nicht per Hand
> nachgebaut.

Read this **only if the project actually needs client-editable or frequently-changing content** (see `references/architecture.md`). If a developer maintains the content, use content collections instead - don't reach for Sanity.

The mandate here is different from a typical dev integration: the schema is a **product for a non-technical client**. They will live in this Studio. So optimize for *their* clarity and safety, not for technical elegance. A schema that's clever but confusing, or that lets the client break the live site, has failed even if the code is clean.

## Contents
- [Build offline-first, connect later](#build-offline-first-connect-later)
- [Setup](#setup)
- [The Astro side: client, GROQ, images](#the-astro-side-client-groq-images)
- [Drafts must not leak](#drafts-must-not-leak)
- [Live preview / Visual editing (the verified Astro 7 recipe)](#live-preview--visual-editing-the-verified-astro-7-recipe)
- [Client-friendly schema principles](#client-friendly-schema-principles)
- [A clean schema example](#a-clean-schema-example)
- [Custom sections - only when needed](#custom-sections--only-when-needed)
- [Localization with Sanity](#localization-with-sanity)

---

## Build offline-first, connect later

Even when Sanity is required, **don't build the studio first.** Ship the site running on **local seed content** shaped exactly like Sanity will return, get the design signed off, then add the studio against the *final* sections and load *real* content. This avoids rebuilding schemas every time a section changes, and keeps the heavy CMS work out of the initial context budget.

The seam that makes it clean: a small content layer with **identical async getters** over a swappable source.

- `src/lib/content/` - typed shapes (`types.ts`), the local seed (`seed.ts`), and getters (`index.ts`) like `getHome()` / `getPageBySlug()`. Today they return seed; one switch routes them to GROQ later.
- Normalize images to one **`SiteImage`** type - `local` (an `astro:assets` `ImageMetadata`, optimized at build) or `remote` (a Sanity CDN URL) - so components don't care about the source.
- Pick the source from an env var: `const SOURCE = import.meta.env.PUBLIC_SANITY_PROJECT_ID ? 'sanity' : 'seed'`. No project id → the whole site builds and runs offline.
- Keep **schema field names == GROQ projection == resolved types.** Drift there is the one thing that breaks the later switch - so author the GROQ + mappers (`src/lib/sanity.ts`) as the contract the studio schema must match.

Connecting Sanity is then: create the project, set `PUBLIC_SANITY_*`, import/enter real content, add a deploy-hook webhook (publish → rebuild). Nothing in the pages or components changes.

## Setup

```bash
npm install @sanity/client @sanity/image-url
# Studio: a separate `sanity/` (or `studio/`) folder via `sanity init`.
# Do NOT use @sanity/astro: it caps at Astro 6 and was rejected for this stack.
# For live preview / visual editing wire it manually (see the section below) or
# clone the upgreight Astro starter, which ships the plumbing pre-wired.
```

Env vars (never hardcode):
```
PUBLIC_SANITY_PROJECT_ID=...
PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=...      # server-side only, for drafts/preview - never PUBLIC_
```

Studio choice: a **standalone Studio** (its own deploy, e.g. `studio.clientdomain.com` or Sanity-hosted) keeps the editing surface cleanly separated and is the simplest to hand to a client. For live preview / visual editing do NOT reach for `@sanity/astro` (Astro 6 ceiling, rejected): keep the standalone Studio and add a separate, manually-wired preview build (see "Live preview / Visual editing" below), or start from the upgreight Astro starter where it is already wired.

## The Astro side: client, GROQ, images

```ts
// src/lib/sanity.ts
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanity = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2024-10-01',   // published/production client; the PREVIEW client differs (note below)
  useCdn: true,               // published content via CDN; see drafts note below
  perspective: 'published',   // only published docs by default - critical
});

const builder = imageUrlBuilder(sanity);
export const urlFor = (source: any) => builder.image(source);
```

The `apiVersion` above is for the **published/production** client (and the static build). The **preview** client is a different instance and MUST use `apiVersion >= '2025-02-19'`: the current Studio sends stacked perspectives (e.g. `drafts,published`) that older versions reject with HTTP 400. Keep the two separate so the production build stays byte-identical. See "Live preview / Visual editing" below.

Fetch with typed GROQ queries, projecting **only the fields you render** (smaller payloads, clearer intent):

```ts
const posts = await sanity.fetch(
  `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
    title, "slug": slug.current, excerpt, publishedAt, mainImage
  }`
);
```

For a static build, fetch at build time in the page frontmatter / `getStaticPaths`. The site rebuilds on publish (set a Sanity webhook → host deploy hook) so static + CMS still gives the client "edit and see it live."

Images: always go through `urlFor(image).width(...).height(...).auto('format').url()` so you get sized, modern-format images. **Require `alt` text in the image schema** (see below) so CMS images don't ship without it - the preflight script will flag any that do.

## Drafts must not leak

A draft leaking onto the production site (or into the sitemap) is the classic Sanity-on-a-public-site failure. Guard it:

- Production fetches use **`perspective: 'published'`** (and/or `useCdn: true`, which only serves published content). Never ship the read token to the client bundle - it must stay server-side.
- Only query documents that are real and ready: `defined(slug.current)`, and a publish gate if you use one (e.g. `publishedAt <= now()`).
- Preview/draft viewing, if the client wants it, is an **SSR-only** path on a separate preview build (its own Worker), using the read token, never part of the static public output. Do NOT hardcode `perspective: 'previewDrafts'`: the current Studio drives the perspective through a cookie (`perspectiveCookieName` from `@sanity/preview-url-secret`). A single value stays a string (`'drafts'`); a comma-joined stack (`'drafts,published'`) must be split into a `string[]` for the client. See "Live preview / Visual editing" below.
- After build, the preflight script checks nothing `noindex`/draft slipped into the sitemap, but the real fix is fetching published-only in the first place.

## Live preview / Visual editing (the verified Astro 7 recipe)

> **⚠️ ABGELÖST (historisch).** Dieser Abschnitt beschreibt den ursprünglichen
> **Vanilla-`enableVisualEditing()`**-Weg (kein React, reload-basiert). Das
> Template nutzt inzwischen **React Live-Islands mit `usePresentationQuery`**
> (ms-Updates, kein Reload) — siehe Stand-Hinweis oben + Code
> (`src/preview/*`, `src/components/sections/*.tsx`) +
> `docs/sanity-live-editing-architecture.md`. Der Text hier bleibt als
> Hintergrund/Fallback erhalten, ist aber NICHT die aktuelle Bauanleitung. Für
> ein neues Projekt: Template klonen (alles vorverdrahtet), nicht nachbauen.

> Source of truth: the `astro7-sanity-visual-editing` memory (verified on an Astro 7 + Sanity + Cloudflare build). This section explains how the plumbing works and what to change. The upgreight Astro starter already ships all of it pre-wired, so on a real project clone the starter and adjust the few project-specific bits below, do not hand-build it from scratch.

**Do NOT use `@sanity/astro`.** It caps at Astro 6 (peer `^2..^6`) and was rejected for this stack. Wire visual editing manually with the packages below.

**Staging.** Stage 2 is the default: live preview of drafts plus reload-on-edit, NO stega. Stage 3 (stega / click-to-edit) is OPTIONAL and usually shelved. Prefer a Presentation page-switcher (a `presentationTool` `components.unstable_navigator`) over click-to-edit. The preferred UX is form-right / preview-left, not in-page click-to-edit.

**Packages** (no React, NOT `@sanity/astro`):
- `@sanity/visual-editing` (vanilla `enableVisualEditing()`)
- `@sanity/preview-url-secret` (`validatePreviewUrl`, `perspectiveCookieName`)
- `@sanity/client` (already present)
- Studio side: `presentationTool` from `sanity/presentation` with `defineDocuments` / `defineLocations`.

**1. The `history` adapter is the single most important detail.** `enableVisualEditing()` MUST receive a `history` adapter. Source-confirmed in `@sanity/visual-editing@5`: the overlay reports the iframe URL to Presentation only inside `if (history) history.subscribe(...)`. Pass only `{ refresh }` and the URL is NEVER reported, so Presentation shows "No matching documents", the URL bar sticks on `/api/draft-mode/enable`, and nothing resolves or edits (even though drafts and images render fine). Astro is an MPA (full page loads), so the adapter does real navigation:

```ts
// preview-only overlay (e.g. src/preview/PreviewExtras.astro), inside a <script>
import { enableVisualEditing } from '@sanity/visual-editing';
const path = () => `${location.pathname}${location.search}`;

const disable = enableVisualEditing({
  history: {
    subscribe: (navigate) => {
      navigate({ type: 'push', url: path() });            // report current location on load
      const report = () => navigate({ type: 'push', url: path() });
      window.addEventListener('popstate', report);        // and on back/forward
      return () => window.removeEventListener('popstate', report);
    },
    update: (u) => {
      if (u.type === 'pop') window.history.back();
      else if (u.url !== path()) window.location.href = u.url; // guard avoids a reload loop
    },
  },
  refresh: (payload) => {                                  // reload-on-edit
    if (payload.source === 'mutation') { window.location.reload(); return new Promise(() => {}); }
    return false;
  },
});
window.addEventListener('beforeunload', () => disable());
```

**2. Version coupling: match the `@sanity/visual-editing` major to the deployed Studio's comlink major.** v5 pairs with `@sanity/comlink`^4 + `presentation-comlink`^2; v2 pairs with comlink^3 + presentation-comlink^1. The DEPLOYED Studio runs the auto-updated runtime (`autoUpdates: true` in `sanity.cli.ts`), NOT the locally-installed `sanity`. So a local `sanity` 3.99 (comlink 3) can still face a deployed runtime v4 (comlink 4), which is why visual-editing v5 is the correct preview pairing there. A mismatch silently breaks the handshake (same symptoms as a missing history adapter); v5 logs `Package version mismatch detected` to the console when it disagrees with the Studio. Do NOT downgrade visual-editing to match an old local studio: v2.x pulls React + framer-motion and breaks the no-React Astro build. `enableVisualEditing` is React-free in v5.

**3. Two-build model, production stays byte-identical.** Verify with a `dist` checksum before and after wiring preview.
- Production `astro.config.mjs`: `output: 'static'`, no adapter. UNTOUCHED. (Served by an assets-only Cloudflare Worker - `wrangler.prod.jsonc`, no `main` - NOT Pages; see architecture.md "Deployment per host".)
- A SEPARATE `astro.config.preview.mjs`: `output: 'server'` + `@astrojs/cloudflare` v14, building a Cloudflare **Worker** (v14 is Workers-only, no longer Pages-SSR). Run with `astro build/dev --config astro.config.preview.mjs`.
- Three isolation gates keep all preview code out of prod:
  - **(a) `#preview-extras` subpath import.** In `package.json` the `imports` map points `#preview-extras` at a no-op component (`./src/components/PreviewExtras.astro`); the preview config's `vite.resolve.alias` re-points `#preview-extras` to the real overlay (`./src/preview/PreviewExtras.astro`). The layout always imports `#preview-extras`, so only the preview build gets the live overlay; prod gets the no-op.
  - **(b) `vite.define` gate.** The preview config sets `'import.meta.env.SANITY_PREVIEW': JSON.stringify(true)`, so the middleware (`const IS_PREVIEW = import.meta.env.SANITY_PREVIEW === true; if (!IS_PREVIEW) return next();`) short-circuits to dead code in prod.
  - **(c) draft-mode endpoints via `injectRoute`.** `/api/draft-mode/enable` + `/disable` are added by `injectRoute` in the preview config only, so they exist only in the preview build.
- Load the adapter only for the deploy build, behind a `PREVIEW_DEPLOY`-gated dynamic import:
  ```js
  const adapter = process.env.PREVIEW_DEPLOY
    ? (await import('@astrojs/cloudflare')).default({ imageService: 'passthrough' })
    : undefined;
  ```
  Local `dev:preview` then runs adapter-free Node SSR and boots on any Node 22.

**4. The adapter MUST use `imageService: 'passthrough'`.** `default({ imageService: 'passthrough' })`. The adapter's default `imageService` is `cloudflare-binding`, which routes Astro's `<Image>` / `/_image` through a Cloudflare **Images binding** (`IMAGES`) that is not bound, so every `/_image` request 500s on the deployed Worker (images and the local logo go blank). `passthrough` keeps the `/_image` endpoint but streams the original bytes (no Sharp, no binding); fine because the Sanity CDN already applies `?w=&q=80&auto=format` in `resolveImage`. Trade-off: passthrough ignores width, so a local logo serves full-res in preview, acceptable for a preview. Node-SSR `dev:preview` hides this (no adapter, Sharp present), which is exactly why you smoke-test the built Worker (point 8).

**5. Preview Sanity client: bump the API version AND split the perspective cookie.** In the preview branch of your client selector set `apiVersion: '2025-02-19'` (or newer) AND turn the comma perspective cookie into a `string[]`. The current Studio (client 7.x) sends stacked perspectives via the cookie (`drafts,published`, `<release>,drafts`); API `2024-10-01` rejects those with HTTP 400 `"Complex perspectives are not supported for this version"`, the preview client throws, and the Worker 500s. Simple `drafts` / `published` still work, so it looks intermittent.

```ts
const PREVIEW_API_VERSION = '2025-02-19';

// single value stays a string ('drafts'); a comma stack becomes a string[]
function toPerspective(value: string): string | string[] {
  const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : (parts[0] ?? 'drafts');
}

// only when a preview context exists (the middleware set it); else return the
// published CDN client untouched, so the static build is unaffected.
return sanity.withConfig({
  useCdn: false,
  apiVersion: PREVIEW_API_VERSION,
  perspective: toPerspective(ctx.perspective) as any,
  ...(ctx.token ? { token: ctx.token } : {}),
});
```

The production published client keeps its own `apiVersion` so the static build stays byte-identical.

**6. The Worker's `frame-ancestors` must allow the Studio + Sanity dashboard hosts.** The preview middleware sets the CSP on every response; otherwise Presentation cannot iframe the preview. Use:
```
Content-Security-Policy: frame-ancestors 'self' https://*.sanity.studio https://sanity.io https://*.sanity.io http://localhost:3333
```
This is preview-only. Production keeps the strict `frame-ancestors 'self'` from the go-live checklist (SEC-06 / SEC-07).

**7. Astro 7 gotchas (each cost real time):**
- `astro dev` is now a daemon: logs go to `astro dev logs`, stop with `astro dev stop`; stdout only shows "running at...". Stale daemons serve old config.
- `Astro.locals.runtime.env` was REMOVED in v6 and THROWS on access. Read runtime env (token, studio URL) via `import('cloudflare:workers').env` with a variable specifier + `/* @vite-ignore */` (so Vite skips it in the Node build) and a `process.env` fallback for local dev.
- The Worker build needs Node **>= 22.15** (uses `module.registerHooks`); use Node 24. Leave production Cloudflare's NODE_VERSION as-is.
- `wrangler.jsonc` for the adapter OMITS `main` / `assets` (the adapter emits `dist/server/wrangler.json` with them; a `main` pointing at not-yet-built output fails the build). Keep only name + `compatibility_date` + `compatibility_flags: ["nodejs_compat"]`.
- Preview `trailingSlash: 'ignore'` (prod is `'always'`) so the Studio's call to `/api/draft-mode/enable` (no slash) is not 404'd, and iframe navigation works with or without a slash.

**8. Always smoke-test the built Worker on workerd (`wrangler dev`) BEFORE deploying.** That is what catches the `locals.runtime.env` throw (500 on every request) and the `/_image` 500: Node-SSR `dev:preview` hides both because it has no adapter and has Sharp.

**Studio side.** `presentationTool({ resolve, components: { unstable_navigator: { component: PagesNavigator } }, previewUrl: { initial: <worker-url>, previewMode: { enable: '/api/draft-mode/enable', disable: '/api/draft-mode/disable' } } })`. `resolve` is `defineDocuments` (route -> document filter, so clicking a preview page opens the right doc) plus `defineLocations` (the "used on these pages" panel). The page-switcher (`unstable_navigator`) is a small React component living in the Studio that lists every editable page and calls `usePresentationNavigate()` on click, so the editor jumps between pages without hunting through in-page links.

## Client-friendly schema principles

The schema *is* the client's editing UX. Apply these:

- **Plain-language titles + `description` on every field.** "Hero heading - the big text at the top of the home page" beats a bare `heading`. The client should never have to guess what a field does or where it appears.
- **Validation that prevents broken pages**, not just nags: `.required()` on anything the layout needs, `.max()` on titles/meta-descriptions so SEO fields stay in range, required `alt` on images, sensible string/number bounds.
- **Group and order fields** (`groups` / `fieldsets`, `options.collapsible`) so long documents stay navigable - e.g. "Content", "SEO", "Settings".
- **Real previews:** set `preview` with `title`/`subtitle`/`media` so list views show recognizable items, not "Untitled".
- **Hide technical noise.** Don't expose raw slugs to edit freely if they shouldn't change post-launch (or warn in the description that changing a slug changes the URL). No fields the client shouldn't touch.
- **Constrain rich text.** A wide-open Portable Text editor with every annotation invites broken markup. Enable only the styles/marks the design supports (e.g. normal/H2/H3, bold, link) and the specific custom blocks the project needs.
- **Singletons for one-off content.** Site settings, home page, contact info → singleton documents (one editable instance), not a creatable list the client could duplicate.
- **Don't over-model.** Resist building a generic page-builder unless the project truly needs editor-composed layouts. Concrete, named document types ("Offer", "Team Member") are easier and safer for the client than an abstract block soup.

## A clean schema example

```ts
// sanity/schemas/post.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'Shown as the page heading and the browser tab title.',
      type: 'string',
      group: 'content',
      validation: (R) => R.required().max(70),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      description: 'The web address. Changing this after launch changes the page URL - avoid if it already ranks.',
      type: 'slug',
      options: { source: 'title', maxLength: 80 },
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: { hotspot: true },
      group: 'content',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          description: 'Describes the image for screen readers and search engines. Required.',
          type: 'string',
          validation: (R) => R.required(),
        }),
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      description: 'Short summary used in listings and as the search/social description (~150 chars).',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (R) => R.max(160),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      of: [
        { type: 'block', styles: [{ title: 'Normal', value: 'normal' }, { title: 'Heading', value: 'h2' }, { title: 'Subheading', value: 'h3' }], lists: [{ title: 'Bullet', value: 'bullet' }] },
        // add custom blocks here ONLY if the design needs them (see next section)
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'content',
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'mainImage' },
  },
});
```

The shape is the same for every type: required fields validated, helpful descriptions, grouped, good preview, constrained rich text.

## Custom sections - only when needed

Some projects genuinely need the client to compose a page from reusable blocks (a flexible landing page). Then - and only then - model a small, **named, typed** set of section objects and an array field that accepts them:

```ts
// page.sections: an array of a few specific, well-described block types
of: [
  { type: 'heroSection' },
  { type: 'featureGridSection' },
  { type: 'ctaSection' },
]
```

Each section is its own `defineType` object with clear fields, descriptions, validation, and a `preview`. Render each with a dedicated Astro component matched by `_type`. Keep the set **small and concrete** - three to six real sections the design actually has, not a generic everything-builder. If the project is a fixed brochure site, skip this entirely and use named document types with fixed fields.

## Localization with Sanity

If the project is *both* multilingual and Sanity-driven, combine this with `references/i18n.md`:

- Use document-level translations (`@sanity/document-internationalization`): each document carries a `language`, and a translation-metadata document links the language versions.
- Query the linked translations to build the page's hreflang `alternates` and the language switcher - emit alternates **only** for the languages that document actually has. Same rule as always: real translations only.
- Each localized route still self-canonicalizes to its own localized URL.
