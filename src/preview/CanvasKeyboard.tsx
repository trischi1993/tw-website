import { useEffect, useRef } from 'react';
import { useDocuments } from '@sanity/visual-editing/react';
import { at, insert, set, truncate } from '@sanity/mutate';
import { activePreviewDoc } from './live-docs';
import { sendCanvasSelection } from './hover-channel';
import { selectElementByKey } from './select-section';
import { lastKeyOf, reKey, resolveSelection, topSectionKey } from './editor-ops';
import { applyHistory, recordHistory } from './editor-history';
import { editorActionForKey, type EditorAction } from '../../shared/editor-actions';

type Selection = { id: string; path: string };

function isEditableTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  const active = element?.ownerDocument?.activeElement as HTMLElement | null;
  for (const node of [element, active]) {
    if (!node?.tagName) continue;
    const tag = node.tagName.toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (node.isContentEditable || node.closest?.('[contenteditable="true"], [role="textbox"]')) {
      return true;
    }
  }
  return false;
}

function hasTextSelection(): boolean {
  const selection = document.getSelection?.();
  return !!selection && !selection.isCollapsed && selection.toString().trim().length > 0;
}

function selectedPath(target: EventTarget | null): string | null {
  const element = (target as Element | null)?.closest<HTMLElement>(
    '[data-el-path], [data-section-key]',
  );
  const elementPath = element?.getAttribute('data-el-path');
  if (elementPath) return elementPath;
  const sectionKey = element?.getAttribute('data-section-key');
  return sectionKey ? `sections[_key=="${sectionKey}"]` : null;
}

/**
 * Keyboard editing for the current Presentation canvas selection. All writes use
 * the same optimistic document actor as drag reorder and the canvas resizers.
 */
