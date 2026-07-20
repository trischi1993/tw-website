/**
 * Vorschau-Seite des Hover-Preview-Kanals (Phase B.2). Gegenstück zu
 * studio/components/inputs/hover-bridge.ts.
 *
 * Läuft in der Live-Island IM Presentation-iframe. Wir SIND das iframe, also
 * ist window.parent das Studio - deshalb sitzt HIER der comlink-Controller
 * (Handshake-Initiator, hält das Ziel-Window = window.parent) und drüben im
 * Studio der passive Node (umgekehrt zu Presentations eigenem Kanal, dessen
 * iframe das Studio besitzt).
 *
 * Empfängt { key, field, value } und macht daraus einen rein visuellen Flip auf
 * dem Abschnitts-DOM (data-section-key) - kein React-Re-Render, kein Patch.
 * Dank Token-System ist der Farbton-Flip ein Klassen-Swap auf EINEM Element:
 * alle Kinder folgen den Surface-Tokens (--surface/--on-surface/--line...).
 * Ein neuer Hover oder Mouse-out (hover-end) stellt den echten Stand wieder her.
 *
 * Vollständig fail-open und isoliert: Bricht der Kanal, läuft die Live-Vorschau
 * unverändert weiter - nur das Hover-Preview fehlt. Kein Effekt auf Prod: die
 * Island (und damit dieses Modul) lädt ausschließlich im Draft-Mode-Vorschau-Build.
 */
import { createController } from '@sanity/comlink';
import {
  SECTION_PAD,
  SECTION_GAP,
  alignValue,
  HEADING_SIZE_CLASS,
  PARAGRAPH_SIZE_CLASS,
  COLOR_CLASS,
  wrapStyle,
  spaceVar,
  CTA_VARIANT_CLASS,
} from '../lib/content/sections';
import type {
  AlignToken,
  HeadingSize,
  ParagraphSize,
  TextColor,
  TextWrapToken,
  SpaceToken,
  CtaVariant,
} from '../lib/content/types';
import type { EditorAction } from '../../shared/editor-actions';

/** MUSS mit studio/components/inputs/hover-bridge.ts (HoverToPreview) übereinstimmen. */
type StudioToPreview =
  | {
      type: 'hover';
      data: { key: string; field: string; value: string; elPath?: string };
      response?: undefined;
    }
  | { type: 'hover-end'; data?: undefined; response?: undefined }
  // Klick übernommen: Flip stehen lassen (Revert verwerfen), bis die Live-Query
  // konvergiert - siehe studio/components/inputs/hover-bridge.ts (commitHover).
  | { type: 'hover-commit'; data?: undefined; response?: undefined }
  // Aus dem Studio-Fenster: cmd+E bei Fokus im Studio → Palette im iframe öffnen.
  | { type: 'open-palette'; data?: undefined; response?: undefined }
  | {
      type: 'editor-command';
      data: { action: EditorAction };
      response?: undefined;
    };

type PreviewToStudio = { type: 'canvas-select'; data?: undefined; response?: undefined };

const DOMAIN = 'upgreight/hover';
let started = false;
let postCanvasSelection: (() => void) | null = null;

/** Arm the Studio autofocus guard after a real canvas selection. */
export function sendCanvasSelection(): void {
  try {
    postCanvasSelection?.();
  } catch {
    /* fail-open */
  }
}

