# Architecture decision guide

Deeper guidance for Step 2. The goal is always the same: the **simplest setup that satisfies the confirmed requirements**, nothing more.

## Contents
- [Static vs. content collections vs. Sanity](#static-vs-content-collections-vs-sanity)
- [Rendering: static vs. SSR](#rendering-static-vs-ssr)
- [Dependency policy](#dependency-policy)
- [Forms](#forms)
- [Redirects](#redirects)
- [Deployment per host](#deployment-per-host)
- [Project structure](#project-structure)

---

## Static vs. content collections vs. Sanity

The deciding question is **who maintains the content, and how often** - not how much content there is.

| Situation | Use | Why |
|---|---|---|
| Marketing/brochure site, copy is fixed or you (dev) update it on request | **Static** - copy in `.astro` | A CMS would be pure overhead; nobody logs in |
| A blog/list/portfolio that *you* maintain in the repo, handful–dozens of entries | **Content collections** (Markdown/MDX in `src/content/`) | Typed, versioned in git, zero runtime cost, no service to pay for |
| The **client** edits content themselves, or content changes often (news, offers, team, products, events) | **Astro + Sanity** | This is the only thing that justifies a hosted CMS |
| Mostly static, but one section is client-edited | **Static + Sanity for that one type** | Don't move the whole site into the CMS for one collection |

Content collections vs. Sanity is the line people get wrong. Collections are not a lesser CMS - for dev-maintained content they're *better*: type-safe, in version control, no API calls, no draft-leak risk, free. Reach for Sanity only when a non-technical person needs to edit without touching the repo.

**When torn between static and Sanity, choose static.** Adding Sanity to a static site later is an afternoon's work; removing an unused CMS, migrating its content back into the repo, and tearing down the studio is not. The cheap-to-correct direction is up.

**upgreight business default:** in practice most upgreight clients are sold on self-maintainability (Webflow-style editing), so a client-editable Sanity setup is the EXPECTED default for these projects, not the exception. Treat Sanity as on unless Julian explicitly says a given site will not be client-edited. This is a business default layered on top of the lean principles above; everything else still stays minimal.

## Rendering: static vs. SSR

Default **`output: 'static'`**. It's faster, cheaper, more reliable, and deployable to any static host. It's the right answer for the large majority of these sites.

Add an SSR adapter **only** when something needs the server at request time:

- Form handling via an Astro API route (instead of a third-party endpoint)
- Auth-gated or per-user/personalized content
- On-demand Sanity preview/visual editing for the client
- Genuinely real-time data on the page

If you do need it, prefer `output: 'static'` with **selected** routes marked `export const prerender = false`, or `output: 'server'` if most routes are dynamic. Add the adapter that matches the host (`@astrojs/netlify`, `@astrojs/vercel`, `@astrojs/cloudflare`). Don't add an adapter "to be safe" - an unused adapter changes the build and the deployment for no benefit.

## Dependency policy

Every dependency is a maintenance liability, a supply-chain surface, and weight in the bundle. Before `npm install`, ask: *would a few lines of my own code do this?* Usually yes.

- **Almost always:** `@astrojs/sitemap`.
- **Conditional, when chosen:** `@astrojs/tailwind`; `@sanity/client` + `@sanity/image-url` (Sanity); an SSR adapter (SSR); `@astrojs/mdx` (MDX content); `sharp` is already used by `astro:assets`.
- **Avoid by default:** UI/component libraries, CSS frameworks beyond Tailwind, state-management libraries, animation libraries (unless real motion is needed → GSAP skills), all-in-one "SEO" plugins (the baseline is ~30 lines you control), analytics/consent SDKs unless the client requires them (then add the lightest option).

A heavy `package.json` on a 5-page brochure site is a smell. Keep it short enough to read at a glance.

## Forms

Pick by where the site is hosted - the rendering mode decides the options.

| Host / mode | Recommended form handling |
|---|---|
| **Static, any host** | A third-party endpoint: Web3Forms, Formspree, or Basin. `<form action="https://...">`, POST, redirect to a `/thank-you/` page. No backend to run. |
| **Netlify (static)** | Netlify Forms (`data-netlify="true"` + hidden `form-name`), or a third-party endpoint. |
| **SSR (any adapter)** | An Astro API route (`src/pages/api/contact.ts`) that validates and forwards (email API / webhook). Full control, no third party. |

Whichever you choose: server-validate or provider-validate (never trust client-only), add a honeypot or captcha against spam, label every field (not just placeholders), show clear success/error states, and send the user to a real **`/thank-you/`** page (mark it `noindex`, and keep it out of the sitemap). The thank-you page is also your conversion-tracking anchor if the client runs ads.

## Redirects

Only create redirects that map a **real** old URL to a new one - almost always from a site migration/redesign. Never invent redirects for URLs that never existed.

- Get the old URL list (old sitemap, Search Console, server logs, a crawl of the live old site). For a redesign of a ranking site, preserving or redirecting every old URL is the single most important SEO task - a 404'd old URL drops its rankings.
- Prefer **301 (permanent)** for moved pages.
- Configure for the host:
  - **Astro built-in:** `redirects: { '/old': '/new' }` in `astro.config.mjs` (emits static redirect pages or adapter rules).
  - **Netlify:** `public/_redirects`.
  - **Vercel:** `vercel.json` `redirects`.
  - **Cloudflare:** `public/_redirects`.
- Verify each one after deploy (the preflight script checks internal links resolve, but it can't test live 301s - spot-check the important ones).

## Deployment per host

Static build → host-agnostic; deploy the `dist/` folder anywhere. Set `site` to the production domain regardless of host so SEO URLs are correct.

| Host | Static | SSR adapter | Redirects file |
|---|---|---|---|
| Any static host / S3 / nginx | ✅ deploy `dist/` | - | server config |
| Netlify | ✅ | `@astrojs/netlify` | `public/_redirects` |
| Vercel | ✅ | `@astrojs/vercel` | `vercel.json` |
| Cloudflare Workers (static assets) | ✅ assets-only Worker | `@astrojs/cloudflare` (only for SSR) | `public/_redirects` |

**Cloudflare note:** don't use Cloudflare **Pages** for new projects - it's frozen and the Astro Cloudflare adapter dropped Pages support in v13. Serve a static build from an **assets-only Worker** instead (a `wrangler.jsonc`/`.toml` with `assets.directory` and **no `main`** - `main` is the Worker's entry *script*, unrelated to the Git branch `main`). Auto-deploy on push is handled by **Workers Builds**, independent of that field.

**upgreight live-editing template** (the default starting point for client sites with an editable CMS): prod is that assets-only Worker (`wrangler.prod.jsonc`), preview is a separate SSR Worker (`wrangler.jsonc`) that serves Sanity drafts behind the `preview-url-secret` cookie. Both are wired by `scripts/provision.mjs` (`npm run provision`), which also creates the Sanity project, dataset, CORS, token, seed, backup and Studio deploy - see the template's `README.md` ("Deploy") and `docs/umbau-plan.md`. The three existing client sites (frinighof, vita, hasenegg) stay on their current Pages setup; this topology is for the template and new projects.

Confirm the production domain early - `site` must be the real domain (not a `*.workers.dev` preview) or canonicals, sitemap, and OG URLs ship wrong.

## Project structure

Grow this as needed - don't pre-create empty folders or speculative abstractions.

```
.
├── astro.config.mjs        # site, integrations, output, redirects
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro # html shell, <SEO/>, header/footer slots
│   ├── components/          # custom components per design (no section library)
│   ├── pages/               # routes (and [...slug].astro for CMS/collections)
│   ├── content/             # content collections + config.ts (only if used)
│   ├── lib/                 # sanity.ts, seo.ts helpers (only if needed)
│   └── styles/              # tokens.css / global.css (scoped-CSS approach)
├── public/                  # robots.txt, favicons, static assets, _redirects
└── sanity/                  # studio + schemas (only if Sanity is used)
```
