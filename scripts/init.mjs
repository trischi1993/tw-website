#!/usr/bin/env node
// upgreight Astro starter - project initializer.
// Replaces the starter placeholders with your project's values in one pass.
//
// Usage:
//   node scripts/init.mjs --name my-client --domain https://www.myclient.com
//   node scripts/init.mjs            (interactive)
//
// What it changes:
//   package.json / studio/package.json   package name
//   wrangler.jsonc                        preview Worker name (<slug>-preview)
//   wrangler.prod.jsonc                   prod Worker name (<slug>-prod)
//   astro.config.mjs / .preview.mjs       site URL (robots.txt + sitemap folgen
//                                         automatisch: src/pages/robots.txt.ts
//                                         leitet aus `site` ab)
//   studio/sanity.config.ts               studio name + title
//   src/components/SEO.astro              og:site_name fallback
//   git history                           reset to a single initial commit on main,
//                                         so the client repo does NOT carry the
//                                         template history (skip with --keep-git)
//
// It does NOT touch Sanity project ids or tokens. Those live in .env (copy
// .env.example to .env and fill them when you connect the CMS), never in the repo.

import { readFile, writeFile, rm } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, exit } from 'node:process';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function arg(flag) {
  const i = argv.indexOf(flag);
  return i !== -1 ? argv[i + 1] : undefined;
}

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

async function prompt(rl, q, def) {
  const a = (await rl.question(`${q}${def ? ` (${def})` : ''}: `)).trim();
  return a || def || '';
}

async function replaceInFile(rel, pairs) {
  const file = path.join(root, rel);
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch {
    console.warn(`  skip ${rel} (not found)`);
    return;
  }
  let changed = false;
  for (const [from, to] of pairs) {
    if (text.includes(from)) {
      text = text.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    await writeFile(file, text);
    console.log(`  updated ${rel}`);
  } else {
    console.warn(`  no placeholder found in ${rel} (already initialized?)`);
  }
}

async function main() {
  let name = arg('--name');
  let domain = arg('--domain');
  let studioTitle = arg('--studio-title');

  if (!name || !domain) {
    const rl = createInterface({ input: stdin, output: stdout });
    name = name || (await prompt(rl, 'Project slug (e.g. mein-kunde)'));
    domain = domain || (await prompt(rl, 'Production domain', 'https://www.example.com'));
    studioTitle = studioTitle || (await prompt(rl, 'Studio title', titleCase(slugify(name))));
    rl.close();
  }

  const slug = slugify(name);
  if (!slug) {
    console.error('A project slug is required.');
    exit(1);
  }
  studioTitle = studioTitle || titleCase(slug);
  domain = domain.replace(/\/+$/, ''); // no trailing slash for the replacement

  console.log(`\nInitializing starter as "${slug}" (${domain})\n`);

  await replaceInFile('package.json', [['"upgreight-astro-starter"', `"${slug}"`]]);
  await replaceInFile('studio/package.json', [
    ['"upgreight-astro-starter-studio"', `"${slug}-studio"`],
  ]);
  await replaceInFile('wrangler.jsonc', [['"astro-starter-preview"', `"${slug}-preview"`]]);
  await replaceInFile('wrangler.prod.jsonc', [['"astro-starter-prod"', `"${slug}-prod"`]]);
  await replaceInFile('astro.config.mjs', [['https://example.com', domain]]);
  await replaceInFile('astro.config.preview.mjs', [['https://example.com', domain]]);
  await replaceInFile('studio/sanity.config.ts', [
    ["name: 'starter'", `name: '${slug}'`],
    ["title: 'Astro Starter'", `title: '${studioTitle}'`],
  ]);
  await replaceInFile('src/components/SEO.astro', [
    ["const FALLBACK_SITE_NAME = 'Astro Starter'", `const FALLBACK_SITE_NAME = '${studioTitle}'`],
  ]);

  if (argv.includes('--keep-git')) {
    console.log('  git: history kept (--keep-git)');
  } else {
    await resetGitHistory(slug);
  }

  console.log(`\nDone. Next:
  1. npm install
  2. npm run dev            (runs on the built-in seed, no Sanity needed)
  3. Connect Sanity when ready: copy .env.example to .env, see studio/README.md
  4. git remote add origin <repo-url> && git push -u origin main
     (history is already a single fresh commit - see below)
`);
}

// Reset the copied template's git history to one clean initial commit, so the
// new client repo does not inherit the template's (and other clients') history.
// Works regardless of how the folder was duplicated (Finder or cp -R).
async function resetGitHistory(slug) {
  // Safety: never wipe the canonical template's own history.
  if (path.basename(root) === 'template-astro') {
    console.warn(
      '  git: looks like the template folder itself (template-astro) - history NOT reset.',
    );
    return;
  }
  try {
    await rm(path.join(root, '.git'), { recursive: true, force: true });
    execSync('git init -b main', { cwd: root, stdio: 'ignore' });
    execSync('git add -A', { cwd: root, stdio: 'ignore' });
    execSync(`git commit -m "Initial commit (${slug}, from upgreight Astro starter)"`, {
      cwd: root,
      stdio: 'ignore',
    });
    console.log('  git: fresh history initialized (1 commit on main)');
  } catch (e) {
    console.warn(
      `  git: reset skipped (${e.message?.split('\n')[0] ?? e}). Do it manually: rm -rf .git && git init`,
    );
  }
}

main();
