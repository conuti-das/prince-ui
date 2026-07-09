import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnalyticalTable,
  type AnalyticalColumn,
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

// Schwer-Editoren lazy (Demo-Wrapper mit eingebackenen Fixtures; CSS-Assets lädt
// die Doku-App global in main.tsx). So bleibt der Showcase-Erststart leicht.
const DmnTableEditorDemo = lazy(() => import("../heavy/DmnTableEditorDemo"));
const Bo4eCDocViewDemo = lazy(() => import("../heavy/Bo4eCDocViewDemo"));

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

/** Energie-Domänen-Beispieldaten für die eingebettete AnalyticalTable. */
type GridRow = { id: string; partner: string; rolle: string; messungen: number; status: string };
const GRID_DATA: GridRow[] = [
  { id: "9903", partner: "Netze BW GmbH", rolle: "VNB", messungen: 1284000, status: "aktiv" },
  { id: "4033", partner: "TransnetBW GmbH", rolle: "ÜNB", messungen: 486200, status: "aktiv" },
  { id: "9906", partner: "Westnetz Messung GmbH", rolle: "MSB", messungen: 933100, status: "aktiv" },
  { id: "9904", partner: "E.ON Energie Dialog GmbH", rolle: "LF", messungen: 210400, status: "pausiert" },
];
const GRID_COLS: AnalyticalColumn<GridRow>[] = [
  { header: "Code", accessorKey: "id", width: "90px" },
  { header: "Marktpartner", accessorKey: "partner", width: "minmax(180px, 1.4fr)" },
  { header: "Rolle", accessorKey: "rolle", width: "90px" },
  {
    header: "Messungen",
    accessorKey: "messungen",
    align: "end",
    width: "130px",
    cellRender: (r) => r.messungen.toLocaleString("de-DE"),
  },
  { header: "Status", accessorKey: "status", width: "110px" },
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
      <section className="c3u-section c3u-formula prn-contour">
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

      {/* Sections — Aufbau wie im Brandguide, veraltete Bilder durch die modernen
          Ersatz-Backgrounds ersetzt (Tidal Field, Field Lines, Horizont). */}
      <section className="c3u-section">
        <h2 className="c3u-h2">Sections</h2>
        <p className="c3u-lead">
          Aufbau wie im Brandguide — die veralteten Verläufe, das Planet- und das Wellen-Motiv
          sind durch die modernen Backgrounds ersetzt und auf Elementen wiederverwendet.
        </p>
        <div className="c3u-sections-grid">
          <ResonanceField className="c3u-panel c3u-panel--wide" origin={{ x: "84%", y: "16%" }}>
            <CircleDot tone="accent" size={20} />
            <h3 className="c3u-panel-title">KI-native Lösungen für eine Branche im Wandel.</h3>
            <p className="c3u-panel-text">
              Technologie <span className="c3u-accent">+</span> Menschen{" "}
              <span className="c3u-accent">=</span> Wirkung.
            </p>
          </ResonanceField>

          <div className="c3u-panel c3u-panel--warm">
            <h3 className="c3u-panel-title">Partnerschaftlich. Verbindlich. Wirksam.</h3>
            <p className="c3u-panel-text">
              Transformation gelingt dort, wo Technologie, Fachlichkeit und Menschen zusammenkommen.
            </p>
          </div>

          <div className="c3u-panel c3u-panel--pulse">
            <h3 className="c3u-panel-title">Was wir tun</h3>
            <ul className="c3u-panel-list">
              <li>01 · Consulting — Energiewirtschaft &amp; SAP</li>
              <li>02 · Marktkommunikation — Beratung &amp; Betrieb</li>
              <li>03 · BPO — Business Process Outsourcing</li>
            </ul>
          </div>

          <ResonanceField
            variant="horizon"
            className="c3u-panel c3u-panel--wide c3u-panel--onhorizon"
          >
            <CircleDot tone="accent" size={20} />
            <h3 className="c3u-panel-title">Weitblick</h3>
            <p className="c3u-panel-text">
              Horizont — Innovation und Weitblick. Der moderne, atmosphärische Ersatz für das
              Planet-Motiv der Bildsprache.
            </p>
          </ResonanceField>
        </div>
      </section>

      {/* Horizont-CTA — der Planet-Ersatz vollflächig in Aktion */}
      <ResonanceField variant="horizon" origin={{ x: "50%", y: "120%" }} className="c3u-cta-horizon">
        <CircleDot tone="accent" size={22} />
        <h2 className="c3u-cta-title">Zukunft entsteht dort, wo Strategie auf Umsetzung trifft.</h2>
        <p className="c3u-cta-sub">
          CONUTI entwickelt digitale Strukturen für die Energiebranche — intelligent, effizient
          und nachhaltig.
        </p>
        <Button className="c3u-pill">Zusammenarbeit mit CONUTI →</Button>
      </ResonanceField>

      {/* prince-ui in Aktion unter C3U — echte Produktkomponenten */}
      <section className="c3u-section">
        <h2 className="c3u-h2">prince-ui in Aktion unter C3U</h2>
        <p className="c3u-lead">
          Dieselben Produktkomponenten — automatisch in der CONUTI-Marke, in beiden Modi.
        </p>

        <div className="c3u-demo">
          <div className="c3u-demo-label">
            <CircleDot tone="accent" size={14} /> AnalyticalTable
          </div>
          <Card className="c3u-card" padding="none">
            <AnalyticalTable
              aria-label="Marktpartner"
              getRowId={(r) => r.id}
              data={GRID_DATA}
              columns={GRID_COLS}
            />
          </Card>
        </div>

        <div className="c3u-demo">
          <div className="c3u-demo-label">
            <CircleDot tone="accent" size={14} /> DMN-Editor
          </div>
          <Card className="c3u-card" padding="none">
            <Suspense fallback={<div className="c3u-demo-loading">Editor lädt …</div>}>
              <DmnTableEditorDemo />
            </Suspense>
          </Card>
        </div>

        <div className="c3u-demo">
          <div className="c3u-demo-label">
            <CircleDot tone="accent" size={14} /> BO4E cDoc-Viewer
          </div>
          <Card className="c3u-card" padding="none">
            <Suspense fallback={<div className="c3u-demo-loading">Viewer lädt …</div>}>
              <Bo4eCDocViewDemo />
            </Suspense>
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
