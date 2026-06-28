import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type Item = { id: string; text: string; level: number };

export function OnThisPage() {
  const loc = useLocation();
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Überschriften der aktuellen Seite einsammeln.
  useEffect(() => {
    const hs = Array.from(document.querySelectorAll<HTMLElement>(".docs-main h2, .docs-main h3"));
    setItems(hs.filter((h) => h.id).map((h) => ({ id: h.id, text: h.textContent ?? "", level: h.tagName === "H3" ? 3 : 2 })));
  }, [loc.pathname]);

  // Scroll-Spy via IntersectionObserver.
  useEffect(() => {
    if (items.length === 0) return;
    const headings = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-72px 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  function onClick(e: React.MouseEvent, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  }

  function copyForLLM() {
    const main = document.querySelector(".docs-main");
    const text = (main?.textContent ?? "").trim();
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (items.length === 0) return null;

  return (
    <nav className="docs-toc-nav" aria-label="Auf dieser Seite">
      <div className="docs-toc-title">Auf dieser Seite</div>
      <ul className="docs-toc-list">
        {items.map((i) => (
          <li key={i.id} style={{ paddingLeft: (i.level - 2) * 12 }}>
            <a
              className={"docs-toc-link" + (active === i.id ? " is-active" : "")}
              href={`#${i.id}`}
              onClick={(e) => onClick(e, i.id)}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ul>
      <hr className="docs-toc-sep" />
      <div className="docs-toc-actions">
        <button type="button" className="docs-toc-btn" onClick={copyForLLM}>
          <span aria-hidden="true">⧉</span> {copied ? "Kopiert ✓" : "Für LLM kopieren"}
        </button>
      </div>
    </nav>
  );
}
