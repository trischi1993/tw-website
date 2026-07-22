#!/usr/bin/env node
// upgreight Astro starter - Sanity + Cloudflare provisioning.
//
// Fahrt die scriptbaren Teile des Neukunden-Setups in EINEM Lauf: Sanity-
// Projekt, Dataset, CORS, Viewer-Token, Seed-Import, erster Backup-Export,
// Studio-Deploy, die zwei Cloudflare-Worker (Prod = Assets-only, Preview = SSR)
// und das Preview-Secret. Die dashboard-/zonengebundenen Teile (Workers-Builds-
// Git-Anbindung, Custom-Domains, Publish-Webhook) kann und DARF ein Script nicht
// blind erledigen - die druckt es als praezise, confirmbare Anleitung.
//
// LEITPLANKEN (von Julian vorgegeben - Sicherheit vor Automatik):
//   * DRY-RUN ist Default. Ohne --execute wird NICHTS angefasst; das Script
//     druckt nur den Plan inkl. der exakten Befehle. Erst --execute fuehrt aus.
//   * Kostenpflichtige/destruktive Schritte (Projekt anlegen, Worker deployen)
//     fragen einzeln nach (Confirm), ausser mit --yes vorab bestaetigt.
//   * IDEMPOTENT (mit einer Bedingung): Dataset/CORS/Token legen via list-before-
//     create nichts doppelt an. Fuer einen sicheren Re-Run das bestehende Projekt
//     mit --project-id uebergeben (sonst legt ensureProject ein NEUES an) - und
//     der Seed-Import wird bei bereits befuelltem Dataset UEBERSPRUNGEN (nur mit
//     --force-seed erzwingbar, das dann bestehende Inhalte ueberschreibt). Vor
//     jedem (Re-)Import laeuft ein Backup-Export.
//   * Secrets werden NIE geloggt. Das Script sagt WAS es tut, nie den Wert. Der
//     erzeugte Viewer-Token wandert nach .env (gitignored) + `wrangler secret`.
//   * Backup: direkt nach dem Seed ein `datasets export`; das Re-Run-Backup-
//     Kommando wird am Ende ausgegeben.
//
// AUTH: nutzt die bereits eingeloggten CLIs (`sanity login`, `wrangler login`).
// Das Script fasst KEINE Login-Tokens an - es ruft nur die CLIs auf.
//
// Reihenfolge im Ablauf: erst `node scripts/init.mjs` (Platzhalter ersetzen),
// dann dieses Script.
//
// Usage:
//   node scripts/provision.mjs --name mein-kunde \
//     --prod-domain kunde.de --preview-domain kunde.preview.upgreight.dev \
//     --studio-host kunde                         # DRY-RUN (zeigt nur den Plan)
//   node scripts/provision.mjs --name mein-kunde ... --execute      # fuehrt aus
//   node scripts/provision.mjs --name mein-kunde ... --execute --yes # ohne Fragen
//   node scripts/provision.mjs --project-id p4maz11v ... --execute   # Projekt wiederverwenden
//
// Flags:
//   --name <slug>            Projekt-Slug (Pflicht, ausser --project-id gesetzt)
//   --org <slug|id>          Sanity-Organisation (Default: CLI-Default des Accounts)
//   --project-id <id>        bestehendes Sanity-Projekt wiederverwenden (statt neu)
//   --prod-domain <host>     Produktions-Domain (z. B. kunde.de)
//   --preview-domain <host>  Preview-Domain (z. B. kunde.preview.upgreight.dev)
//   --studio-host <host>     Studio-Hostname (z. B. kunde -> kunde.sanity.studio)
//   --execute                tatsaechlich ausfuehren (sonst Dry-Run)
//   --yes                    Confirm-Prompts vorab bejahen
//   --force-seed             Seed auch in ein bereits befuelltes Dataset importieren
//                            (--replace UEBERSCHREIBT bestehende Inhalte!)
//   --help

