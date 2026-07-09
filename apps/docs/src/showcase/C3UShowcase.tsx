import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CircleDot,
  FineLine,
  ResonanceField,
  getTheme,
  setTheme,
  type PrinceTheme,
} from "@conuti-das/prince-ui";
import "./c3u-showcase.css";

/* ============================================================
 *  C3U — CONUTI Brand Showcase / Starter-Template
 *
 *  Full-bleed Demonstration des offiziellen CONUTI-Brandguides
 *  auf prince-ui: Circle Dot, Fine Lines, Resonance Field, die
 *  sechs Markenfarben und die vier zugelassenen Kombinationen.
 *  Dient zugleich als Copy-Paste-Startvorlage.
 * ============================================================ */

/** Die sechs offiziellen Markenfarben (Brandguide „Farbcodes"). */
const PALETTE: { name: string; hex: string; role: string; onLight?: boolean }[] = [
  { name: "Pulse Blue", hex: "#7cb5f7", role: "Innovation, Energie, Bewegung", onLight: true },
  { name: "Deep Azure", hex: "#061d95", role: "Intelligenz, Weitsicht, Klarheit" },
  { name: "Warm Stone", hex: "#debe9e", role: "Menschlichkeit, Ruhe, Teamgeist", onLight: true },
  { name: "Earth Code", hex: "#4f2b1e", role: "Nahbarkeit, Vertrauen, Bodenhaftung" },
  { name: "Core Black", hex: "#171717", role: "Tiefe, Fokus, Souveränität" },
  { name: "Clear White", hex: "#ffffff", role: "Verständliche Kommunikation", onLight: true },
];

/** Die vier — und nur diese vier — barrierefreien Farbkombinationen. */
const PAIRINGS: { label: string; bg: string; fg: string }[] = [
  { label: "Pulse Blue auf Core Black", bg: "#171717", fg: "#7cb5f7" },
  { label: "Core Black auf Pulse Blue", bg: "#7cb5f7", fg: "#171717" },
  { label: "Earth Code auf Warm Stone", bg: "#debe9e", fg: "#4f2b1e" },
  { label: "Warm Stone auf Earth Code", bg: "#4f2b1e", fg: "#debe9e" },
];

const KOMPETENZ = [
  { tag: "Strategisch", text: "Wir denken voraus — Entwicklungen früh erkennen, Systeme weiterdenken." },
  { tag: "Substanziell", text: "Langfristiges Denken mit echter Verbindlichkeit und nachhaltiger Wirkung." },
  { tag: "KI-nativ", text: "Innovation ist der erste Impuls — Lösungen, bevor Herausforderungen sichtbar werden." },
  { tag: "Menschen & Organisation", text: "Wirkung entsteht durch Menschen, die Verantwortung übernehmen." },
];

