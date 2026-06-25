import { isIsoDate } from "./datetime";

export interface Anomaly {
  severity: "warn" | "error";
  path: string;
  value: unknown;
  rule: "placeholder" | "suspiciousChar" | "defaultValue" | "implausibleDate" | "expired";
  message: string;
}

const END_KEYS = /gueltigBis$|enddatum$|vertragsende$/i;

export function scanAnomalies(node: unknown, opts: { now?: Date } = {}): Anomaly[] {
  const now = (opts.now ?? new Date()).getTime();
  const out: Anomaly[] = [];

  const walk = (v: unknown, path: string, key: string): void => {
    if (v == null) return;
    if (typeof v === "string") {
      if (/#.+#/.test(v)) {
        out.push({ severity: "warn", path, value: v, rule: "placeholder", message: `Platzhalter nicht ersetzt: ${v}` });
      }
      if (/[<>]/.test(v)) {
        out.push({ severity: "warn", path, value: v, rule: "suspiciousChar", message: `Sonderzeichen im Wert: ${v}` });
      }
      if (v === "00000000") {
        out.push({ severity: "warn", path, value: v, rule: "defaultValue", message: `Leerer Default-Wert (${key})` });
      }
      if (isIsoDate(v) && new Date(v).getUTCFullYear() <= 1950) {
        out.push({ severity: "warn", path, value: v, rule: "implausibleDate", message: `Unplausibles Datum: ${v}` });
      }
      if (isIsoDate(v) && END_KEYS.test(key) && new Date(v).getTime() < now) {
        out.push({ severity: "warn", path, value: v, rule: "expired", message: `Abgelaufen (${key}): ${v}` });
      }
      return;
    }
    if (Array.isArray(v)) {
      v.forEach((it, i) => walk(it, `${path}[${i}]`, key));
      return;
    }
    if (typeof v === "object") {
      for (const k of Object.keys(v as Record<string, unknown>)) {
        walk((v as Record<string, unknown>)[k], path ? `${path}.${k}` : k, k);
      }
    }
  };

  walk(node, "", "");
  return out;
}