import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, exit, env } from 'node:process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const studioDir = path.join(root, 'studio');

// ---------------------------------------------------------------------------
// Argumente & Modi
// ---------------------------------------------------------------------------
const arg = (flag) => {
  const i = argv.indexOf(flag);
  return i !== -1 ? argv[i + 1] : undefined;
};
const has = (flag) => argv.includes(flag);

if (has('--help') || has('-h')) {
  printHelpAndExit();
}

const DRY = !has('--execute');
const AUTO_YES = has('--yes');
// Seed-Import gegen ein Dataset, das bereits Inhalte trägt, nur mit explizitem
// --force-seed (überschreibt siteSettings/homePage/… via --replace). Ohne das
// Flag wird der Import bei bestehendem Dataset übersprungen.
const FORCE_SEED = has('--force-seed');

const slug = slugify(arg('--name') || '');
let projectId = arg('--project-id') || '';
const org = arg('--org') || '';
const prodDomain = stripScheme(arg('--prod-domain') || '');
const previewDomain = stripScheme(arg('--preview-domain') || '');
const studioHost = (arg('--studio-host') || slug).replace(/\.sanity\.studio$/, '');

if (!slug && !projectId) {
  fail('Either --name <slug> or --project-id <id> is required. See --help.');
}
// Format-Gate: die projectId landet im Backup-DATEINAMEN (backups/<id>-<stamp>)
// und in .env - ein Wert wie "../../x" wuerde sonst ausserhalb von backups/
// schreiben. Sanity-IDs sind kurz-alphanumerisch; alles andere ablehnen.
if (projectId && !/^[a-z0-9-]{1,32}$/i.test(projectId)) {
  fail(`--project-id "${projectId}" sieht nicht wie eine Sanity-Projekt-ID aus (erwartet: kurz, alphanumerisch).`);
}

const studioTitle = titleCase(slug || projectId);
const rl = createInterface({ input: stdin, output: stdout });

// Sammelt die manuellen Folge-Schritte, die am Ende gebuendelt ausgegeben werden.
const manualSteps = [];
// Haelt den erzeugten Viewer-Token NUR im Speicher (nie geloggt).
let viewerToken = '';
// true, wenn das Dataset "production" bereits existierte (Reuse-Pfad) - schuetzt
// den Seed-Import davor, bestehende Inhalte zu ueberschreiben.
let datasetExisted = false;

// ---------------------------------------------------------------------------
// Ablauf
// ---------------------------------------------------------------------------
async function main() {
  banner();

  await preflight();
  await ensureProject();
  await ensureDataset();
  await ensureCors();
  await ensureViewerToken();
  // Backup VOR dem Seed-Import: beim Reuse eines bestehenden Datasets sichert es
  // den Vorzustand, bevor --replace Dokumente ueberschreiben koennte. (Auf einem
  // frischen Dataset ist der Export leer - harmlos.)
  await backupExport();
  await importSeed();
  await deployStudio();
  await deployWorkers();
  await setPreviewSecret();

  // Dashboard-/zonengebundene Schritte: nur Anleitung, keine Automatik.
  queueManualSteps();

  summary();
  rl.close();
}

// ---------------------------------------------------------------------------
// Schritte
// ---------------------------------------------------------------------------

