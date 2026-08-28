import type { APIRoute } from 'astro';
import { execFileSync } from 'node:child_process';

const environmentCommit =
  process.env.CF_PAGES_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  process.env.COMMIT_SHA;

const commit = (
  environmentCommit ??
  execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  })
).trim();

if (!/^[0-9a-f]{40}$/i.test(commit)) {
  throw new Error(`Ungültige Git-Commit-Kennung für release-status.json: ${commit}`);
}

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(`${JSON.stringify({ commit })}\n`, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Robots-Tag': 'noindex',
    },
  });
