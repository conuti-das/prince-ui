import { Outlet, Link } from "react-router-dom";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { OnThisPage } from "./OnThisPage";
import { Search } from "./Search";
import { navTree } from "../routes";

export function AppLayout() {
  return (
    <div className="docs-shell">
      <nav aria-label="Hauptnavigation" style={{ padding: "1.5rem 1rem", borderRight: "1px solid var(--prn-separator)" }}>
        <Link to="/" style={{ fontWeight: 700, color: "var(--prn-label)", textDecoration: "none" }}>prince-ui</Link>
        <div style={{ margin: "1rem 0" }}><Search /></div>
        <div style={{ margin: "1rem 0" }}><ThemeSwitcher /></div>
        {navTree.map((group) => (
          <div key={group.title} style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: ".75rem", textTransform: "uppercase", color: "var(--prn-label-2)" }}>{group.title}</div>
            {group.items.map((it) => (
              <div key={it.path}><Link to={it.path} style={{ color: "var(--prn-label)", textDecoration: "none" }}>{it.title}</Link></div>
            ))}
          </div>
        ))}
      </nav>
      <main className="docs-main"><Outlet /></main>
      <aside className="docs-toc"><OnThisPage /></aside>
    </div>
  );
}