async function preflight() {
  section('Preflight');
  // Read-only Checks; auch im Dry-Run harmlos.
  const seed = path.join(studioDir, 'seed.ndjson');
  await assertExists(seed, 'studio/seed.ndjson fehlt - erst `npm run seed:build` im studio/.');

  if (DRY) {
    info('Dry-run: pruefe im Execute-Lauf `sanity`- und `wrangler`-Login (read-only).');
    return;
  }
  // Kein --json: `projects list` kennt das Flag in CLI 7.7.1 nicht (live
  // verifiziert); geparst wird hier ohnehin nichts, nur der Exit-Status.
  const s = capture(['npx', 'sanity', 'projects', 'list'], { cwd: studioDir, allowFail: true });
  if (s.status !== 0) {
    fail('Sanity-CLI nicht eingeloggt (oder Netzwerkfehler). Bitte `npx sanity login` im studio/.');
  }
  const w = capture(['npx', 'wrangler', 'whoami'], { cwd: root, allowFail: true });
  if (w.status !== 0) {
    fail('Wrangler nicht eingeloggt. Bitte `npx wrangler login`.');
  }
  ok('sanity + wrangler eingeloggt, Seed vorhanden.');
}

async function ensureProject() {
  section('Sanity-Projekt');
  if (projectId) {
    info(`Bestehendes Projekt wird wiederverwendet: ${projectId} (kein Anlegen).`);
    return;
  }
  const cmd = [
    'npx', 'sanity', 'projects', 'create', studioTitle,
    '--json', '-y', ...(org ? ['--organization', org] : []),
  ];
  const out = await act({
    label: `Projekt "${studioTitle}" anlegen` + (org ? ` (Org ${org})` : ''),
    cmd,
    cwd: studioDir,
    destructive: true, // kostenpflichtig/zaehlt aufs Kontingent
    capture: true,
  });
  if (DRY) {
    projectId = '<NEW_PROJECT_ID>';
    return;
  }
  if (!out) fail('Projekt-Erstellung abgebrochen.');
  try {
    projectId = JSON.parse(out).id || JSON.parse(out).projectId || '';
  } catch {
    // Manche CLI-Versionen drucken Vorspann vor dem JSON - letzte {..}-Zeile nehmen.
    const m = out.match(/\{[\s\S]*\}/);
    projectId = m ? (JSON.parse(m[0]).id || JSON.parse(m[0]).projectId || '') : '';
  }
  if (!projectId) fail('Konnte projectId nicht aus der CLI-Ausgabe lesen.');
  ok(`Projekt angelegt: ${projectId}`);
}

async function ensureDataset() {
  section('Dataset "production"');
  if (!DRY) {
    const res = capture(['npx', 'sanity', 'datasets', 'list', '-p', projectId], {
      cwd: studioDir, allowFail: true,
    });
    // Zeilengenau statt Teilstring: "production" darf nicht als Teil eines
    // anderen Namens (z. B. "production-old") als Treffer zaehlen.
    datasetExisted =
      res.status === 0 &&
      (res.stdout || '').split(/\r?\n/).some((l) => l.trim() === 'production');
  }
  if (datasetExisted) {
    info('Dataset "production" existiert bereits - uebersprungen.');
    return;
  }
  await act({
    label: 'Dataset "production" (public) anlegen',
    cmd: ['npx', 'sanity', 'datasets', 'create', 'production', '-p', projectId, '--visibility', 'public'],
    cwd: studioDir,
  });
}

async function ensureCors() {
  section('CORS-Origins');
  // Preview/Studio/Localhost brauchen Credentials (Draft-Cookie); Prod ist
  // statisch ohne Client-seitige Sanity-Calls - Eintrag der Vollstaendigkeit halber.
  const origins = [
    { url: 'http://localhost:4321', cred: true },
    { url: 'http://localhost:3333', cred: true },
    { url: `https://${studioHost}.sanity.studio`, cred: true },
  ];
  if (previewDomain) origins.push({ url: `https://${previewDomain}`, cred: true });
  if (prodDomain) origins.push({ url: `https://${prodDomain}`, cred: false });

  let existing = '';
  if (!DRY) {
    const res = capture(['npx', 'sanity', 'cors', 'list', '-p', projectId], {
      cwd: studioDir, allowFail: true,
    });
    existing = res.stdout || '';
  }
  const existingOrigins = existing.split(/\r?\n/).flatMap((l) => l.trim().split(/\s+/));
  for (const o of origins) {
    // Exakter Origin-Vergleich statt Teilstring (sonst wuerde localhost:4321 als
    // Teil von :43210 faelschlich als "existiert" gelten).
    if (!DRY && existingOrigins.includes(o.url)) {
      info(`CORS existiert: ${o.url}`);
      continue;
    }
    await act({
      // Credentials explizit (auch --no-credentials), sonst fragt die Sanity-CLI
      // fuer die Prod-Origin interaktiv nach - auch im --yes-Lauf.
      label: `CORS add ${o.url}${o.cred ? ' (credentials)' : ' (no-credentials)'}`,
      cmd: ['npx', 'sanity', 'cors', 'add', o.url, '-p', projectId, o.cred ? '--credentials' : '--no-credentials'],
      cwd: studioDir,
    });
  }
}

