import { cx } from "../utils";
import { ChartEmpty } from "./charts";
import "./charts.css";

/* ============================================================================
 * ComboChart — mehrere Reihen über gemeinsamen x-Werten: Balken (gruppiert) und Linien in einem SVG, Legende darunter.
 * Reine SVG wie die übrigen Charts; Serienfarben aus --prn-chart-1..8. Die Legende trägt Wort und Form (Quadrat = Balken,
 * Strich = Linie), die Farbe ist nie allein die Information.
 * ========================================================================== */

export interface ComboSeries {
  id: string;
  /** Name in der Legende. */
  label: string;
  /** Ein Wert je x-Wert (`labels`); `null` = kein Wert (Lücke in der Linie, kein Balken). */
  values: (number | null)[];
  /** Darstellung: Balken (Vorgabe) oder Linie. */
  kind?: "bar" | "line";
  /** Farbe (Token); ohne Angabe die Serienfarbe nach Position. */
  color?: string;
}

export interface ComboChartProps {
  /** x-Werte (Beschriftung der x-Achse). */
  labels: string[];
  series: ComboSeries[];
  width?: number;
  height?: number;
  /** x-Achsenbeschriftung anzeigen. */
  showLabels?: boolean;
  /** Nur jede n-te x-Beschriftung zeigen (dichte Achsen, z. B. Minuten). */
  labelEvery?: number;
  /** Werteachse links mit 0, Mitte und Höchstwert samt Hilfslinien. */
  showValueAxis?: boolean;
  /** Legende unter dem Diagramm. */
  showLegend?: boolean;
  /** Zahlformat für die Werteachse. */
  formatValue?: (n: number) => string;
  /** Name des Diagramms für Screenreader; ohne Angabe ist das SVG dekorativ (Werte dann daneben als Text nennen). */
  "aria-label"?: string;
  className?: string;
}

const farbe = (s: ComboSeries, i: number) => s.color ?? `var(--prn-chart-${(((i % 8) + 8) % 8) + 1})`;
const zahl = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ","));

/** Balken und Linien mehrerer Reihen über gemeinsamen x-Werten, mit Legende und optionaler Werteachse. */
export function ComboChart({
  labels,
  series,
  width = 320,
  height = 160,
  showLabels = true,
  labelEvery = 1,
  showValueAxis = false,
  showLegend = true,
  formatValue = zahl,
  "aria-label": ariaLabel,
  className,
}: ComboChartProps) {
  const werte = series.flatMap((s) => s.values.filter((v): v is number => typeof v === "number" && Number.isFinite(v)));
  if (labels.length === 0 || series.length === 0 || werte.length === 0) {
    return <ChartEmpty className={className} />;
  }

  const pad = 6;
  const padLeft = showValueAxis ? 34 : pad;
  const padBottom = showLabels ? 22 : pad;
  const max = Math.max(...werte, 0) || 1;
  const usableW = width - padLeft - pad;
  const usableH = height - pad - padBottom;
  const baseY = height - padBottom;
  const slot = usableW / labels.length;
  const y = (v: number) => baseY - (Math.max(v, 0) / max) * usableH;
  const mitte = (i: number) => padLeft + i * slot + slot / 2;

  const balken = series.map((s, i) => ({ s, i })).filter(({ s }) => (s.kind ?? "bar") === "bar");
  const linien = series.map((s, i) => ({ s, i })).filter(({ s }) => s.kind === "line");
  const gruppe = Math.max(2, Math.min(slot * 0.72, 18 * Math.max(balken.length, 1)));
  const barW = balken.length ? Math.max(1.5, gruppe / balken.length - (balken.length > 1 ? 1 : 0)) : 0;
  const radius = Math.min(barW / 2, 4);
  const jeder = Math.max(1, Math.floor(labelEvery));

  /** Linienzüge einer Reihe, an `null` unterbrochen */
  const zuege = (s: ComboSeries) => {
    const r: string[] = [];
    let akt: string[] = [];
    s.values.slice(0, labels.length).forEach((v, i) => {
      if (typeof v === "number" && Number.isFinite(v)) akt.push(`${akt.length ? "L" : "M"} ${mitte(i)},${y(v)}`);
      else if (akt.length) { r.push(akt.join(" ")); akt = []; }
    });
    if (akt.length) r.push(akt.join(" "));
    return r;
  };

  return (
    <div className={cx("prn-chart-combo", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="prn-chart prn-chart-combochart"
        role="img"
        aria-label={ariaLabel}
        aria-hidden={ariaLabel ? undefined : true}
      >
        {showValueAxis &&
          [0, max / 2, max].map((v, k) => (
            <g key={`achse-${k}`} className="prn-chart-tick">
              <line x1={padLeft} x2={width - pad} y1={y(v)} y2={y(v)} className={k === 0 ? "prn-chart-axis" : "prn-chart-grid"} />
              <text x={padLeft - 4} y={y(v) + 3} className="prn-chart-axislabel" textAnchor="end">
                {formatValue(v)}
              </text>
            </g>
          ))}
        {balken.map(({ s, i }, b) =>
          s.values.slice(0, labels.length).map((v, j) => {
            if (typeof v !== "number" || !Number.isFinite(v)) return null;
            const h = baseY - y(v);
            const x = mitte(j) - gruppe / 2 + b * (gruppe / balken.length) + (gruppe / balken.length - barW) / 2;
            return <rect key={`${s.id}-${j}`} data-series={s.id} x={x} y={baseY - h} width={barW} height={Math.max(h, 0)} rx={radius} ry={radius} fill={farbe(s, i)} />;
          }),
        )}
        {linien.map(({ s, i }) => (
          <g key={s.id} data-series={s.id} className="prn-chart-combo-line">
            {zuege(s).map((d, k) => (
              <path key={k} d={d} fill="none" stroke={farbe(s, i)} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            ))}
          </g>
        ))}
        {showLabels &&
          labels.map((l, j) =>
            j % jeder === 0 ? (
              <text key={`x-${j}`} x={mitte(j)} y={height - 6} className="prn-chart-axislabel" textAnchor="middle">
                {l}
              </text>
            ) : null,
          )}
      </svg>
      {showLegend && (
        <ul className="prn-chart-legend prn-chart-legend--row">
          {series.map((s, i) => (
            <li key={s.id} className="prn-chart-legend-item" data-kind={s.kind ?? "bar"}>
              <span className="prn-chart-legend-swatch" data-kind={s.kind ?? "bar"} style={{ background: farbe(s, i) }} aria-hidden />
              <span className="prn-chart-legend-label">{s.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
