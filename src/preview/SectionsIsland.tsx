import { useEffect, useMemo, useRef } from 'react';
import {
  createDataAttribute,
  useOptimistic,
  usePresentationQuery,
} from '@sanity/visual-editing/react';
import SectionsList, { type EditAttr } from '../components/sections/SectionsList';
import {
  HOME_SECTIONS_QUERY,
  PAGE_SECTIONS_QUERY,
  baseIdOf,
  mapSections,
} from '../lib/content/sections';
import { liveDocumentIds, activePreviewDoc } from './live-docs';
import { startHoverChannel } from './hover-channel';
import type { Section } from '../lib/content/types';
import type { Locale } from '../lib/i18n';

/* ---------------------------------------------------------------------------
   Live-Island der Vorschau - der Millisekunden-Pfad.

   Läuft NUR im Vorschau-Build im Draft-Mode (src/preview/SectionsHost.astro,
   `client:only`). Zwei Schichten, dem verifizierten Muster aus
   flowtricks/remarkable folgend (docs/sanity-live-editing-architecture.md §9):

   1. `usePresentationQuery`: Das Studio streamt pending Draft-Änderungen
      (jeden Tastenanschlag, vor dem Speichern) per comlink/postMessage in den
      iframe - kein Server-Roundtrip. Braucht den perspective-Race-Patch
      (patches/README.md), sonst greifen Updates erst nach dem ersten Commit.
   2. `useOptimistic`: Vorschau-seitige Mutationen aus dem Overlay (Drag-
      Reorder, Duplizieren, Löschen) erscheinen sofort lokal, statt auf den
      Content-Lake-Roundtrip zu warten.

   Das Visual-Editing-Overlay selbst (<VisualEditing>: Klick-Overlays,
   History-Brücke, Refresh) mountet SEITENWEIT in src/preview/PreviewBridge.tsx
   (#preview-extras-Seam im BaseLayout) - beide Islands teilen sich im selben
   Vite-Build dieselben Modul-Instanzen, deshalb sieht `useOptimistic` hier den
   Actor, den die Brücke setzt. Nichts aus @sanity/visual-editing lazy laden
   (Remarkable-Learning, Plan A.5).

   Click-to-edit läuft über explizite data-sanity-Attribute
   (`createDataAttribute`, stega bleibt aus - Plan A.4).
   --------------------------------------------------------------------------- */

interface RawSectionsDoc {
  _id: string;
  _type: string;
  sections?: unknown[];
}

interface Props {
  /** Server-gerenderte Startdaten (bereits gemappt) - bis die Live-Query liefert. */
  initialSections: Section[];
  /** Basis-ID des Dokuments (ohne drafts.-Präfix, normalisiert der Server). */
  documentId: string;
  documentType: 'homePage' | 'page';
  slug?: string;
  locale: Locale;
  /** Studio-URL für die data-sanity-Attribute. */
  studioUrl: string;
}

export default function SectionsIsland({
  initialSections,
  documentId,
  documentType,
  slug,
  locale,
  studioUrl,
}: Props) {
  // Bei der Brücke anmelden: Mutationen an diesem Dokument brauchen keinen
  // Full-Reload, die Live-Query unten deckt sie ab (siehe PreviewBridge).
  useEffect(() => {
    liveDocumentIds.add(documentId);
    // Ziel fürs cmd+E-Einfügen (eine Seite = ein Sections-Dokument).
    activePreviewDoc.current = { id: documentId, type: documentType };
    return () => {
      liveDocumentIds.delete(documentId);
      if (activePreviewDoc.current?.id === documentId) activePreviewDoc.current = null;
    };
  }, [documentId, documentType]);

  // Hover-Preview-Kanal (Phase B.2): eigener comlink-Controller zum Studio-
  // Parent, empfängt {key,field,value} und flippt visuell. Idempotent + fail-
  // open (src/preview/hover-channel.ts).
  useEffect(() => {
    startHoverChannel(studioUrl);
  }, [studioUrl]);

  const { query, params } = useMemo(
    () =>
      documentType === 'homePage'
        ? { query: HOME_SECTIONS_QUERY, params: { lang: locale } }
        : { query: PAGE_SECTIONS_QUERY, params: { lang: locale, slug: slug ?? '' } },
    [documentType, locale, slug],
  );

  // 1) Live-Resultate aus dem Studio-Loader. stega bewusst aus: Click-to-edit
  //    kommt von den expliziten data-sanity-Attributen unten, nicht von
  //    unsichtbaren Zeichen in den Strings.
  const live = usePresentationQuery({ query, params, stega: false });

  // Letztes Nicht-Null-Resultat halten, damit ein transienter null-Frame nicht
  // mitten im Tippen auf den älteren Server-Stand zurückblitzt.
  const lastLive = useRef<RawSectionsDoc | null>(null);
  if (live.data) lastLive.current = live.data as RawSectionsDoc;
  const base = lastLive.current;

  // 2) Optimistic-Schicht: Overlay-Mutationen (Reorder/Duplizieren/Löschen)
  //    sofort anwenden, wenn sie dieses Dokument betreffen.
  const doc = useOptimistic<RawSectionsDoc | null, RawSectionsDoc>(
    base,
    (state, action) => {
      const matches =
        baseIdOf(action.id) === documentId || baseIdOf(action.originalId) === documentId;
      if (matches && action.document) return action.document;
      return state;
    },
  );

  const sections = useMemo(
    () => (doc?.sections ? mapSections(doc.sections) : initialSections),
    [doc, initialSections],
  );

  // Click-to-edit-Attribute: GROQ-Pfad → data-sanity. Pro Aufruf frisch
  // erzeugt (Remarkable-Muster); die Overlays lesen daraus Dokument + Feld.
  const edit = useMemo<EditAttr>(
    () => (fieldPath: string) => ({
      'data-sanity': createDataAttribute({
        projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
        dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
        baseUrl: studioUrl,
        id: documentId,
        type: documentType,
        path: fieldPath,
      }).toString(),
    }),
    [documentId, documentType, studioUrl],
  );

  return <SectionsList sections={sections} edit={edit} />;
}
