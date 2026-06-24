import type { ReactNode } from "react";
import { useId } from "react";
import { cx } from "../utils";
import "./charts.css";

/* ============================================================================
 * Prince-UI Charts — reine SVG, keine Chart-Library, keine Abhängigkeiten.
 * Serienfarben aus --prn-chart-1..8, Text aus --prn-label-*, Linien aus --prn-separator.
 * Responsiv über viewBox (preserveAspectRatio); kein fixes px-Layout erzwungen.
 * ========================================================================== */

/** Ein normalisierter (x,y)-Punkt im Koordinatenraum des viewBox. */
interface Pt {
  x: number;
  y: number;
}

/** Token-Referenz auf eine Serienfarbe (1..8). */
function seriesColor(index: number): string {
  // 1-basiert auf die 8 Palette-Tokens abbilden, sicher umlaufen lassen.
  const n = (((index % 8) + 8) % 8) + 1;
  return `var(--prn-chart-${n})`;
}

/**
 * Catmull-Rom → kubische Bézier-Glättung.
 * Erzeugt ein weiches `d`-Pfad-Fragment (ohne führendes `M`) durch alle Punkte.
 * Bei < 2 Punkten bleibt der Pfad leer; bei genau 2 Punkten eine gerade Linie.
 */
export function smoothPath(points: Pt[], tension = 0.5): string {
  if (points.length < 2) return "";

  const first = points[0];
  if (!first) return "";
  if (points.length === 2) {
    const second = points[1];
    if (!second) return "";
    return `M ${first.x},${first.y} L ${second.x},${second.y}`;
  }

  let d = `M ${first.x},${first.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? points[i + 1];
    if (!p0 || !p1 || !p2 || !p3) continue;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

/** Werte auf eine Höhe abbilden (y-invertiert: hoher Wert = oben). */
function scaleY(values: number[], height: number, pad: number): (v: number) => number {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const usable = height - pad * 2;
  return (v) => pad + usable - ((v - min) / span) * usable;
}

/* ---------------- Sparkline ---------------- */

export interface SparklineProps {
  data: number[];
  /** viewBox-Breite (interne Einheiten); skaliert responsiv. */
  width?: number;
  /** viewBox-Höhe (interne Einheiten). */
  height?: number;
  /** Linienfarbe; Default --prn-chart-1. */
  color?: string;
  className?: string;
}

/** Kompakte, geglättete Trendlinie ohne Achsen — für KPI-Kacheln. */
export function Sparkline({ data, width = 120, height = 36, color, className }: SparklineProps) {
  if (data.length === 0) {
    return <ChartEmpty className={cx("prn-chart-sparkline", className)} compact />;
  }

  const pad = 3;
  const stroke = color ?? seriesColor(0);
  const yOf = scaleY(data, height, pad);
  const stepX = data.length > 1 ? (width - pad * 2) / (data.length - 1) : 0;
  const points: Pt[] = data.map((v, i) => ({ x: pad + i * stepX, y: yOf(v) }));

  const line = data.length === 1
    ? ""
    : smoothPath(points);
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cx("prn-chart", "prn-chart-sparkline", className)}
      role="img"
      aria-hidden
    >
      {line && (
        <path d={line} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      )}
      {last && <circle cx={last.x} cy={last.y} r={2.5} fill={stroke} vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

/* ---------------- AreaChart ---------------- */

export interface AreaChartProps {
  /** Entweder reine Werte (gleichmäßig verteilt) oder explizite (x,y)-Punkte. */
  data: number[] | Pt[];
  width?: number;
  height?: number;
  color?: string;
  /** Achsen + horizontale Gridlinien anzeigen. */
  showAxes?: boolean;
  className?: string;
}

/** Flächenchart mit Gradient-Füllung unter geglätteter Linie, optionale Achsen/Grid. */
export function AreaChart({ data, width = 320, height = 160, color, showAxes = false, className }: AreaChartProps) {
  const gid = useId().replace(/[:]/g, "");
  if (data.length === 0) {
    return <ChartEmpty className={className} />;
  }

  const values = typeof data[0] === "number"
    ? (data as number[])
    : (data as Pt[]).map((p) => p.y);

  const pad = showAxes ? 8 : 4;
  const padBottom = showAxes ? 20 : pad;
  const padLeft = showAxes ? 28 : pad;

  const yOf = scaleY(values, height - (padBottom - pad), pad);
  const stroke = color ?? seriesColor(0);

  let points: Pt[];
  if (typeof data[0] === "number") {
    const stepX = values.length > 1 ? (width - padLeft - pad) / (values.length - 1) : 0;
    points = values.map((v, i) => ({ x: padLeft + i * stepX, y: yOf(v) }));
  } else {
    const xs = (data as Pt[]).map((p) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const spanX = maxX - minX || 1;
    points = (data as Pt[]).map((p) => ({
      x: padLeft + ((p.x - minX) / spanX) * (width - padLeft - pad),
      y: yOf(p.y),
    }));
  }

  const line = points.length === 1 ? "" : smoothPath(points);
  const baseY = height - padBottom;
  const firstP = points[0];
  const lastP = points[points.length - 1];
  const area = line && firstP && lastP
    ? `${line} L ${lastP.x},${baseY} L ${firstP.x},${baseY} Z`
    : "";

  // Gridlinien (4 Bänder) + Min/Mid/Max-Beschriftung.
  const gridLines = showAxes ? [0, 0.25, 0.5, 0.75, 1] : [];
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cx("prn-chart", "prn-chart-area", className)}
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id={`prn-area-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>

      {showAxes &&
        gridLines.map((g) => {
          const y = pad + (baseY - pad) * g;
          return (
            <line
              key={`grid-${g}`}
              x1={padLeft}
              y1={y}
              x2={width - pad}
              y2={y}
              className="prn-chart-grid"
            />
          );
        })}

      {showAxes && (
        <>
          <text x={padLeft - 5} y={pad + 4} className="prn-chart-axislabel" textAnchor="end">
            {fmtCompact(max)}
          </text>
          <text x={padLeft - 5} y={baseY} className="prn-chart-axislabel" textAnchor="end">
            {fmtCompact(min)}
          </text>
          <line x1={padLeft} y1={baseY} x2={width - pad} y2={baseY} className="prn-chart-axis" />
        </>
      )}

      {area && <path d={area} fill={`url(#prn-area-${gid})`} />}
      {line && (
        <path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {points.length === 1 && firstP && <circle cx={firstP.x} cy={firstP.y} r={3} fill={stroke} />}
    </svg>
  );
}

/* ---------------- BarChart ---------------- */

export interface BarDatum {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarDatum[];
  width?: number;
  height?: number;
  color?: string;
  /** x-Achsenbeschriftung anzeigen. */
  showLabels?: boolean;
  className?: string;
}

/** Vertikale Balken mit gerundeten Köpfen, optionale x-Labels. */
export function BarChart({ data, width = 320, height = 160, color, showLabels = true, className }: BarChartProps) {
  if (data.length === 0) {
    return <ChartEmpty className={className} />;
  }

  const pad = 6;
  const padBottom = showLabels ? 22 : pad;
  const fill = color ?? seriesColor(0);
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 0) || 1;
  const usableH = height - pad - padBottom;
  const slot = (width - pad * 2) / data.length;
  const barW = Math.max(2, Math.min(slot * 0.62, 40));
  const radius = Math.min(barW / 2, 5);
  const baseY = height - padBottom;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cx("prn-chart", "prn-chart-bar", className)}
      role="img"
      aria-hidden
    >
      {data.map((d, i) => {
        const h = max > 0 ? (d.value / max) * usableH : 0;
        const x = pad + i * slot + (slot - barW) / 2;
        const y = baseY - h;
        return (
          <g key={`${d.label}-${i}`}>
            <rect x={x} y={y} width={barW} height={Math.max(h, 0)} rx={radius} ry={radius} fill={fill} />
            {showLabels && (
              <text x={x + barW / 2} y={height - 6} className="prn-chart-axislabel" textAnchor="middle">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- DonutChart ---------------- */

export interface DonutSegment {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  /** Text in der Ringmitte (z. B. Summe). */
  centerLabel?: ReactNode;
  /** Kantenlänge des SVG (interne Einheiten). */
  size?: number;
  /** Ringdicke relativ zum Radius (0..1). */
  thickness?: number;
  /** Legende mit Label + Wert anzeigen. */
  showLegend?: boolean;
  className?: string;
}

/** Ring-Diagramm aus SVG-Arcs mit zentralem Label und Legende. */
export function DonutChart({
  segments,
  centerLabel,
  size = 160,
  thickness = 0.32,
  showLegend = true,
  className,
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  if (segments.length === 0 || total <= 0) {
    return <ChartEmpty className={className} />;
  }

  const cx0 = size / 2;
  const cy0 = size / 2;
  const r = size / 2 - 4;
  const innerR = r * (1 - thickness);

  let angle = -Math.PI / 2; // Start oben (12 Uhr)
  const arcs = segments.map((s, i) => {
    const frac = Math.max(0, s.value) / total;
    const start = angle;
    const end = angle + frac * Math.PI * 2;
    angle = end;
    return {
      d: donutArc(cx0, cy0, r, innerR, start, end),
      color: s.color ?? seriesColor(i),
      key: `${s.label}-${i}`,
    };
  });

  return (
    <div className={cx("prn-chart-donut", className)}>
      <svg viewBox={`0 0 ${size} ${size}`} className="prn-chart" role="img" aria-hidden>
        {arcs.map((a) => (
          <path key={a.key} d={a.d} fill={a.color} />
        ))}
        {centerLabel != null && (
          <foreignObject x={innerR * 0.4} y={cy0 - innerR * 0.7} width={size - innerR * 0.8} height={innerR * 1.4}>
            <div className="prn-chart-donut-center">{centerLabel}</div>
          </foreignObject>
        )}
      </svg>

      {showLegend && (
        <ul className="prn-chart-legend">
          {segments.map((s, i) => (
            <li key={`${s.label}-${i}`} className="prn-chart-legend-item">
              <span className="prn-chart-legend-swatch" style={{ background: s.color ?? seriesColor(i) }} aria-hidden />
              <span className="prn-chart-legend-label">{s.label}</span>
              <span className="prn-chart-legend-value prn-tnum">{fmtCompact(s.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Pfad-`d` für ein Donut-Segment (Ringsektor) zwischen zwei Winkeln. */
function donutArc(
  cx0: number,
  cy0: number,
  rOuter: number,
  rInner: number,
  start: number,
  end: number,
): string {
  // Vollkreis-Sonderfall: minimal kürzen, damit der Arc nicht degeneriert.
  const sweep = end - start;
  const e = sweep >= Math.PI * 2 ? end - 0.0001 : end;

  const x0 = cx0 + rOuter * Math.cos(start);
  const y0 = cy0 + rOuter * Math.sin(start);
  const x1 = cx0 + rOuter * Math.cos(e);
  const y1 = cy0 + rOuter * Math.sin(e);
  const x2 = cx0 + rInner * Math.cos(e);
  const y2 = cy0 + rInner * Math.sin(e);
  const x3 = cx0 + rInner * Math.cos(start);
  const y3 = cy0 + rInner * Math.sin(start);

  const large = sweep > Math.PI ? 1 : 0;

  return [
    `M ${x0},${y0}`,
    `A ${rOuter},${rOuter} 0 ${large} 1 ${x1},${y1}`,
    `L ${x2},${y2}`,
    `A ${rInner},${rInner} 0 ${large} 0 ${x3},${y3}`,
    "Z",
  ].join(" ");
}

/* ---------------- ChartEmpty ---------------- */

export interface ChartEmptyProps {
  /** Hinweistext im Leerzustand. */
  message?: string;
  /** Kompakte Variante (z. B. für Sparkline-Slot). */
  compact?: boolean;
  className?: string;
}

/** Leerzustand, wenn keine Datenpunkte vorliegen. */
export function ChartEmpty({ message = "Keine Daten", compact = false, className }: ChartEmptyProps) {
  return (
    <div className={cx("prn-chart-empty", compact && "prn-chart-empty--compact", className)} role="status">
      {!compact && (
        <svg viewBox="0 0 48 48" className="prn-chart-empty-icon" aria-hidden>
          <rect x="7" y="26" width="7" height="15" rx="2" />
          <rect x="20" y="18" width="7" height="23" rx="2" />
          <rect x="33" y="10" width="7" height="31" rx="2" />
        </svg>
      )}
      <span className="prn-chart-empty-text">{message}</span>
    </div>
  );
}

/* ---------------- Hilfen ---------------- */

/** Kompakte Zahlenformatierung (de-DE): 1.2k, 3,4M … */
function fmtCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")}k`;
  return `${n}`;
}
