export type EditorAction = 'delete' | 'duplicate' | 'copy' | 'paste' | 'undo' | 'redo';

export function editorActionForKey(event: KeyboardEvent): EditorAction | null {
  if (event.altKey) return null;
  const mod = event.metaKey || event.ctrlKey;
  if (!mod && (event.key === 'Delete' || event.key === 'Backspace')) return 'delete';
  if (mod && (event.key === 'd' || event.key === 'D')) return 'duplicate';
  if (mod && (event.key === 'c' || event.key === 'C')) return 'copy';
  if (mod && (event.key === 'v' || event.key === 'V')) return 'paste';
  if (mod && !event.shiftKey && (event.key === 'z' || event.key === 'Z')) return 'undo';
  if (
    mod &&
    ((event.shiftKey && (event.key === 'z' || event.key === 'Z')) ||
      event.key === 'y' ||
      event.key === 'Y')
  ) {
    return 'redo';
  }
  return null;
}
