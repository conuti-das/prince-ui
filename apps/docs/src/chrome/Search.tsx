import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import MiniSearch from "minisearch";

type Doc = { id: string; title: string; text: string };
type Result = { id: string; title: string };

/** Query-Substring im Titel hervorheben. */
function highlight(title: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return title;
  const idx = title.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return title;
  return (
    <>
      {title.slice(0, idx)}
      <mark className="docs-search-mark">{title.slice(idx, idx + q.length)}</mark>
      {title.slice(idx + q.length)}
    </>
  );
}

/** Gruppen-Label aus dem Pfad ableiten (Components / Foundations / …). */
function groupOf(id: string): string {
  const seg = id.split("/").filter(Boolean)[0];
  if (!seg) return "Übersicht";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

export function Search({ onClose }: { onClose: () => void }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useRef(`search-list-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}search-index.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Doc[]) => { if (!cancelled) setDocs(d); })
      .catch(() => { if (!cancelled) setDocs([]); });
    return () => { cancelled = true; };
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

  const results = useMemo<Result[]>(() => {
    const q = query.trim();
    if (!q) return [];
    return index.search(q).slice(0, 8).map((r) => ({ id: String(r.id), title: String(r.title) }));
  }, [index, query]);

  useEffect(() => setActive(0), [query]);

  function go(id: string) {
    navigate(id);
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      if (hit) go(hit.id);
    }
  }

  const activeId = results[active] ? `${listId}-${active}` : undefined;

  return (
    <div className="docs-search-backdrop" onClick={onClose}>
      <div
        className="docs-search-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Dokumentation durchsuchen"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Dokumentation durchsuchen…"
          className="docs-search-input"
          autoComplete="off"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-activedescendant={activeId}
        />
        {query.trim() && results.length === 0 && (
          <div className="docs-search-empty">Keine Treffer für „{query.trim()}".</div>
        )}
        {results.length > 0 && (
          <ul className="docs-search-results" role="listbox" id={listId} aria-label="Suchergebnisse">
            {results.map((r, i) => (
              <li key={r.id} role="presentation">
                <a
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  href={r.id}
                  className={"docs-search-result" + (i === active ? " is-active" : "")}
                  onMouseEnter={() => setActive(i)}
                  onClick={(e) => { e.preventDefault(); go(r.id); }}
                >
                  <span className="docs-search-result-group">{groupOf(r.id)}</span>
                  {highlight(r.title, query)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
