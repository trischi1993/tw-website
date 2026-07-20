---
name: upgreight-astro-website
description: Build a high-quality, lean Astro website for a client from a fresh repo - optionally with Sanity CMS. Use this whenever Julian (julian@upgreight.com) starts a new Astro client project, scaffolds an Astro site, asks how to structure an Astro build, or wants to add pages, SEO, localization (i18n/hreflang), forms, redirects, animations, or a CMS to an Astro project. Also use it when reviewing or hardening an Astro site before launch. Acts as a senior Astro + SEO architect - gather the real requirements first, then choose the simplest architecture that fits (static by default; add Sanity only for client-editable content; add i18n only for multiple languages), build strong SEO basics every time, and run launch preflight checks before handoff. The whole point is to stay lean - no boilerplate, no prebuilt section libraries, no design systems, no unneeded dependencies, no guessed localization. Prefer this skill over generic "build a website" instincts for any Astro work.
---

# upgreight Astro website builder

Julian runs upgreight and builds custom client websites. This skill builds each one from a **fresh repo** with the senior-architect mindset: lean, custom, technically clean, and safe to launch.

The enemy is bloat. Every dependency, abstraction, and feature is something the client - or future-you - has to understand and maintain. A static 5-page site that loads instantly and ranks well beats a CMS-driven page-builder with three integrations the client never touches. **Default to less.** Add complexity only when a concrete requirement forces it.

So the cardinal rule: **understand the project before you scaffold anything.** Most damage on these projects comes from adding things the client didn't need - Sanity for a site nobody edits, i18n for one language "just in case", a section system for five pages. You can't easily remove that later, and it taxes every future change.

## The build loop

1. **Requirements intake** - learn what the project actually is. Don't scaffold yet.
2. **Decide the architecture** - pick the simplest setup that satisfies the requirements.
3. **Scaffold minimally** - empty Astro project, only the integrations you'll use.
4. **SEO baseline** - always, every project, no exceptions.
5. **Build the pages / content** - semantic, accessible, custom to the design.
6. **Add conditional capabilities** - Sanity, i18n, forms, animations, redirects - *only* the ones the requirements demanded. Read the matching reference first.
7. **Preflight** - build, run the checks, fix everything, hand off.

Work through it in order. Steps 1–2 are where the leverage is; rushing them is how projects get over-built.

**Orchestrate big builds with subagents.** A full one-shot website is too big for one context window. Delegate the heavy, self-contained lifts - image sourcing, the Sanity studio, research, bulk content - to cleanly-scoped subagents that write to disk and report back briefly. The main agent keeps the design vision, architecture decisions, and final verification in its own context. Without this, context runs out mid-build.

---

## Step 1 - Requirements intake

Before touching code, get clear answers (from Julian's brief, the client's existing site, or by asking). Present it back as a short brief and confirm before deciding the architecture.

| Dimension | What you need to know | Why it changes the build |
|---|---|---|
| **Pages** | Which pages, rough count, which are templated (blog, team, offers) vs. one-off | Drives routing; templated/repeating content hints at collections or CMS |
| **Editing** | Who edits content after launch - a dev, or the client themselves? How often? | The single biggest lever: client-editing → Sanity; dev-maintained → static |
| **Blog / news** | Any? How many posts, who writes them, how often? | A few dev-written posts → Markdown content collections; client-written/frequent → Sanity |
| **Languages** | One language, or several? Which? Same content per language or different? | Multiple → i18n from the start (painful to retrofit). One → no i18n at all |
| **SEO risk** | New domain, or a migration/redesign of a site that already ranks? Existing URLs? | Migration = high risk: existing URLs must be preserved or redirected, or rankings drop |
| **Redirects** | Real old→new URL mappings from a previous site? | Only set up redirects that correspond to real old URLs. Don't invent them |
| **Forms** | Contact / booking / newsletter? Where does the submission go? | Static host → third-party endpoint; SSR host → API route. Picks the deployment too |
| **Animations** | Does the design genuinely call for motion, or is it static? | Most sites need none. Prefer CSS; reach for GSAP only for real interactive motion |
| **Deployment** | Where does it host? Custom domain ready? | Default to a static build deployable anywhere; only add an SSR adapter if SSR is needed |
| **Brand / design** | Existing brand, design files, or building from scratch? Styling preference? | Decides styling approach (Tailwind vs. scoped CSS) and how custom the components are |

**Push back on gold-plating.** If Julian says "maybe add a blog later" or "the client might want to edit it someday", that's a *future* requirement - note it, don't build it now. A static site can gain Sanity later in an afternoon. The reverse (ripping out an unused CMS) is the painful direction. The one exception is **i18n**, which is genuinely hard to retrofit - so if multiple languages are even moderately likely, decide that one up front.

