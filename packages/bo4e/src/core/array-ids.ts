const ids = new WeakMap<object, string>();
let counter = 0;

/** Stable id for an object node (assigned by seedTree, or lazily on first call). */
export function itemId(obj: object): string {
  let id = ids.get(obj);
  if (id == null) {
    id = `it${counter++}`;
    ids.set(obj, id);
  }
  return id;
}

/**
 * Walk the FULL tree once and assign a stable id to every object node, before
 * any density-dependent pruning. Idempotent — existing ids are kept.
 */
export function seedTree(node: unknown): void {
  if (node == null || typeof node !== "object") return;
  if (!Array.isArray(node)) itemId(node);
  const children = Array.isArray(node) ? node : Object.values(node as Record<string, unknown>);
  for (const c of children) seedTree(c);
}
