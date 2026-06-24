/** Klassen-Helper: filtert Falsy-Werte und joint mit Space. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
