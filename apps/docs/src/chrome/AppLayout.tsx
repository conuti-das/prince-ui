import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { OnThisPage } from "./OnThisPage";
import { Search } from "./Search";

export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Drawer bei jeder Navigation schließen (Mobile: nach Klick auf einen Link).
  useEffect(() => setNavOpen(false), [location.pathname]);

  // Globaler ⌘K / Ctrl-K-Listener öffnet das Such-Modal.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={`docs-shell${navOpen ? " nav-open" : ""}`}>
      <Header onOpenSearch={() => setSearchOpen(true)} />

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

      <Sidebar />
      <main className="docs-main"><Outlet /></main>
      <aside className="docs-toc"><OnThisPage /></aside>

      {searchOpen && <Search onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
