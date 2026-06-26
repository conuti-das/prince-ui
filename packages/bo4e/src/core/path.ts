export type PathSeg = string | number;
export type Path = PathSeg[];

function clone(node: unknown): any {
  return Array.isArray(node) ? [...node] : { ...(node as object) };
}

export function setIn<T>(root: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const head = path[0]!;
  const rest = path.slice(1);
  const base: any = root == null ? (typeof head === "number" ? [] : {}) : clone(root);
  base[head] = setIn(base[head], rest, value);
  return base;
}

export function deleteIn<T>(root: T, path: Path): T {
  if (path.length === 0) return root;
  const head = path[0]!;
  const rest = path.slice(1);
  if (root == null) return root;
  const base: any = clone(root);
  if (rest.length === 0) {
    if (Array.isArray(base) && typeof head === "number") base.splice(head, 1);
    else delete base[head];
  } else {
    base[head] = deleteIn(base[head], rest);
  }
  return base;
}
