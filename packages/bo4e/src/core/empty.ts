/**
 * True when a value carries no information: null/undefined, empty array/object,
 * or a tree containing only such. `false`, `0`, `""` are FILLED — never extend
 * this to falsy.
 */
export function isDeepEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== "object") return false; // false, 0, "" land here → filled
  if (Array.isArray(value)) return value.every(isDeepEmpty);
  return Object.values(value as Record<string, unknown>).every(isDeepEmpty);
}
