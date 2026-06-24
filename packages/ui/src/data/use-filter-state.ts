import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { ActiveFilter } from "./filterbar";

const PREFIX = "apl:filterstate:";

export interface UseFilterStateOptions<V extends Record<string, unknown>> {
  /** localStorage-Schlüssel-Suffix (eindeutig pro Tabelle/View). */
  persistKey: string;
  /** Startwerte; definieren zugleich die Filter-Keys. */
  defaultValues: V;
  /** Labels für die abgeleiteten activeFilters-Chips. */
  labels?: Partial<Record<keyof V, ReactNode>>;
  /** Ob ein Wert als „aktiv" zählt. Default: != default und nicht leer. */
  isActive?: (key: keyof V, value: unknown, defaultValue: unknown) => boolean;
}

export interface UseFilterStateResult<V> {
  values: V;
  setValue: <K extends keyof V>(key: K, value: V[K]) => void;
  setValues: (patch: Partial<V>) => void;
  reset: () => void;
  activeFilters: ActiveFilter[];
}

function readPersisted<V>(persistKey: string, fallback: V): V {
  if (typeof window === "undefined" || !window.localStorage) return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + persistKey);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as Partial<V>) };
  } catch {
    return fallback;
  }
}

function writePersisted<V>(persistKey: string, value: V): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(PREFIX + persistKey, JSON.stringify(value));
  } catch {
    /* Quota/Private-Mode → still funktionsfähig ohne Persistenz. */
  }
}

const defaultIsActive = (_k: unknown, value: unknown, dflt: unknown): boolean =>
  value !== dflt && value !== "" && value !== undefined && value !== null;

export function useFilterState<V extends Record<string, unknown>>(
  options: UseFilterStateOptions<V>,
): UseFilterStateResult<V> {
  const { persistKey, defaultValues, labels, isActive = defaultIsActive } = options;
  const [values, setValuesState] = useState<V>(() => readPersisted(persistKey, defaultValues));

  const persist = useCallback(
    (next: V) => {
      setValuesState(next);
      writePersisted(persistKey, next);
    },
    [persistKey],
  );

  const setValue = useCallback(
    <K extends keyof V>(key: K, value: V[K]) => persist({ ...values, [key]: value }),
    [persist, values],
  );
  const setValues = useCallback(
    (patch: Partial<V>) => persist({ ...values, ...patch }),
    [persist, values],
  );
  const reset = useCallback(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try { localStorage.removeItem(PREFIX + persistKey); } catch { /* noop */ }
    }
    setValuesState(defaultValues);
  }, [persistKey, defaultValues]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const out: ActiveFilter[] = [];
    for (const key of Object.keys(values) as (keyof V)[]) {
      if (isActive(key, values[key], defaultValues[key])) {
        out.push({
          id: String(key),
          label: labels?.[key],
          value: String(values[key]),
        });
      }
    }
    return out;
  }, [values, defaultValues, labels, isActive]);

  return { values, setValue, setValues, reset, activeFilters };
}
