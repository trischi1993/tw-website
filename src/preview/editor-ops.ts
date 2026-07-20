/** Pure helpers for resolving and cloning editable array items. */

type KeyedItem = { _key: string; _type?: string; [key: string]: unknown };
type Step = { field: string } | { key: string } | { index: number };

function parsePath(path: string): Step[] {
  const steps: Step[] = [];
  const re = /([A-Za-z0-9_]+)|\[_key=="([^"]+)"\]|\[(-?\d+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(path)) !== null) {
    if (match[1] !== undefined) steps.push({ field: match[1] });
    else if (match[2] !== undefined) steps.push({ key: match[2] });
    else if (match[3] !== undefined) steps.push({ index: Number(match[3]) });
  }
  return steps;
}

export interface ResolvedSelection {
  item: KeyedItem;
  itemPath: string;
  parentArray: KeyedItem[];
  parentArrayPath: string;
  index: number;
}

export function resolveSelection(root: unknown, path: string): ResolvedSelection | null {
  const steps = parsePath(path);
  if (!steps.length) return null;

  let node: unknown = root;
  let parentArray: KeyedItem[] | null = null;
  let parentArrayPath = '';
  let index = -1;
  let currentPath = '';

  for (const step of steps) {
    if ('field' in step) {
      node =
        node && typeof node === 'object'
          ? (node as Record<string, unknown>)[step.field]
          : undefined;
      currentPath = currentPath ? `${currentPath}.${step.field}` : step.field;
      continue;
    }

    if (!Array.isArray(node)) return null;
    const array = node as KeyedItem[];
    parentArray = array;
    parentArrayPath = currentPath;
    if ('key' in step) {
      index = array.findIndex((item) => item?._key === step.key);
      currentPath += `[_key=="${step.key}"]`;
    } else {
      index = step.index < 0 ? array.length + step.index : step.index;
      currentPath += `[${step.index}]`;
    }
    if (index < 0 || index >= array.length) return null;
    node = array[index];
  }

  if (!node || typeof node !== 'object' || !parentArray) return null;
  return { item: node as KeyedItem, itemPath: path, parentArray, parentArrayPath, index };
}

export function randomKey(length = 12): string {
  const cryptoApi = (globalThis as { crypto?: Crypto }).crypto;
  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(length);
    cryptoApi.getRandomValues(bytes);
    let out = '';
    for (const byte of bytes) out += (byte % 36).toString(36);
    return out;
  }
  let out = '';
  while (out.length < length) out += Math.random().toString(36).slice(2);
  return out.slice(0, length);
}

/** Deep-clone an item and give every nested Sanity array member a fresh key. */
export function reKey<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => reKey(item)) as T;
  if (value && typeof value === 'object') {
    const clone: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      clone[key] = key === '_key' ? randomKey() : reKey(item);
    }
    return clone as T;
  }
  return value;
}

export function topSectionKey(path: string): string | null {
  return path.match(/^sections\[_key=="([^"]+)"\]/)?.[1] ?? null;
}

export function lastKeyOf(path: string): string | null {
  const matches = [...path.matchAll(/\[_key=="([^"]+)"\]/g)];
  return matches.at(-1)?.[1] ?? null;
}
