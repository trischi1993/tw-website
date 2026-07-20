# Patches

Werden bei `npm install` automatisch via `patch-package` angewendet
(`postinstall`-Script in package.json). Solange hier Patches liegen, bleiben
die betroffenen Pakete in package.json **exakt gepinnt** (kein `^`).

## `@sanity/visual-editing@5.4.5` — perspective-Race-Fix

**Datei:** `dist/react/index.js` (Hook `usePresentationQuery`)

**Symptom:** Im Presentation-Tool erscheinen Tipp-Änderungen NICHT sofort in
der Vorschau, sondern erst nach dem ~1–2 s Save-Roundtrip. Einmaliges
Committen eines Feldes „entsperrt" die Instant-Updates für den Rest der
Session.

**Ursache:** Der Subscribe-Effect von `usePresentationQuery` sendet
`loader/query-listen` nur, wenn `projectId`, `dataset` UND `perspective`
gesetzt sind — hängt aber nur von `[comlink]` ab. Er feuert also in dem
Moment, in dem der Loader-Comlink verbindet, einen Tick BEVOR `perspective`
ankommt → Subscribe wird übersprungen, Retry erst mit dem 20-s-Heartbeat.

**Fix (eine Zeile):** `perspective` in das Dependency-Array des Effects
aufnehmen, sodass er erneut feuert, sobald die Perspektive da ist.

**Herkunft:** flowtricks/remarkable (`patches/@sanity+visual-editing+5.4.5.patch`,
Hunk 1 von 4; die übrigen drei Hunks sind Studio-UX-Politur → ggf. Phase B).
Stand 2026-07-09 upstream weder in einem Release (letztes: 5.4.5 vom
2026-07-03) noch auf `main` gefixt (Effect-Deps dort weiterhin `[comlink]`,
siehe `packages/visual-editing/src/react/usePresentationQuery.ts`).

**Entfernen**, sobald eine @sanity/visual-editing-Version erscheint, deren
Subscribe-Effect auf `perspective` reagiert — vor jedem Versions-Bump prüfen.
