import { isIsoDate } from "./datetime";

export interface Anomaly {
  severity: "warn" | "error";
  path: string;
  value: unknown;
  rule: "placeholder" | "suspiciousChar" | "defaultValue" | "implausibleDate" | "expired" | "placeholderObject";
  message: string;
}

const END_KEYS = /gueltigBis$|enddatum$|vertragsende$/i;
const DUMMY_OBJECT_KEYS = /geokoordinaten|katasteradresse/i;

/** True if an object has string leaves that are all the dummy value "1". */
function isDummyOnes(o: Record<string, unknown>): boolean {
  const strings = Object.values(o).filter((x): x is string => typeof x === "string");
  return strings.length > 0 && strings.every((x) => x === "1");
}

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
      const obj = v as Record<string, unknown>;
      if (DUMMY_OBJECT_KEYS.test(key) && isDummyOnes(obj)) {
        out.push({ severity: "warn", path, value: v, rule: "placeholderObject", message: `Platzhalter-Daten (${key}): alle Werte „1"` });
      }
      for (const k of Object.keys(obj)) {
        walk(obj[k], path ? `${path}.${k}` : k, k);
      }
    }
  };

  walk(node, "", "");

  // Dedup identical findings (e.g. the same "Fisch>" on Eigentümer und Hausverwalter).
  const seen = new Set<string>();
  return out.filter((a) => {
    const key = `${a.rule}|${typeof a.value === "object" ? a.path : String(a.value)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
