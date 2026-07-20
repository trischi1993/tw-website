import { at, set } from '@sanity/mutate';
import type { useDocuments } from '@sanity/visual-editing/react';

const HISTORY_LIMIT = 10;
type SectionsSnapshot = unknown[];
type DocumentHistory = { undo: SectionsSnapshot[]; redo: SectionsSnapshot[]; queue: Promise<void> };

const histories = new Map<string, DocumentHistory>();

function cloneSections(snapshot: unknown): SectionsSnapshot | null {
  const sections = (snapshot as { sections?: unknown } | null)?.sections;
  return Array.isArray(sections) ? JSON.parse(JSON.stringify(sections)) : null;
}

function historyFor(documentId: string): DocumentHistory {
  let history = histories.get(documentId);
  if (!history) {
    history = { undo: [], redo: [], queue: Promise.resolve() };
    histories.set(documentId, history);
  }
  return history;
}

/** Record the document immediately before a canvas mutation. */
export function recordHistory(documentId: string, snapshot: unknown): void {
  const sections = cloneSections(snapshot);
  if (!sections) return;
  const history = historyFor(documentId);
  history.undo.push(sections);
  if (history.undo.length > HISTORY_LIMIT) history.undo.shift();
  history.redo.length = 0;
}

export function applyHistory(
  getDocument: ReturnType<typeof useDocuments>['getDocument'],
  documentId: string,
  direction: 'undo' | 'redo',
): Promise<void> {
  const history = historyFor(documentId);
  const run = async () => {
    const source = direction === 'undo' ? history.undo : history.redo;
    const target = direction === 'undo' ? history.redo : history.undo;
    const previous = source.pop();
    if (!previous) return;

    try {
      const documentStore = getDocument(documentId);
      const snapshot = await documentStore.getSnapshot();
      const current = cloneSections(snapshot);
      if (!current) {
        source.push(previous);
        return;
      }
      documentStore.patch([at('sections', set(previous))] as never);
      target.push(current);
      if (target.length > HISTORY_LIMIT) target.shift();
      window.dispatchEvent(new CustomEvent('upgreight:history-applied'));
    } catch (error) {
      source.push(previous);
      if (import.meta.env.DEV) console.warn('EditorHistory: history action failed', error);
    }
  };

  history.queue = history.queue.then(run, run);
  return history.queue;
}