export function startHoverChannel(studioUrl: string): void {
  if (started) return;
  if (typeof window === 'undefined' || window.parent === window) return;

  let targetOrigin: string;
  try {
    targetOrigin = new URL(studioUrl).origin;
  } catch {
    return; // ohne validen Studio-Origin kein Kanal (fail-open)
  }
  started = true;

  try {
    const controller = createController({ targetOrigin });
    controller.addTarget(window.parent);
    const channel = controller.createChannel<PreviewToStudio, StudioToPreview>({
      name: 'preview-island',
      connectTo: 'studio-hover',
      domain: DOMAIN,
      heartbeat: true,
    });

    let restore: (() => void) | null = null;
    const clear = () => {
      if (restore) {
        restore();
        restore = null;
      }
    };

    channel.on('hover', (data) => {
      clear();
      if (data) restore = applyFlip(data.key, data.field, data.value, data.elPath);
      return undefined;
    });
    channel.on('hover-end', () => {
      clear();
      return undefined;
    });
    // Klick übernommen: Flip STEHEN lassen (Restore verwerfen, nicht ausführen).
    // Der visuelle Stand bleibt, bis die Live-Query React konvergiert - kein
    // Rücksprung bei Mouse-out (wichtig für unset-Felder, die nicht in der
    // Source-Map stehen und erst nach dem Commit-Refetch streamen).
    channel.on('hover-commit', () => {
      restore = null;
      return undefined;
    });
    // cmd+E aus dem Studio-Fenster: an InsertPalette weiterreichen (entkoppelt
    // über ein DOM-Event, damit dieser Kanal nichts von der Palette wissen muss).
    channel.on('open-palette', () => {
      try {
        window.dispatchEvent(new CustomEvent('upgreight:insert-palette'));
      } catch {
        /* fail-open */
      }
      return undefined;
    });
    channel.on('editor-command', (data) => {
      try {
        if (data?.action) {
          window.dispatchEvent(
            new CustomEvent('upgreight:editor-command', { detail: data.action }),
          );
        }
      } catch {
        /* fail-open */
      }
      return undefined;
    });
    postCanvasSelection = () => channel.post('canvas-select');
    channel.start();
  } catch {
    /* fail-open */
  }
}

function sectionEl(key: string): HTMLElement | null {
  const safe = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(key) : key;
  return document.querySelector<HTMLElement>(`[data-section-key="${safe}"]`);
}

/** Element per exaktem data-el-path finden (Vergleich statt Selektor - der Pfad
 *  enthält Anführungszeichen/Klammern, die im Attribut-Selektor Sonderzeichen
 *  wären). Nur wenige Elemente im DOM → linearer Scan ist unkritisch. */
function elByPath(elPath: string): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>('[data-el-path]');
  for (const n of nodes) if (n.getAttribute('data-el-path') === elPath) return n;
  return null;
}

/** Eine Klasse aus einer Token-Map gegen eine andere tauschen; liefert Restore. */
function swapClass(el: HTMLElement, map: Record<string, string>, value: string): () => void {
  const before = el.className;
  const next = map[value];
  for (const c of Object.values(map)) if (c) el.classList.remove(c);
  if (next) el.classList.add(next);
  return () => {
    el.className = before;
  };
}

/** Eine Inline-CSS-Property setzen/entfernen; liefert Restore. */
function setInline(el: HTMLElement, prop: string, css: string | undefined): () => void {
  const before = el.style.getPropertyValue(prop);
  if (css) el.style.setProperty(prop, css);
  else el.style.removeProperty(prop);
  return () => {
    if (before) el.style.setProperty(prop, before);
    else el.style.removeProperty(prop);
  };
}

/**
 * Per-Element-Flip (Überschrift/Absatz): size/color → Klassen-Swap, textWrap/
 * marginBottom → Inline-Style. `level` ändert nur das HTML-Tag (SEO) und hat
 * keine optische Wirkung → bewusst No-op; `maxWidth` ist ein Slider (kein Hover,
 * der Canvas-Resizer macht das live). Die Maps/Funktionen spiegeln exakt
 * HeadingElement.tsx / ParagraphElement.tsx.
 */