export default function CanvasKeyboard() {
  const { getDocument } = useDocuments();
  const getDocumentRef = useRef(getDocument);
  getDocumentRef.current = getDocument;

  const selectionRef = useRef<Selection | null>(null);
  const clipboardRef = useRef<{ item: Record<string, unknown>; isSection: boolean } | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const run = async (action: EditorAction) => {
      const selection = selectionRef.current;
      if (!selection || busyRef.current) return;
      busyRef.current = true;
      try {
        const documentStore = getDocumentRef.current(selection.id);
        const snapshot = await documentStore.getSnapshot();
        if (!snapshot) return;
        const resolved = resolveSelection(snapshot, selection.path);
        if (!resolved) return;
        const { item, itemPath, parentArray, parentArrayPath, index } = resolved;
        const patch = (patches: object[]) => {
          recordHistory(selection.id, snapshot);
          documentStore.patch(patches as never);
        };

        if (action === 'copy') {
          clipboardRef.current = {
            item: JSON.parse(JSON.stringify(item)) as Record<string, unknown>,
            isSection: parentArrayPath === 'sections',
          };
          return;
        }

        if (action === 'delete') {
          const nextKey =
            index > 0
              ? parentArray[index - 1]?._key
              : parentArray.length > 1
                ? parentArray[index + 1]?._key
                : lastKeyOf(parentArrayPath);
          patch([at(parentArrayPath, truncate(index, index + 1))]);
          selectionRef.current = null;
          if (nextKey) selectElementByKey(nextKey);
          return;
        }

        if (action === 'duplicate') {
          const clone = reKey(item);
          patch([
            at(parentArrayPath, insert([clone], 'after', { _key: item._key })),
          ]);
          return;
        }

        const copied = clipboardRef.current;
        if (!copied) return;
        const fresh = reKey(copied.item) as { _key: string; [key: string]: unknown };
        const selectedIsSection = parentArrayPath === 'sections';

        if (!copied.isSection && selectedIsSection) {
          const children = Array.isArray(item.content) ? item.content : null;
          if (!children) return;
          const contentPath = `${itemPath}.content`;
          const patch = children.length
            ? at(contentPath, insert([fresh], 'after', { _key: children.at(-1)!._key }))
            : at(contentPath, set([fresh]));
          recordHistory(selection.id, snapshot);
          documentStore.patch([patch] as never);
          return;
        }

        if (copied.isSection) {
          const sectionKey = selectedIsSection ? item._key : topSectionKey(selection.path);
          const sections = (snapshot as { sections?: Array<{ _key: string }> }).sections ?? [];
          const patch = sectionKey
            ? at('sections', insert([fresh], 'after', { _key: sectionKey }))
            : sections.length
              ? at('sections', insert([fresh], 'after', { _key: sections.at(-1)!._key }))
              : at('sections', set([fresh]));
          recordHistory(selection.id, snapshot);
          documentStore.patch([patch] as never);
          return;
        }

        patch([
          at(parentArrayPath, insert([fresh], 'after', { _key: item._key })),
        ]);
      } catch (error) {
        if (import.meta.env.DEV) console.warn('CanvasKeyboard: command failed', error);
      } finally {
        busyRef.current = false;
      }
    };

    const move = async (direction: 'previous' | 'next') => {
      const selection = selectionRef.current;
      if (!selection || busyRef.current) return;
      busyRef.current = true;
      try {
        const documentStore = getDocumentRef.current(selection.id);
        const snapshot = await documentStore.getSnapshot();
        if (!snapshot) return;
        const resolved = resolveSelection(snapshot, selection.path);
        if (!resolved) return;
        const { item, parentArray, parentArrayPath, index } = resolved;
        if (direction === 'previous' && index > 0) {
          recordHistory(selection.id, snapshot);
          documentStore.patch([
            at(parentArrayPath, truncate(index, index + 1)),
            at(parentArrayPath, insert(item, 'before', index - 1)),
          ] as never);
        } else if (direction === 'next' && index < parentArray.length - 1) {
          recordHistory(selection.id, snapshot);
          documentStore.patch([
            at(parentArrayPath, truncate(index, index + 1)),
            at(parentArrayPath, insert(item, 'after', index)),
          ] as never);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.warn('CanvasKeyboard: reorder failed', error);
      } finally {
        busyRef.current = false;
      }
    };

    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest('[data-insert-palette]')) return;
      const path = selectedPath(event.target);
      const active = activePreviewDoc.current;
      selectionRef.current = path && active ? { id: active.id, path } : null;
      if (selectionRef.current) sendCanvasSelection();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (document.querySelector('[data-insert-palette]')) return;
      if (event.key === 'Escape') {
        selectionRef.current = null;
        return;
      }

      const action = editorActionForKey(event);
      if (action) {
        if (isEditableTarget(event.target)) return;
        if (action === 'copy' && hasTextSelection()) return;
        if (action === 'undo' || action === 'redo') {
          const active = activePreviewDoc.current;
          if (!active) return;
          event.preventDefault();
          event.stopPropagation();
          void applyHistory(getDocumentRef.current, active.id, action);
          return;
        }
        if (!selectionRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        void run(action);
        return;
      }

      if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
      const direction =
        event.key === 'ArrowUp' ? 'previous' : event.key === 'ArrowDown' ? 'next' : null;
      if (!direction || !selectionRef.current || isEditableTarget(document.activeElement)) return;
      event.preventDefault();
      event.stopPropagation();
      void move(direction);
    };

    const onForwardedCommand = (event: Event) => {
      const action = (event as CustomEvent<EditorAction>).detail;
      if (action === 'undo' || action === 'redo') {
        const active = activePreviewDoc.current;
        if (active) void applyHistory(getDocumentRef.current, active.id, action);
      } else if (action) {
        void run(action);
      }
    };

    const onHistoryApplied = () => {
      selectionRef.current = null;
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('upgreight:editor-command', onForwardedCommand);
    window.addEventListener('upgreight:history-applied', onHistoryApplied);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('upgreight:editor-command', onForwardedCommand);
      window.removeEventListener('upgreight:history-applied', onHistoryApplied);
    };
  }, []);

  return null;
}
