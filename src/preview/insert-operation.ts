import { at, insert, set } from '@sanity/mutate';
import type { Insertable } from './insertables';
import { createInsertable } from './insertables';
import { resolveSelection, topSectionKey } from './editor-ops';

type KeyedBlock = { _key: string; _type: string } & Record<string, unknown>;

/** Build the context-aware mutation for one command-palette insertion. */
export function createInsertPatch(
  snapshot: Record<string, unknown>,
  selectionPath: string | null,
  insertable: Insertable,
  block: KeyedBlock,
): object {
  const sections = (snapshot.sections as Array<{ _key: string }> | undefined) ?? [];
  const selection = selectionPath ? resolveSelection(snapshot, selectionPath) : null;

  if (insertable.category === 'section') {
    const selectedSectionKey = selectionPath ? topSectionKey(selectionPath) : null;
    if (selectedSectionKey && sections.some((section) => section._key === selectedSectionKey)) {
      return at('sections', insert([block], 'after', { _key: selectedSectionKey }));
    }
    return sections.length
      ? at('sections', insert([block], 'after', { _key: sections.at(-1)!._key }))
      : at('sections', set([block]));
  }

  if (selection?.parentArrayPath === 'sections') {
    const content = Array.isArray(selection.item.content) ? selection.item.content : null;
    if (!content) throw new Error('In dieser Section kann dieser Block nicht eingefügt werden.');
    const contentPath = `${selection.itemPath}.content`;
    return content.length
      ? at(contentPath, insert([block], 'after', { _key: content.at(-1)!._key }))
      : at(contentPath, set([block]));
  }

  if (selection?.parentArrayPath.endsWith('.content')) {
    return at(
      selection.parentArrayPath,
      insert([block], 'after', { _key: selection.item._key }),
    );
  }

  if (sections.length) {
    const fallback = [...sections].reverse().find((section) =>
      Array.isArray((section as { content?: unknown }).content),
    ) as { _key: string; content: Array<{ _key: string }> } | undefined;
    if (!fallback) throw new Error('Keine Section mit passendem Content-Bereich gefunden.');
    const contentPath = `sections[_key=="${fallback._key}"].content`;
    return fallback.content.length
      ? at(contentPath, insert([block], 'after', { _key: fallback.content.at(-1)!._key }))
      : at(contentPath, set([block]));
  }

  const section = createInsertable('sectionText') as {
    _key: string;
    content: Array<Record<string, unknown>>;
  };
  section.content = [block];
  return at('sections', set([section]));
}