async function ensureViewerToken() {
  section('Viewer-Token (Preview-Secret)');
  const label = 'preview-viewer';
  if (!DRY) {
    const res = capture(['npx', 'sanity', 'tokens', 'list', '-p', projectId], {
      cwd: studioDir, allowFail: true,
    });
    // Exaktes Label als Token in einer Zeile (nicht Teilstring - "preview-viewer"
    // darf nicht auf "preview-viewer-alt" matchen und den Schritt still ueberspringen).
    const tokenExists =
      res.status === 0 &&
      (res.stdout || '').split(/\r?\n/).some((l) => l.split(/\s{2,}|\t/).map((s) => s.trim()).includes(label));
    if (tokenExists) {
      info(`Token "${label}" existiert bereits. Sein Wert ist nicht erneut lesbar -`);
      info('  falls das Preview-Secret fehlt: Token in manage.sanity.io rotieren und');
      info('  `wrangler secret put SANITY_API_READ_TOKEN` von Hand setzen.');
      return;
    }
  }
  const out = await act({
    label: `Token "${label}" (role viewer) anlegen`,
    cmd: ['npx', 'sanity', 'tokens', 'add', label, '-p', projectId, '--role', 'viewer', '--json', '-y'],
    cwd: studioDir,
    capture: true,
    secret: true, // Ausgabe enthaelt den Token -> nicht anzeigen
  });
  if (DRY || !out) return;
  viewerToken = extractToken(out);
  if (!viewerToken) {
    warn('Token angelegt, aber Wert nicht aus der Ausgabe lesbar - Preview-Secret bitte manuell setzen.');
    return;
  }
  await persistEnv(); // schreibt .env / studio/.env (gitignored), OHNE zu loggen
  ok('Viewer-Token angelegt und in .env hinterlegt (Wert nicht geloggt).');
}

async function importSeed() {
  section('Seed-Import');
  // SCHUTZ: --replace ueberschreibt Dokumente mit gleicher _id (siteSettings,
  // homePage, example-*) - genau die, die ein Kunde spaeter editiert. Bei einem
  // bereits bestehenden Dataset daher NICHT automatisch importieren.
  if (datasetExisted && !FORCE_SEED) {
    warn('Dataset existierte bereits - Seed-Import UEBERSPRUNGEN (bestehende Inhalte bleiben).');
    info('  Ein Reimport ueberschreibt siteSettings/homePage/Seiten mit den Seed-Platzhaltern.');
    info('  Wirklich gewollt? Dann erneut mit --force-seed (Backup liegt bereits in backups/).');
    return;
  }
  await act({
    label:
      'Seed importieren (production, --replace)' +
      (datasetExisted ? '  [--force-seed: UEBERSCHREIBT bestehende Inhalte!]' : ''),
    cmd: ['npx', 'sanity', 'datasets', 'import', 'seed.ndjson', 'production', '-p', projectId, '--replace'],
    cwd: studioDir,
    // Immer confirmen (auch ausserhalb --yes greift das Gate nur ohne --yes;
    // beim Force-Reimport steht die Warnung oben + das Vorab-Backup davor).
    destructive: true,
  });
}