export function C3UShowcase() {
  const [mode, setMode] = useState<Extract<PrinceTheme, "c3u-dark" | "c3u-light">>("c3u-dark");

  // Theme für die Dauer der Vorschau erzwingen, beim Verlassen zurücksetzen.
  useEffect(() => {
    const previous = getTheme();
    setTheme(mode);
    return () => setTheme(previous);
  }, [mode]);

  return (
    <div className="c3u">
      <header className="c3u-topbar">
        <span className="c3u-wordmark">
          <CircleDot tone="accent" size={18} /> CONUTI · C3U
        </span>
        <div className="c3u-topbar-actions">
          <div className="c3u-modes" role="group" aria-label="C3U-Modus">
            <button
              type="button"
              className="c3u-mode"
              data-active={mode === "c3u-dark" || undefined}
              onClick={() => setMode("c3u-dark")}
            >
              Dunkel
            </button>
            <button
              type="button"
              className="c3u-mode"
              data-active={mode === "c3u-light" || undefined}
              onClick={() => setMode("c3u-light")}
            >
              Hell
            </button>
          </div>
          <Link to="/" className="c3u-back">
            ← Doku
          </Link>
        </div>
      </header>

      {/* Hero — Resonance Field + Circle Dot + CTA-Pills */}
      <ResonanceField className="c3u-hero" origin={{ x: "84%", y: "10%" }}>
        <CircleDot tone="accent" size={28} className="c3u-hero-mark" />
        <p className="c3u-eyebrow">Look &amp; Feel · CONUTI</p>
        <h1 className="c3u-hero-title">
          KI-native Lösungen für eine
          <br />
          Branche im Wandel.
        </h1>
        <p className="c3u-hero-sub">
          Technologie schafft Möglichkeiten. Wirkung entsteht durch Menschen. Genau in diesem
          Zusammenspiel liegt die DNA von CONUTI.
        </p>
        <div className="c3u-cta">
          <Button className="c3u-pill">Was wir tun →</Button>
          <Button variant="tinted" className="c3u-pill">
            Kontakt
          </Button>
        </div>
      </ResonanceField>

      {/* Die CONUTI Formel — Fine-Line-Verbinder */}
      <section className="c3u-section c3u-formula">
        <CircleDot tone="accent" size={16} />
        <h2 className="c3u-formula-title">Die CONUTI Formel</h2>
        <div className="c3u-formula-line">
          <span className="c3u-formula-label">Technologie</span>
          <FineLine node decorative className="c3u-formula-fine" />
          <span className="c3u-formula-label">Menschen</span>
        </div>
        <p className="c3u-formula-eq">
          Technologie <span className="c3u-accent">+</span> Menschen{" "}
          <span className="c3u-accent">=</span> Wirkung
        </p>
      </section>

      {/* Kompetenzfelder */}
      <section className="c3u-section">
        <h2 className="c3u-h2">Unsere Kompetenzfelder</h2>
        <div className="c3u-grid">
          {KOMPETENZ.map((k) => (
            <Card key={k.tag} className="c3u-card">
              <FineLine decorative className="c3u-card-rule" />
              <h3 className="c3u-card-tag">{k.tag}</h3>
              <p className="c3u-card-text">{k.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Farbwelt — die sechs Markenfarben */}
      <section className="c3u-section">
        <h2 className="c3u-h2">Farbwelt</h2>
        <p className="c3u-lead">
          Zwei Farbwelten — Blau- und Erdtöne — für technologische Klarheit und menschliche Nähe.
          60/40 blau-geführt.
        </p>
        <div className="c3u-swatches">
          {PALETTE.map((c) => (
            <figure key={c.name} className="c3u-swatch">
              <span
                className="c3u-swatch-chip"
                style={{ background: c.hex, color: c.onLight ? "#171717" : "#ffffff" }}
              >
                {c.hex}
              </span>
              <figcaption>
                <strong>{c.name}</strong>
                <span>{c.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Farbkombinationen — die vier zugelassenen Paarungen */}
      <section className="c3u-section">
        <h2 className="c3u-h2">Farbkombinationen</h2>
        <p className="c3u-lead">Bewusst auf vier barrierefreie Kombinationen beschränkt.</p>
        <div className="c3u-pairings">
          {PAIRINGS.map((p) => (
            <div key={p.label} className="c3u-pair" style={{ background: p.bg, color: p.fg }}>
              <CircleDot size={20} />
              <span>{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Komponenten unter C3U */}
      <section className="c3u-section">
        <h2 className="c3u-h2">prince-ui unter C3U</h2>
        <div className="c3u-grid">
          <Card title="Buttons" className="c3u-card">
            <div className="c3u-btn-row">
              <Button>Filled</Button>
              <Button variant="tinted">Tinted</Button>
              <Button variant="plain">Plain</Button>
            </div>
          </Card>
          <Card title="Karte" className="c3u-card">
            <p className="c3u-card-text">
              Alle prince-ui-Komponenten ziehen ihre Farben aus <code>--prn-*</code> und erscheinen
              automatisch in der CONUTI-Marke, sobald <code>data-theme="c3u-dark"</code> gesetzt ist.
            </p>
          </Card>
        </div>
      </section>

      <footer className="c3u-footer">
        <CircleDot tone="accent" size={16} />
        <span>CONUTI · Designing tomorrow, today.</span>
      </footer>
    </div>
  );
}
