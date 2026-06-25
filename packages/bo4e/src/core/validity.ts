export type ValidityState = "zukuenftig" | "aktiv" | "laeuftBald" | "abgelaufen";

export function validityStatus(
  range: { startdatum?: string | null; enddatum?: string | null },
  now: Date = new Date(),
): ValidityState {
  const t = now.getTime();
  const start = range.startdatum ? new Date(range.startdatum).getTime() : null;
  const end = range.enddatum ? new Date(range.enddatum).getTime() : null;
  if (start != null && start > t) return "zukuenftig";
  if (end != null) {
    if (end < t) return "abgelaufen";
    if (end < t + 30 * 86_400_000) return "laeuftBald";
  }
  return "aktiv";
}
