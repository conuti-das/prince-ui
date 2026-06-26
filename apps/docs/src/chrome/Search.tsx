import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MiniSearch from "minisearch";

type Doc = { id: string; title: string; text: string };

export function Search() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [query, setQuery] = useState("");
  const inputId = useRef(`search-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}search-index.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Doc[]) => {
        if (!cancelled) setDocs(d);
      })
      .catch(() => {
        if (!cancelled) setDocs([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const index = useMemo(() => {
    const mini = new MiniSearch<Doc>({
      fields: ["title", "text"],
      storeFields: ["title", "id"],
      searchOptions: { boost: { title: 2 }, prefix: true, fuzzy: 0.2 },
    });
    mini.addAll(docs);
    return mini;
  }, [docs]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [] as Array<{ id: string; title: string }>;
    return index.search(q).slice(0, 8).map((r) => ({ id: String(r.id), title: String(r.title) }));
  }, [index, query]);

  return (
    <div className="docs-search" style={{ marginBottom: "1rem" }}>
      <label htmlFor={inputId} className="docs-visually-hidden">
        Dokumentation durchsuchen
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Suchen…"
        className="docs-search-input"
        autoComplete="off"
      />
      {results.length > 0 && (
        <ul className="docs-search-results" role="listbox" aria-label="Suchergebnisse">
          {results.map((r) => (
            <li key={r.id}>
              <Link to={r.id} className="docs-search-result" onClick={() => setQuery("")}>
                {r.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
