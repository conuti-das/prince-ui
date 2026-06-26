import { useEffect, useState } from "react";

export type PropDoc = { type: string; description: string; defaultValue: string | null };

// props.json wird einmal geladen und gecacht; je Komponente eine name→Doku-Map.
let allData: Record<string, { props: { name: string; type: string; description: string; defaultValue: string | null }[] }> | null = null;
const perComponent: Record<string, Record<string, PropDoc>> = {};

function build(component: string, data: NonNullable<typeof allData>): Record<string, PropDoc> {
  const map: Record<string, PropDoc> = {};
  for (const p of data[component]?.props ?? []) {
    map[p.name] = { type: p.type, description: p.description, defaultValue: p.defaultValue };
  }
  perComponent[component] = map;
  return map;
}

/** Liefert die Prop-Dokus (Typ/Beschreibung/Default) einer Komponente, leer bis geladen. */
export function usePropDocs(component: string): Record<string, PropDoc> {
  const [docs, setDocs] = useState<Record<string, PropDoc>>(() => perComponent[component] ?? {});
  useEffect(() => {
    let alive = true;
    if (allData) {
      setDocs(perComponent[component] ?? build(component, allData));
      return;
    }
    fetch(`${import.meta.env.BASE_URL}props.json`)
      .then((r) => r.json())
      .then((d) => {
        allData = d;
        if (alive) setDocs(build(component, d));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [component]);
  return docs;
}
