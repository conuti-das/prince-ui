import { Link } from "react-router-dom";
import { ThemeSwitcher } from "./ThemeSwitcher";

const GH_URL = "https://github.com/conuti-das/prince-ui";
const NPM_URL = "https://www.npmjs.com/package/@conuti-das/prince-ui";

/**
 * Globale Topbar: Brand links, zentrierte Such-Pille, rechts Theme-Switcher
 * + Icon-Links. Suche/Theme sind aus der Sidebar hierher gewandert.
 */
export function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <header className="docs-header">
      <Link className="docs-header-brand" to="/">
        <span className="docs-header-logo" aria-hidden="true" />
        <span className="docs-header-wordmark">prince-ui</span>
      </Link>

      <button type="button" className="docs-searchbar" onClick={onOpenSearch} aria-label="Dokumentation durchsuchen">
        <span className="docs-searchbar-icon" aria-hidden="true">⌕</span>
        <span className="docs-searchbar-placeholder">Dokumentation durchsuchen</span>
        <kbd className="docs-kbd">⌘K</kbd>
      </button>

      <div className="docs-header-actions">
        <button type="button" className="docs-icon-btn docs-searchbar-mobile" onClick={onOpenSearch} aria-label="Suchen">
          ⌕
        </button>
        <ThemeSwitcher />
        <span className="docs-header-divider" aria-hidden="true" />
        <a className="docs-icon-btn" href={GH_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.2c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.92 1.23 3.23 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"/>
          </svg>
        </a>
        <a className="docs-icon-btn" href={NPM_URL} target="_blank" rel="noreferrer" aria-label="npm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M2 6h20v12H12v-2H8v2H2V6Zm2 2v8h2V10h2v6h2V8H4Zm10 0v8h2v-6h2v6h2V8h-6Z"/>
          </svg>
        </a>
      </div>
    </header>
  );
}
