import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const noFetch = args.has('--no-fetch');
const timeoutArgument = [...args].find((argument) => argument.startsWith('--timeout='));
const timeoutSeconds = Number.parseInt(timeoutArgument?.split('=')[1] ?? '600', 10);
const intervalArgument = [...args].find((argument) => argument.startsWith('--interval='));
const intervalSeconds = Number.parseInt(intervalArgument?.split('=')[1] ?? '10', 10);
const releaseUrl =
  process.env.RELEASE_STATUS_URL ??
  'https://tristanweithaler.com/release-status.json';

if (!Number.isFinite(timeoutSeconds) || timeoutSeconds < 0) {
  throw new Error('--timeout muss eine nicht negative Anzahl Sekunden sein.');
}

if (!Number.isFinite(intervalSeconds) || intervalSeconds < 1) {
  throw new Error('--interval muss mindestens eine Sekunde betragen.');
}

const git = (arguments_, options = {}) =>
  execFileSync('git', arguments_, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();

const branch = git(['branch', '--show-current']);
const status = git(['status', '--porcelain']);

if (branch !== 'main') {
  throw new Error(
    `Der normale Projektordner steht auf „${branch || 'detached HEAD'}“ statt auf „main“.`,
  );
}

if (status) {
  throw new Error(
    `Der lokale main-Ordner ist nicht sauber:\n${status}\n` +
      'Erst alle beabsichtigten Änderungen committen oder bewusst auslagern.',
  );
}

if (!noFetch) {
  git(['fetch', '--quiet', 'origin', 'main']);
}

const localCommit = git(['rev-parse', 'refs/heads/main']);
const githubCommit = git(['rev-parse', 'refs/remotes/origin/main']);

if (localCommit !== githubCommit) {
  throw new Error(
    `Lokales main (${localCommit}) und origin/main (${githubCommit}) sind nicht synchron.`,
  );
}

const deadline = Date.now() + timeoutSeconds * 1000;
let lastMessage = '';

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

while (true) {
  try {
    const url = new URL(releaseUrl);
    url.searchParams.set('check', String(Date.now()));
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const liveCommit = String(payload.commit ?? '').trim();

    if (liveCommit === localCommit) {
      console.log('Release synchron:');
      console.log(`  lokal main:  ${localCommit}`);
      console.log(`  GitHub main: ${githubCommit}`);
      console.log(`  Cloudflare:  ${liveCommit}`);
      process.exit(0);
    }

    lastMessage = `Cloudflare liefert noch ${liveCommit || 'keine Commit-Kennung'} statt ${localCommit}.`;
  } catch (error) {
    lastMessage = `Live-Stand noch nicht prüfbar: ${error instanceof Error ? error.message : error}`;
  }

  if (Date.now() >= deadline) {
    throw new Error(`${lastMessage}\nRelease-Synchronisierung nicht bestätigt.`);
  }

  console.log(`${lastMessage} Neuer Versuch in ${intervalSeconds} Sekunden …`);
  await sleep(intervalSeconds * 1000);
}
