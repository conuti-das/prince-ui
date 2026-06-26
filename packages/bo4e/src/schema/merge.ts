/**
 * Merge a generated field-dict (baseline, from the BO4E schemas) with a curated
 * field-dict (hand-maintained, nicer German labels). Curated wins per field, but
 * generated supplies types and fields the curated dict lacks — so created
 * components (e.g. a new ZEITRAUM/ADRESSE) resolve their sub-fields' docs.
 */
export function mergeFieldDicts<
  A extends Record<string, Record<string, unknown>>,
  B extends Record<string, Record<string, unknown>>,
>(generated: A, curated: B): A & B {
  const out: Record<string, Record<string, unknown>> = { ...generated };
  for (const type of Object.keys(curated)) {
    out[type] = { ...(generated[type] ?? {}), ...curated[type] };
  }
  return out as A & B;
}
