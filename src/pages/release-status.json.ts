import type { APIRoute } from 'astro';

declare const __RELEASE_COMMIT__: string;

const commit = __RELEASE_COMMIT__;

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
