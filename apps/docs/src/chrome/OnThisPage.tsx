import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function OnThisPage() {
  const loc = useLocation();
  const [items, setItems] = useState<{ id: string; text: string; level: number }[]>([]);
  useEffect(() => {
    const hs = Array.from(document.querySelectorAll(".docs-main h2, .docs-main h3"));
    setItems(hs.filter((h) => h.id).map((h) => ({ id: h.id, text: h.textContent ?? "", level: h.tagName === "H3" ? 3 : 2 })));
  }, [loc.pathname]);
  if (items.length === 0) return null;
  return (
    <nav aria-label="On this page">
      <div style={{ color: "var(--prn-label-2)", fontWeight: 600 }}>On this page</div>
      {items.map((i) => <div key={i.id} style={{ paddingLeft: (i.level - 2) * 12 }}><a href={`#${i.id}`}>{i.text}</a></div>)}
    </nav>
  );
}