async function backupExport() {
  section('Backup-Export (Sicherheitsnetz)');
  const dir = path.join(root, 'backups');
  // Zeitstempel im Namen (kein --overwrite): jeder Lauf legt ein EIGENES Backup
  // an, ein zweiter Lauf zerstoert das erste nicht.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join('backups', `${slug || projectId}-${stamp}.tar.gz`);
  if (!DRY) await mkdir(dir, { recursive: true });
  await act({
    label: `Backup-Export nach ${outFile}`,
    cmd: ['npx', 'sanity', 'datasets', 'export', 'production', path.join(root, outFile), '-p', projectId],
    cwd: studioDir,
  });
}

async function deployStudio() {
  section('Studio-Deploy');
  await act({
    label: `Studio deployen -> https://${studioHost}.sanity.studio`,
    cmd: ['npx', 'sanity', 'deploy', '--url', studioHost, '-y'],
    cwd: studioDir,
    // Braucht die projectId zur Build-Zeit:
    extraEnv: { SANITY_STUDIO_PROJECT_ID: projectId, SANITY_STUDIO_DATASET: 'production' },
    destructive: true, // veroeffentlicht das Studio
  });
}

async function deployWorkers() {
  section('Cloudflare-Worker (Prod + Preview)');
  // Prod: statischer Build -> Assets-only-Worker.
  await act({
    label: 'Prod bauen (npm run build)',
    cmd: ['npm', 'run', 'build'],
    cwd: root,
    extraEnv: { PUBLIC_SANITY_PROJECT_ID: projectId, PUBLIC_SANITY_DATASET: 'production' },
  });
  await act({
    label: `Prod-Worker deployen (${slug || 'astro-starter'}-prod, *.workers.dev)`,
    cmd: ['npx', 'wrangler', 'deploy', '-c', 'wrangler.prod.jsonc'],
    cwd: root,
    destructive: true,
  });
  // Preview: SSR-Build ueber den Cloudflare-Adapter.
  await act({
    label: 'Preview bauen (npm run build:preview)',
    cmd: ['npm', 'run', 'build:preview'],
    cwd: root,
    extraEnv: { PUBLIC_SANITY_PROJECT_ID: projectId, PUBLIC_SANITY_DATASET: 'production' },
  });
  await act({
    label: `Preview-Worker deployen (${slug || 'astro-starter'}-preview, *.workers.dev)`,
    cmd: ['npx', 'wrangler', 'deploy'],
    cwd: root,
    destructive: true,
  });
}

async function setPreviewSecret() {
  section('Preview-Secret (nur Preview-Worker)');
  if (!viewerToken && !DRY) {
    info('Kein frischer Viewer-Token im Speicher - Secret-Schritt uebersprungen.');
    info('  Falls noetig: `npx wrangler deploy` lief; setze das Secret manuell mit');
    info('  `npx wrangler secret put SANITY_API_READ_TOKEN` (Wert = Viewer-Token).');
    return;
  }
  // Wert kommt ueber stdin (nie als Argument, nie geloggt).
  await act({
    label: 'wrangler secret put SANITY_API_READ_TOKEN (Preview-Worker)',
    cmd: ['npx', 'wrangler', 'secret', 'put', 'SANITY_API_READ_TOKEN'],
    cwd: root,
    input: viewerToken + '\n',
    secret: true,
    destructive: true,
  });
  // Der Prod-Worker bekommt NIE ein Token (statisch, published-only).
  info('Prod-Worker erhaelt bewusst KEIN Token (statisch, published-only).');
}