---

## Step 2 - Decide the architecture

Pick the **simplest** option that satisfies the confirmed requirements. Map the signals:

**Content source**
- Content is fixed or dev-maintained → **static Astro**, copy lives in `.astro` files or local Markdown/MDX content collections. No CMS.
- A blog/list of items that a *developer* maintains, handful of entries → **content collections** (Markdown/MDX in `src/content/`). Still no CMS.
- The **client must edit content themselves**, or content changes often (offers, news, team, products) → **Astro + Sanity**. This is the only thing that justifies a CMS.

**Languages**
- One language → **no i18n**. Set `<html lang>` once and move on.
- Multiple languages → **i18n routing from the start** (see `references/i18n.md`). Decide locales, default locale, and URL strategy before building pages.

**Rendering**
- Default **`output: 'static'`** - fastest, cheapest, deployable anywhere. This is the right answer for the large majority of these sites.
- Add an SSR adapter **only** if something genuinely needs the server at request time (auth, personalized content, form handling via API route, on-demand preview). Don't add an adapter "to be safe."

**Forms / redirects / animations** - only if the intake flagged them. Details in `references/architecture.md`.

State the decision back to Julian in one or two lines with the reasoning ("Static, no CMS - content is fixed and you maintain it; Sanity would just be overhead"), then build. If you're genuinely torn between static and Sanity, prefer static: it's the cheaper mistake to correct.

See `references/architecture.md` for the deeper decision guide, the dependency policy, and how forms/redirects/SSR map to each host.

---

## Step 3 - Scaffold minimally

> **Normalfall bei upgreight: das Template KLONEN, nicht from-scratch scaffolden.**
> Dieses Skill liegt IM `template-astro`-Starter. Der reguläre Weg (Repo-README +
> `.claude/commands/init-project.md`) ist: Starter kopieren → `node scripts/init.mjs`
> (Platzhalter ersetzen) → das nicht Benötigte reduzieren. Der Starter ist bereits
> zweisprachig (de + /en/) und mit dormant Sanity + Live-Editing vorverdrahtet;
> „reduzieren" ist billig (README: „Auf eine Sprache reduzieren", Sanity bleibt
> dormant, ganze Live-Editing-Maschinerie strippen für No-CMS-Projekte). Die
> Anleitung unten (leeres Astro-Projekt) gilt nur, wenn bewusst OHNE das Template
> gebaut wird.

Start from an **empty** Astro project - not a theme, not a starter with demo content.

```bash
npm create astro@latest -- --template minimal --typescript strict
```

Then keep it lean:

- **`site` is required.** Set `site: 'https://clientdomain.com'` in `astro.config.mjs`. Canonicals, sitemap, and absolute OG URLs all derive from it. Without it, SEO output is broken.
- **Add only what you'll use.** `@astrojs/sitemap` always (it's part of the SEO baseline). Everything else is conditional: `@astrojs/tailwind` only if you chose Tailwind, `@sanity/client` only if Sanity, an SSR adapter only if SSR.
- **Lean structure**, grown as needed - don't pre-create empty folders:
  ```
  src/
    layouts/      BaseLayout.astro (wraps every page; renders <SEO/>)
    components/   custom, per-design - no prebuilt "section" library
    pages/        routes
    content/      content collections (only if you have dev-maintained lists)
    lib/          small helpers (sanity client, seo helpers) - only if needed
  public/         static assets, robots.txt, favicons
  ```
- **Styling is per project.** If the design wants utility-first and there's no objection, Tailwind via `@astrojs/tailwind`. Otherwise Astro **scoped styles** + a small `tokens.css` (colors, type scale, spacing) imported once. Either way: **no component library, no UI kit, no design system.** Build the components the design needs, nothing more.
- **Two-layer, hue-neutral colour tokens.** Keep colour tokens in two tiers: hue-neutral *primitives* hold the raw values (name them by role, e.g. `--paper`, `--ink`, `--brand` — never by hue like `--terracotta`, which goes stale when the next project recolours), and *semantic* tokens (`--surface`, `--on-surface*`, `--line`, `--accent*`) map roles onto them. Components read **only** the semantic layer.
- **Theme section surfaces via context classes, not per-element overrides.** When a design has multiple section surfaces (light / alt / dark), remap the semantic surface tokens **once** on a context class (e.g. `.on-dark { --surface: …; --on-surface: …; }`) and let components consume `var(--on-surface)` / `var(--line)`. Don't write per-element `.on-dark .thing { color: … }` overrides or hardcode hex — a new section then themes correctly in every context for free.
- **Decline the bloat**: no state libraries, no animation libs unless required, no analytics/consent/SEO mega-plugins, no `@astrojs/*` integration you won't use. If you're tempted to add a dependency, first check whether ten lines of your own code do the job.

