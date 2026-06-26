import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { OnThisPage } from "./OnThisPage";
import { Search } from "./Search";
import { navTree } from "../routes";

export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  // Drawer bei jeder Navigation schließen (Mobile: nach Klick auf einen Link).
  useEffect(() => setNavOpen(false), [location.pathname]);

  return (
    <div className={`docs-shell${navOpen ? " nav-open" : ""}`}>
      <button
        type="button"
        className="docs-nav-toggle"
        aria-label="Navigation umschalten"
        aria-expanded={navOpen}
        onClick={() => setNavOpen((v) => !v)}
      >
        ☰
      </button>
      <div className="docs-nav-backdrop" onClick={() => setNavOpen(false)} aria-hidden="true" />
      <nav className="docs-nav" aria-label="Hauptnavigation">
        <Link to="/" className="docs-brand">prince-ui</Link>
        <div style={{ margin: "1rem 0" }}><Search /></div>
        <div style={{ margin: "1rem 0" }}><ThemeSwitcher /></div>
        {navTree.map((group) => (
          <div key={group.title} style={{ marginBottom: "1rem" }}>
            <div className="docs-nav-group">{group.title}</div>
            {group.items.map((it) => (
              <div key={it.path}><Link to={it.path} className="docs-nav-link">{it.title}</Link></div>
            ))}
          </div>
        ))}
      </nav>
      <main className="docs-main"><Outlet /></main>
      <aside className="docs-toc"><OnThisPage /></aside>
    </div>
  );
}
