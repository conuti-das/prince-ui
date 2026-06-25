import type { Meta, StoryObj } from "@storybook/react";
import {
  GlassSurface,
  Toolbar,
  Sidebar,
  Popover,
  Button,
  DialogTrigger,
} from "../../packages/ui/src/index";
import type { GlassVariant } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";
import "../../packages/ui/src/primitives/forms.css";
import "../../packages/ui/src/primitives/overlays.css";
import "../../packages/ui/src/surfaces/glass.css";

/**
 * Liquid Glass — dünne Optik-Schicht über React Aria (nur CSS, kein Verhalten).
 *
 * **Wo einsetzen:** Top-Bar, Sidebar, Overlays (Popover/Menu/Dialog/Tooltip),
 * schwebende Controls, Übersichtskarten, die über Content liegen.
 * **Wo nicht:** datendichte Tabellen/Listen, Eingabefelder, Fließtext — dort
 * haben Lesbarkeit/Performance Vorrang. Kein Glas auf Glas (nicht stapeln).
 *
 * Der Effekt nutzt `backdrop-filter`; ohne Support oder bei
 * `prefers-reduced-transparency` fällt jede Fläche automatisch auf opak zurück.
 * Light, Dark und CU werden über die Theme-Toolbar abgedeckt.
 */
const meta: Meta = {
  title: "Foundations/Liquid Glass",
  parameters: { layout: "fullscreen" },
};
export default meta;

/** Bunter, „unruhiger" Hintergrund, damit der Glas-Effekt sichtbar wird. */
const backdrop: React.CSSProperties = {
  background:
    "radial-gradient(60% 80% at 12% 18%, #ff9f0a55, transparent 60%)," +
    "radial-gradient(55% 75% at 88% 22%, #0a84ff55, transparent 60%)," +
    "radial-gradient(70% 90% at 50% 100%, #bf5af255, transparent 55%)," +
    "linear-gradient(135deg, #34c759, #007aff 55%, #af52de)",
  minHeight: 520,
};

const navGroups = [
  {
    items: [
      { id: "summary", label: "Übersicht", icon: "❤️" },
      { id: "activity", label: "Aktivität", icon: "🔥" },
      { id: "sleep", label: "Schlaf", icon: "🌙" },
      { id: "heart", label: "Herz", icon: "💟", trailing: "2" },
    ],
  },
];

/** Glas-Übersichtskachel mit KPI-Inhalt (kein Card-in-Card). */
function Tile({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <GlassSurface variant="card" tintColor={tint} style={{ padding: 16, display: "grid", gap: 4 }}>
      <span style={{ font: "var(--prn-text-subhead)", color: "var(--prn-label-2)" }}>{label}</span>
      <span style={{ font: "var(--prn-text-metric)", color: "var(--prn-label)" }}>{value}</span>
    </GlassSurface>
  );
}

/** App-Shell: Glas-Toolbar (Header), Glas-Sidebar und ein Glas-Popover über Content. */
export const AppShell: StoryObj = {
  render: () => (
    <div style={backdrop}>
      <Toolbar
        glass
        title="Health"
        subtitle="Liquid-Glass-Navigationsebene"
        actions={
          <DialogTrigger>
            <Button variant="filled">Hinzufügen</Button>
            <Popover glass>
              <div style={{ padding: 12, minWidth: 220, display: "grid", gap: 6 }}>
                <strong>Glas-Popover</strong>
                <span style={{ color: "var(--prn-label-2)" }}>
                  Transluzent über dem Content — mit opakem Fallback.
                </span>
              </div>
            </Popover>
          </DialogTrigger>
        }
      />
      <div style={{ display: "flex", gap: 16, padding: 16, alignItems: "flex-start" }}>
        <div style={{ width: 240, flex: "0 0 auto" }}>
          <Sidebar glass groups={navGroups} selectedKey="summary" />
        </div>
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {/* Übersichtskarten als Glas (schweben über Content) — Inhalt direkt, kein Card-in-Card */}
          <Tile label="Schritte" value="3.824" />
          <Tile label="Ruhepuls" value="62 bpm" />
          <Tile label="Aktivität" value="375 kcal" tint="rgba(52,199,89,0.10)" />
        </div>
      </div>
      {/* Schwebender Glas-Control (FAB) */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 24px 24px" }}>
        <GlassSurface
          variant="floating"
          as="button"
          style={{ width: 56, height: 56, fontSize: 24, cursor: "pointer", color: "var(--prn-label)" }}
          aria-label="Neuer Eintrag"
        >
          ＋
        </GlassSurface>
      </div>
    </div>
  ),
};

const VARIANTS: GlassVariant[] = ["bar", "sidebar", "overlay", "card", "floating"];

/** Alle Glas-Varianten nebeneinander über dem Hintergrund. */
export const Variants: StoryObj = {
  render: () => (
    <div style={{ ...backdrop, display: "flex", flexWrap: "wrap", gap: 20, padding: 24, alignItems: "center" }}>
      {VARIANTS.map((v) => (
        <GlassSurface
          key={v}
          variant={v}
          style={{
            padding: "16px 20px",
            minWidth: 140,
            minHeight: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--prn-label)",
            font: "var(--prn-text-headline)",
          }}
        >
          .prn-glass-{v}
        </GlassSurface>
      ))}
    </div>
  ),
};