---

## Step 4 - SEO baseline (every project, always)

This is non-negotiable on a client launch - it's the difference between a site that can be found and one that can't. Build it once into the base layout so every page gets it for free.

A single **`<SEO>` component** (rendered by `BaseLayout`) outputs, for every page:

- **`<title>`** - unique per page, descriptive, brand-suffixed.
- **`<meta name="description">`** - unique per page.
- **Canonical** - `<link rel="canonical">`, an **absolute** URL built from `Astro.site` + the current path. Self-referencing (points to *this* page). On localized pages it points to *this* localized URL, never the default-language one.
- **Open Graph + Twitter** - `og:title`, `og:description`, `og:image` (absolute URL), `og:url`, `og:type`, `twitter:card`. A sensible default OG image, overridable per page.
- **`<html lang>`** - correct language for the page (set in the layout, localized when multilingual).
- **Robots** - indexable by default; `noindex` only on pages that genuinely shouldn't rank (thank-you pages, internal utility pages), and those must also stay out of the sitemap.

Plus, project-wide:

- **`@astrojs/sitemap`** generating `sitemap-index.xml`, with `noindex`/draft pages filtered out.
- **`public/robots.txt`** pointing at the sitemap; never `Disallow: /` on a live site (a leftover staging robots.txt is a classic launch-killer - check it).
- **Semantic HTML** - real `<header>/<nav>/<main>/<footer>`, one `<h1>` per page, headings in order (no skipped levels), landmarks for accessibility.
- **Image `alt`** on every meaningful image; empty `alt=""` only for purely decorative ones. Use `astro:assets` (`<Image>`) for responsive, dimensioned images so layout doesn't shift (CLS).
- **Clean URLs** - lowercase, hyphenated, no `.html`, consistent trailing-slash policy. A custom **404** page.
- **Structured data (JSON-LD)** where it helps - `Organization`/`LocalBusiness` on the home/contact page, `Article` on blog posts, `BreadcrumbList` for deep pages. Add what's true; don't fabricate ratings or data.

Copy-ready component code, the sitemap/robots config, and the JSON-LD patterns are in **`references/seo.md`** - read it when building this step. Inline the *rules* above into the build; pull the *code* from the reference.

---

## Step 5 - Build the pages and content

Build the components the design calls for - composed, custom, semantic. No generic "section system" or page-builder abstraction: those add indirection that pays off only across dozens of pages, and these sites don't have dozens.

For each page: correct heading hierarchy, descriptive link text, accessible forms (labels, not just placeholders), keyboard-navigable interactive elements, dimensioned responsive images with real `alt`. Keep client-facing copy in obvious places so it's easy to find and change.

Content collections (if chosen): define a typed `src/content/config.ts` schema so frontmatter is validated and slugs/dates can't silently break.

---

## Step 6 - Conditional capabilities

Only build the ones the requirements demanded. Read the reference before starting each.

- **Sanity CMS** → `references/sanity.md`. Only when the client edits content themselves or content changes often. Focus on *client-friendly, safe* schemas - clear titles/descriptions, validation, sensible groups, no raw technical fields, drafts that don't leak to production. Allow custom project-specific sections only where the project actually needs them. **Sequence it last:** even when Sanity is required, ship the static site from local seed content and get Julian's design sign-off *first*, then build the schemas against the **final** sections and load **real** content. Building the CMS against an unapproved design means rebuilding it when sections change. The offline-first content layer (see the reference) keeps the site running without Sanity until then.
- **Internationalization** → `references/i18n.md`. Only for multiple languages. Localized routes, correct `<html lang>`, hreflang **only for translations that actually exist**, canonicals pointing at the current localized URL, and a language switcher that resolves **real** translation relationships - never guessed sibling URLs.
- **Forms** → `references/architecture.md` (Forms). Provider depends on the host (static → third-party endpoint; SSR → API route).
- **Redirects** → `references/architecture.md` (Redirects). Only real old→new mappings, configured for the chosen host.
- **Animations** → only if the design needs real motion. Prefer CSS transitions/`@keyframes` and Astro view transitions. For genuine interactive/scroll animation, use the installed **GSAP skills** (`gsap-core`, `gsap-scrolltrigger`, etc.) if present - otherwise implement GSAP directly (ScrollTrigger reveals + scrub parallax, a custom slider rather than Swiper). Always gate motion behind `prefers-reduced-motion`.

If the requirements didn't call for it, **don't add it.** Re-read the core principle if you feel the urge.

---

## Step 7 - Preflight before handoff

A client launch is hard to reverse - a broken canonical, a staging `Disallow: /`, or a dead internal link can quietly cost the client traffic. So verify before you call it done.

