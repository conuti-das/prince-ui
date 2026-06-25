import { validityStatus } from "../core/validity";
import { formatDateDE } from "../core/datetime";

export interface ValidityRangeProps {
  start?: string | null;
  end?: string | null;
  now?: Date;
}

export function ValidityRange({ start, end, now }: ValidityRangeProps) {
  const state = validityStatus({ startdatum: start ?? undefined, enddatum: end ?? undefined }, now);
  const hint =
    state === "abgelaufen" ? "abgelaufen" : state === "laeuftBald" ? "läuft bald" : state === "zukuenftig" ? "künftig" : "";
  const text = [start ? formatDateDE(start) : "", end ? formatDateDE(end) : ""].filter(Boolean).join(" – ");
  return (
    <span className="prn-bo-vrange" data-state={state}>
      <span className="dot" />
      {text}
      {hint ? ` · ${hint}` : ""}
    </span>
  );
}