function applyElementFlip(el: HTMLElement, field: string, value: string): (() => void) | null {
  const kind = el.getAttribute('data-el-kind');
  switch (field) {
    case 'variant':
      if (kind !== 'cta') return null;
      return swapClass(el, CTA_VARIANT_CLASS as Record<CtaVariant, string>, value);
    case 'size':
      return swapClass(
        el,
        kind === 'paragraph'
          ? (PARAGRAPH_SIZE_CLASS as Record<ParagraphSize, string>)
          : (HEADING_SIZE_CLASS as Record<HeadingSize, string>),
        value,
      );
    case 'color':
      return swapClass(el, COLOR_CLASS as Record<TextColor, string>, value);
    case 'textWrap':
      return setInline(el, 'text-wrap', wrapStyle(value as TextWrapToken));
    case 'marginBottom':
      return setInline(el, 'margin-bottom', spaceVar(value as SpaceToken));
    default:
      return null; // level / maxWidth / Unbekanntes → kein Flip (fail-open)
  }
}

/**
 * Wendet den visuellen Override an und liefert die Aufräum-Funktion (oder null,
 * wenn nichts anzuwenden war). Zwei Ebenen:
 *  - Per-Element (elPath trifft ein data-el-path): heading/paragraph-Controls.
 *  - Section-Level (Fallback über data-section-key): tone/padding/gap/align.
 * Unbekannte Felder ignorieren wir bewusst - dann bleibt es beim Klick → echter
 * Patch → Live-Query (kein Hover-Preview, aber nichts kaputt).
 *
 * Die Klassen/Properties spiegeln exakt das Mapping in sectionShellProps /
 * HeadingElement / ParagraphElement (src/lib/content/sections.ts).
 */
function applyFlip(
  key: string,
  field: string,
  value: string,
  elPath?: string,
): (() => void) | null {
  // Per-Element zuerst: trifft elPath eine Überschrift/einen Absatz im DOM,
  // flippt genau dieses Element (nicht die Section).
  if (elPath) {
    const el = elByPath(elPath);
    if (el) return applyElementFlip(el, field, value);
  }

  const root = sectionEl(key);
  if (!root) return null;

  if (field === 'tone') {
    // dark -> .on-dark, alt -> .is-alt, brand -> .on-brand, light -> (keine
    // Klasse). Alle Kinder folgen den Surface-Tokens -> ein Klassen-Swap genügt.
    const before = root.className;
    root.classList.remove('on-dark', 'is-alt', 'on-brand');
    if (value === 'dark') root.classList.add('on-dark');
    else if (value === 'alt') root.classList.add('is-alt');
    else if (value === 'brand') root.classList.add('on-brand');
    return () => {
      root.className = before;
    };
  }

  // Vertikaler Abstand: token -> CSS-Var als Inline-Style (exakt wie der Render).
  if (field === 'paddingTop' || field === 'paddingBottom') {
    const css = SECTION_PAD[value as keyof typeof SECTION_PAD];
    if (!css) return null;
    const prop = field === 'paddingTop' ? 'padding-top' : 'padding-bottom';
    const before = root.style.getPropertyValue(prop);
    root.style.setProperty(prop, css);
    return () => {
      if (before) root.style.setProperty(prop, before);
      else root.style.removeProperty(prop);
    };
  }

  // Innenabstand zwischen den Blöcken: --section-gap flippen (Kinder lesen es).
  if (field === 'gap') {
    const css = SECTION_GAP[value as keyof typeof SECTION_GAP];
    if (!css) return null;
    const before = root.style.getPropertyValue('--section-gap');
    root.style.setProperty('--section-gap', css);
    return () => {
      if (before) root.style.setProperty('--section-gap', before);
      else root.style.removeProperty('--section-gap');
    };
  }

  // Ausrichtung: --alignment auf dem Section-Root flippen (Content-Stack liest es
  // für align-items + text-align → eine Property, alle Kinder folgen).
  if (field === 'align') {
    const css = alignValue(value as AlignToken);
    const before = root.style.getPropertyValue('--alignment');
    if (css) root.style.setProperty('--alignment', css);
    else root.style.removeProperty('--alignment');
    return () => {
      if (before) root.style.setProperty('--alignment', before);
      else root.style.removeProperty('--alignment');
    };
  }

  // Section-Level-Feld ohne Flip (fullHeight) oder Unbekanntes → No-op. Per-
  // Element-Controls (size/color/textWrap/marginBottom) laufen oben über elPath.
  return null;
}
