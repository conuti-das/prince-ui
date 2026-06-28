import { NavLink } from "react-router-dom";
import { navTree } from "../routes";

/**
 * Reine Navigation (Suche/Theme liegen im Header). Active-State via NavLink
 * (react-router useLocation intern). Gruppen mit Caps-Label, einzeilige Items.
 */
export function Sidebar() {
  return (
    <nav className="docs-nav" aria-label="Hauptnavigation">
      {navTree.map((group) => (
        <div className="docs-nav-group" key={group.title}>
          <div className="docs-nav-group-title">{group.title}</div>
          <ul className="docs-nav-list">
            {group.items.map((it) => (
              <li key={it.path}>
                <NavLink
                  to={it.path}
                  end
                  className={({ isActive }) => "docs-nav-link" + (isActive ? " is-active" : "")}
                >
                  {it.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