function queueManualSteps() {
  const previewUrl = previewDomain
    ? `https://${previewDomain}`
    : `https://${slug || 'astro-starter'}-preview.<account>.workers.dev`;

  manualSteps.push(
    ['Workers Builds (Auto-Deploy bei Push) einmalig im Cloudflare-Dashboard verbinden',
      [
        '1. Cloudflare-GitHub-App installieren, dieses Repo freigeben.',
        '2. Zwei Build-Verbindungen auf dasselbe Repo/Branch:',
        `   PROD:    build "npm run build"          deploy "npx wrangler deploy -c wrangler.prod.jsonc"`,
        `            Build-Var PUBLIC_SANITY_PROJECT_ID=${projectId}`,
        `   PREVIEW: build "npm run build:preview"  deploy "npx wrangler deploy"`,
        `            Build-Var PREVIEW_DEPLOY=1, PUBLIC_SANITY_PROJECT_ID=${projectId}`,
        '            KEIN Token als Build-Var/-Secret noetig: der Viewer-Token ist',
        '            bereits als Laufzeit-Secret gesetzt (wrangler secret put, siehe',
        '            unten) und ueberlebt jeden Redeploy. Prod bekommt nie ein Token.',
      ]],
    ['Custom-Domains setzen (braucht die Zone auf eurem Cloudflare-Account)',
      [
        `   PROD-Worker    -> ${prodDomain || '<kunde.de>'}`,
        `   PREVIEW-Worker -> ${previewDomain || '<kunde.preview.upgreight.dev>'}`,
      ]],
    ['Publish-Webhook (Sanity -> Prod-Rebuild) einrichten',
      [
        '   Deploy-Hook-URL der PROD-Workers-Builds-Verbindung im Dashboard kopieren, dann:',
        `   cd studio && npx sanity hooks create -p ${projectId}`,
        '     Name:    prod-deploy',
        '     URL:     <Deploy-Hook-URL aus Cloudflare>',
        '     Dataset: production',
        '     Trigger: on publish',
        '   (hooks create ist interaktiv; alternativ ueber die Management-API automatisierbar.)',
      ]],
  );

  // Studio muss auf die Preview-URL zeigen:
  manualSteps.push(
    ['Studio -> Preview-URL verdrahten (falls noch nicht via .env geschehen)',
      [
        `   studio/.env:  SANITY_STUDIO_PREVIEW_URL=${previewUrl}`,
        `   danach Studio erneut deployen: cd studio && npx sanity deploy --url ${studioHost} -y`,
        '   (--url noetig: das Template pinnt bewusst keinen studioHost in sanity.cli.ts.)',
      ]],
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Fuehrt einen Schritt aus - mit Dry-Run-Guard, Confirm-Gate und Secret-Redaktion.
async function act({ label, cmd, cwd, input, capture: cap = false, secret = false, destructive = false, extraEnv }) {
  const pretty = cmd.map((a) => (/[\s"']/.test(a) ? JSON.stringify(a) : a)).join(' ');
  const shown = secret ? `${pretty}   [Eingabe/Ausgabe redigiert]` : pretty;
  console.log(`\n• ${label}`);
  console.log(`    $ ${shown}`);
  if (extraEnv) {
    const keys = Object.keys(extraEnv).join(', ');
    console.log(`    env: ${keys}`);
  }
  if (DRY) {
    console.log('    (dry-run: nicht ausgefuehrt)');
    return null;
  }
  if (destructive && !AUTO_YES) {
    const answer = (await rl.question('    Ausfuehren? [y/N] ')).trim().toLowerCase();
    if (answer !== 'y' && answer !== 'yes' && answer !== 'j') {
      console.log('    uebersprungen.');
      return null;
    }
  }
  const res = spawnSync(cmd[0], cmd.slice(1), {
    cwd,
    input,
    encoding: 'utf8',
    env: extraEnv ? { ...env, ...extraEnv } : env,
    stdio: cap || secret || input ? ['pipe', 'pipe', 'pipe'] : ['inherit', 'inherit', 'inherit'],
  });
  if (res.status !== 0) {
    const err = secret ? '(Ausgabe redigiert)' : (res.stderr || res.stdout || '').trim();
    fail(`"${label}" fehlgeschlagen (exit ${res.status}).\n${err}`);
  }
  ok(`${label} - fertig.`);
  return cap ? res.stdout : null;
}

function capture(cmd, { cwd, allowFail = false } = {}) {
  const res = spawnSync(cmd[0], cmd.slice(1), { cwd, encoding: 'utf8' });
  if (res.status !== 0 && !allowFail) {
    fail(`Befehl fehlgeschlagen: ${cmd.join(' ')}\n${res.stderr || ''}`);
  }
  return res;
}

// Sucht den Token-Wert in der JSON-Ausgabe von `tokens add`, ohne den Feldnamen
// zu raten: nimmt den ersten String, der wie ein Sanity-Token aussieht (sk...).
function extractToken(out) {
  // Voll verankert: der Wert ist genau ein Sanity-Token, kein Vorspann, kein
  // eingebettetes Newline (sonst koennte ein manipulierter CLI-Output beim
  // Schreiben in .env eine zusaetzliche Zeile injizieren).
  const isToken = (v) => typeof v === 'string' && /^sk[A-Za-z0-9]{20,}$/.test(v);
  try {
    const obj = JSON.parse(out.match(/\{[\s\S]*\}/)?.[0] ?? out);
    for (const v of Object.values(obj)) {
      if (isToken(v)) return v;
    }
    if (isToken(obj.key)) return obj.key;
  } catch {
    const m = out.match(/\bsk[A-Za-z0-9]{20,}\b/);
    if (m && isToken(m[0])) return m[0];
  }
  return '';
}

// Schreibt die oeffentlichen Werte + das Secret in die gitignored .env-Dateien.
// Loggt NIE den Token-Wert. Bestehende Zeilen werden ersetzt, nicht dupliziert.
async function persistEnv() {
  const previewUrl = previewDomain ? `https://${previewDomain}` : 'http://localhost:4321';
  await upsertEnv(path.join(root, '.env'), {
    PUBLIC_SANITY_PROJECT_ID: projectId,
    PUBLIC_SANITY_DATASET: 'production',
    PUBLIC_SANITY_API_VERSION: '2024-10-01',
    SANITY_API_READ_TOKEN: viewerToken,
    SANITY_STUDIO_URL: `https://${studioHost}.sanity.studio`,
  });
  await upsertEnv(path.join(studioDir, '.env'), {
    SANITY_STUDIO_PROJECT_ID: projectId,
    SANITY_STUDIO_DATASET: 'production',
    SANITY_STUDIO_PREVIEW_URL: previewUrl,
  });
}

async function upsertEnv(file, kv) {
  let text = '';
  try {
    text = await readFile(file, 'utf8');
  } catch {
    /* neue Datei */
  }
  for (const [k, v] of Object.entries(kv)) {
    if (v === undefined || v === '') continue;
    // Werte mit Newline wuerden zusaetzliche .env-Zeilen injizieren - ablehnen.
    if (/[\r\n]/.test(String(v))) {
      warn(`Wert fuer ${k} enthaelt Zeilenumbrueche - uebersprungen (nicht in .env geschrieben).`);
      continue;
    }
    const line = `${k}=${v}`;
    const re = new RegExp(`^${k}=.*$`, 'm');
    // Ersatz als FUNKTION: String.replace wuerde sonst $-Muster ($&, $1, …) im
    // Wert interpretieren.
    text = re.test(text) ? text.replace(re, () => line) : (text + (text.endsWith('\n') || text === '' ? '' : '\n') + line + '\n');
  }
  await writeFile(file, text.endsWith('\n') ? text : text + '\n');
}

// ---------------------------------------------------------------------------
// Ausgabe
// ---------------------------------------------------------------------------
function banner() {
  console.log(`\nupgreight provisioning  ${DRY ? '(DRY-RUN - nichts wird angefasst)' : '(EXECUTE)'}`);
  console.log(`  Projekt-Titel : ${studioTitle}`);
  console.log(`  Projekt-ID    : ${projectId || '(wird angelegt)'}`);
  console.log(`  Studio-Host   : ${studioHost}.sanity.studio`);
  console.log(`  Prod-Domain   : ${prodDomain || '(nur *.workers.dev)'}`);
  console.log(`  Preview-Domain: ${previewDomain || '(nur *.workers.dev)'}`);
  if (DRY) console.log('\n  -> Fuer echten Lauf: --execute anhaengen. Einzel-Confirms je Kostenschritt.');
}

function summary() {
  console.log('\n' + '─'.repeat(68));
  console.log(DRY ? 'DRY-RUN fertig. Nichts angelegt.' : 'Provisioning-Lauf fertig.');
  console.log(`  Studio : https://${studioHost}.sanity.studio`);
  console.log(`  Preview: ${previewDomain ? 'https://' + previewDomain : '*.workers.dev (siehe wrangler-Ausgabe)'}`);
  console.log(`  Prod   : ${prodDomain ? 'https://' + prodDomain : '*.workers.dev (siehe wrangler-Ausgabe)'}`);
  console.log(`\n  Backup jederzeit erneuern:`);
  console.log(`    cd studio && npx sanity datasets export production ../backups/${slug || projectId}-<datum>.tar.gz -p ${projectId || '<id>'}`);

  console.log('\nMANUELLE FOLGE-SCHRITTE (dashboard-/zonengebunden - bewusst nicht automatisiert):');
  manualSteps.forEach(([title, lines], i) => {
    console.log(`\n  ${i + 1}. ${title}`);
    for (const l of lines) console.log(`     ${l}`);
  });
  console.log('\n  Danach abschliessend: /security-review ueber scripts/provision.mjs laufen lassen.');
  console.log('─'.repeat(68) + '\n');
}

function section(t) {
  console.log(`\n### ${t}`);
}
const info = (m) => console.log(`    ${m}`);
const ok = (m) => console.log(`    ✓ ${m}`);
const warn = (m) => console.log(`    ! ${m}`);

function fail(m) {
  console.error(`\nAbbruch: ${m}\n`);
  try { rl.close(); } catch {}
  exit(1);
}

async function assertExists(p, msg) {
  try {
    await access(p);
  } catch {
    fail(msg);
  }
}

// ---------------------------------------------------------------------------
function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function titleCase(slug) {
  return slug.split('-').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') || 'Sanity Project';
}
function stripScheme(s) {
  return s.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function printHelpAndExit() {
  console.log(`
upgreight Astro provisioning - Sanity + Cloudflare in einem Lauf.

  node scripts/provision.mjs --name <slug> [flags]        (DRY-RUN, Default)
  node scripts/provision.mjs --name <slug> [flags] --execute

Flags:
  --name <slug>            Projekt-Slug (Pflicht, ausser --project-id)
  --project-id <id>        bestehendes Sanity-Projekt wiederverwenden
  --org <slug|id>          Sanity-Organisation
  --prod-domain <host>     Produktions-Domain (kunde.de)
  --preview-domain <host>  Preview-Domain (kunde.preview.upgreight.dev)
  --studio-host <host>     Studio-Hostname (kunde -> kunde.sanity.studio)
  --execute                tatsaechlich ausfuehren (sonst nur Plan drucken)
  --yes                    Confirm-Prompts vorab bejahen
  --force-seed             Seed auch in ein befuelltes Dataset (UEBERSCHREIBT!)
  --help

Sicherheit: Dry-Run ist Default. Secrets werden nie geloggt. Idempotent.
Auth via bereits eingeloggte CLIs (sanity login / wrangler login).
`);
  exit(0);
}

main().catch((e) => fail(e?.stack || e?.message || String(e)));
