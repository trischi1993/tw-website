# SEO baseline - code and patterns

Copy-ready patterns for Step 4. Build this into the base layout once so every page inherits it. Adapt names to the project; keep the behaviour.

## Contents
- [The SEO component](#the-seo-component)
- [BaseLayout](#baselayout)
- [astro.config: site + sitemap](#astroconfig-site--sitemap)
- [robots.txt](#robotstxt)
- [Structured data (JSON-LD)](#structured-data-json-ld)
- [404 page](#404-page)
- [Trailing slash & clean URLs](#trailing-slash--clean-urls)
- [Open Graph images](#open-graph-images)
- [Preflight checklist](#preflight-checklist)

---

## The SEO component

One component, rendered in `<head>` by the base layout. It builds the canonical and absolute OG URLs from `Astro.site`, so they're always correct as long as `site` is set in the config.

```astro
---
// src/components/SEO.astro
interface Props {
  title: string;
  description: string;
  /** Page-specific OG image (absolute or site-relative). Falls back to default. */
  image?: string;
  /** Override canonical (e.g. for paginated pages). Defaults to the current URL. */
  canonical?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  /** hreflang alternates: [{ lang: 'en', url: 'https://.../en/about/' }, ...]. Only real translations. */
  alternates?: { lang: string; url: string }[];
}

const {
  title,
  description,
  image = '/og-default.png',
  canonical,
  noindex = false,
  type = 'website',
  alternates = [],
} = Astro.props;

// Astro.site MUST be set in astro.config. These throw clarity if it isn't.
const site = Astro.site;
const canonicalURL = canonical ?? new URL(Astro.url.pathname, site).href;
const imageURL = new URL(image, site).href;
---
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />
{noindex && <meta name="robots" content="noindex, nofollow" />}

{/* hreflang - only emitted for translations that actually exist (see i18n.md) */}
{alternates.map((a) => (
  <link rel="alternate" hreflang={a.lang} href={a.url} />
))}

{/* Open Graph */}
<meta property="og:type" content={type} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:image" content={imageURL} />

{/* Twitter */}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={imageURL} />
```

Notes:
- **Title/description are required props** - no defaults. That forces every page to supply unique ones instead of silently reusing a template value (the most common SEO bug on agency sites).
- **Canonical is self-referencing** by default (this page's own absolute URL). On a localized page it must be the *localized* URL - `references/i18n.md` shows how.
- `noindex` also means *keep it out of the sitemap* - handle that in the sitemap config below.

## BaseLayout

```astro
---
// src/layouts/BaseLayout.astro
import SEO from '../components/SEO.astro';
interface Props {
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  lang?: string;          // 'de', 'en', ... - defaults to the site's primary language
  alternates?: { lang: string; url: string }[];
}
const { lang = 'de', ...seo } = Astro.props;
---
<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <SEO {...seo} />
    <slot name="head" />
  </head>
  <body>
    <header><!-- nav --></header>
    <main>
      <slot />
    </main>
    <footer><!-- footer --></footer>
  </body>
</html>
```

Every page renders through this, supplying its own `title`/`description`. One `<h1>` per page lives in the page content, not the layout.

## astro.config: site + sitemap

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://clientdomain.com',   // REQUIRED - real production domain
  trailingSlash: 'always',            // pick one policy and keep it consistent
  integrations: [
    sitemap({
      // Keep noindex / draft / utility pages out of the sitemap.
      filter: (page) =>
        !page.includes('/thank-you') &&
        !page.includes('/404'),
    }),
  ],
});
```

`@astrojs/sitemap` emits `sitemap-index.xml`. A page should be in the sitemap **iff** it's indexable - keep the `filter` in sync with whatever you mark `noindex`. (The preflight script cross-checks this.)

## robots.txt

The upgreight starter ships this as an **endpoint** (`src/pages/robots.txt.ts`) that derives the `Sitemap:` URL from `Astro.site` — one source of truth, nothing to keep in sync by hand. On a from-scratch build, a static `public/robots.txt` works too:

```
User-agent: *
Allow: /

Sitemap: https://clientdomain.com/sitemap-index.xml
```

**The single most common launch-killer is a leftover staging `robots.txt` with `Disallow: /`.** Always verify this file before handoff. If staging needs blocking, do it at the host/edge level or with `noindex`, not by committing a disallow-all that ships to production.

## Structured data (JSON-LD)

Add schema that's *true*. Render a `<script type="application/ld+json">` in the relevant page's head slot. Never fabricate ratings, review counts, prices, or addresses.

**Organization / LocalBusiness** (home or contact page):
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Client Name",
  "url": "https://clientdomain.com",
  "logo": "https://clientdomain.com/logo.png",
  "telephone": "+49 ...",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "...",
    "addressLocality": "...",
    "postalCode": "...",
    "addressCountry": "DE"
  }
}
```

**Article** (blog post): `@type: Article`, with `headline`, `datePublished`, `dateModified`, `author`, `image`.
**BreadcrumbList**: for deep pages, mirrors the visible breadcrumb.

Validate with Google's Rich Results Test before launch.

## 404 page

`src/pages/404.astro` - a real branded page through `BaseLayout`, `noindex`, with a link back home and to key pages. Astro serves it automatically for static builds on hosts that support it.

## Trailing slash & clean URLs

- Pick **one** trailing-slash policy (`'always'` is a safe default) and set it in `astro.config`. Inconsistency creates duplicate-URL canonicals and broken internal links.
- Slugs: lowercase, hyphenated, no spaces, no underscores, no `.html`, no special characters. ASCII-fold non-ASCII (`über-uns` → `ueber-uns`) unless the client wants the native form *and* the host serves it correctly.
- Internal links should match the trailing-slash policy so they don't bounce through a redirect.

## Open Graph images

- Ship a default `public/og-default.png` at **1200×630**.
- Override per page where a specific image is better (blog post hero, key landing pages).
- Keep it an absolute URL - the SEO component handles that via `Astro.site`.

## Preflight checklist

The script (`scripts/preflight.mjs`) covers the mechanical checks. This is the human pass:

- [ ] `npm run build` is clean.
- [ ] `robots.txt` allows crawling and links the sitemap (no `Disallow: /`).
- [ ] `site` is the real production domain (not a preview URL).
- [ ] Each page has a **unique** title and description (not the same on every page).
- [ ] Canonicals are absolute and self-referencing (localized where multilingual).
- [ ] OG preview looks right (test in a debugger / paste into a chat to preview).
- [ ] One `<h1>` per page; headings in logical order.
- [ ] Images have meaningful `alt`; decorative ones use `alt=""`.
- [ ] `noindex`/thank-you/utility pages are out of the sitemap.
- [ ] Lighthouse: Performance + Accessibility + SEO all healthy. Watch LCP image, CLS (dimension your images), color contrast, tap-target size.
- [ ] axe / keyboard pass: focus visible, nav reachable by keyboard, forms labelled.
- [ ] Favicon + (if relevant) web manifest present.