1. **Build succeeds clean:** `npm run build` with no errors or warnings you can't explain.
2. **Run the automated checks** against the built output:
   ```bash
   node .claude/skills/upgreight-astro-website/scripts/preflight.mjs ./dist --site https://clientdomain.com
   ```
   It scans the real rendered HTML in `dist/` (so it's accurate regardless of how the page was built - static, Sanity, or i18n) and reports: missing/empty title or description, wrong or missing canonicals, broken internal links, missing image `alt`, heading-order problems, hreflang pointing at pages that don't exist, `noindex`/draft pages that leaked into the sitemap, sitemap URLs that 404, and non-clean slugs. **Fix every error before handoff;** triage warnings.
3. **Manual + tooling pass** (see `references/seo.md` "Preflight checklist"): eyeball `robots.txt` (not blocking the site), spot-check OG previews, and run Lighthouse / axe for the accessibility and performance basics (contrast, tap targets, LCP image, no layout shift).
4. **Final go-live gate** (before launch, not before every handoff): work through `references/go-live-checklist.md` end to end against the real domain. Steps 1 to 3 above are the automated/lightweight subset you run **often** (after features, before any handoff). This checklist is the human-driven **final pass** that also covers what no script can: legal/DSGVO, DNS, real form submission, analytics, external validators, i18n content completeness, design-token hygiene, and Sanity content. Copy it into the project repo and check off every point before the site goes live.

Hand off with a short note: architecture chosen and why, what's wired up, what (if anything) is pending client input, and how to run the build + preflight.

---

## upgreight house rules (every project)

- **Footer credit:** always `Created by upgreight` linking to https://upgreight.com - **in English on every site, whatever the site's language** (brand signature, never localized).
- **Legal pages:** always ship **Impressum** + **Datenschutz** (DE/EU clients). Mark them `noindex` *and* keep them out of the sitemap. Deliver as templates with clearly-marked `[PLATZHALTER]` placeholders and a "have this legally reviewed" note.
- **Forms:** default to **Form.Taxi** (DSGVO-friendly, static) posting to a `/danke/` thank-you page (`noindex`, out of sitemap).
- **Fonts:** self-host as `woff2` + `<link rel="preload">`. No Google Fonts / no external font requests (performance + DSGVO).
- **IMPORTANT - no dashes as decoration.** **Never** use em-dashes ( - ) in visible copy (taglines, headings, eyebrows, body); they read as AI-slop to Julian. **Never** put a decorative dash/line/stroke before an eyebrow/label (no `─── LABEL`) - eyebrows are plain text. Restructure with periods/commas instead. En-dashes in numeric ranges (`1–4`, `70 m²`) are fine.

## Anti-patterns - what *not* to do

These are the failure modes this skill exists to prevent. If you catch yourself doing one, stop.

- **Adding a CMS nobody asked for.** Sanity is justified by client-editing or frequent change - nothing else.
- **i18n / hreflang for a single-language site**, or hreflang/canonicals to URLs that don't exist. Guessed localization is worse than none.
- **Prebuilt section libraries, page-builders, design systems, UI kits.** Build the custom components the design needs.
- **Dependencies that ten lines of code would replace.** Every one is maintenance.
- **Hardcoded/templated SEO** - the same title or description on every page, a missing canonical, or `site` left unset.
- **Inventing redirects, ratings, or structured data.** Only encode what's real.
- **Scaffolding before understanding the project.** Requirements first, always.
- **Shipping without the preflight pass.**

## References

- `references/architecture.md` - architecture decision guide, dependency policy, forms / redirects / SSR / deployment per host. Read in Step 2.
- `references/seo.md` - SEO component code, sitemap + robots config, JSON-LD patterns, 404, the manual preflight checklist. Read in Step 4 and Step 7.
- `references/i18n.md` - localized routing, hreflang, language switcher, localized canonicals. Read only if the project is multilingual.
- `references/sanity.md` - Sanity setup, client-safe schema patterns, GROQ, draft handling, custom sections. Read only if using Sanity.
- `scripts/preflight.mjs` - zero-dependency launch checker over `dist/`. Run in Step 7.
- `references/go-live-checklist.md` - the full human-driven launch checklist (PREP / CFG / SEO / i18n / perf / a11y / legal / CMS / design-token hygiene). Copy into the project repo and complete it as the final gate before go-live (Step 7). The preflight script is its automated subset.

## Working with Julian

- Lean and direct, no filler. Examples and tables over prose. (Matches the `upgreight-hotel-landingpage` house style.)
- When there's a tradeoff, name it and pick a default with a one-line reason rather than asking him to choose.
- Confirm the requirements brief and the architecture decision before building; after that, just build and report.
- Keep client-facing things obvious and safe - he's handing these to real clients.
