import type { Meta, StoryObj } from "@storybook/react";
import {
  Launchpad,
  AppShell,
  Sidebar,
  Icon,
  Badge,
  DonutChart,
  AreaChart,
} from "../../packages/ui/src/index";
import type { LaunchpadSection } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";
import "../../packages/ui/src/composites/appshell.css";
import "../../packages/ui/src/launchpad/launchpad.css";
import "../../packages/ui/src/charts/charts.css";
import "../../packages/ui/src/primitives/forms.css";
import "../../packages/ui/src/surfaces/glass.css";

/**
 * Launchpad — App-/Card-Dashboard im Kachel-Stil.
 *
 * Polymorphe Cards über `kind` (nav/kpi/trend/list/custom) — der Plug-in-Contract,
 * mit dem Apps eigene Inhalte einhängen. `editable` schaltet Drag-Reorder frei
 * (react-aria, Tastatur + Pointer); Cards mit `detail`/`trend` öffnen ein
 * Drill-down-Popup mit der Voll-Visualisierung. Responsiv (Desktop 4 / Tablet 3 /
 * Phone 1 Spalte). Light/Dark/CU über die Theme-Toolbar.
 */
const meta: Meta<typeof Launchpad> = {
  title: "Components/Launchpad",
  component: Launchpad,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof Launchpad>;

const sections: LaunchpadSection[] = [
  {
    id: "overview",
    title: "Überblick",
    cards: [
      { id: "tickets", kind: "kpi", title: "Offene Tickets", value: "12", delta: "−3", trend: "down", icon: <Icon name="inbox" size={16} /> },
      { id: "budget", kind: "kpi", title: "Budget", value: "78 %", delta: "+6 %", trend: "up", accent: true, icon: <Icon name="bolt" size={16} /> },
      { id: "mako", kind: "kpi", title: "MaKo heute", value: "1.204", icon: <Icon name="mail" size={16} /> },
      { id: "new", kind: "nav", title: "Neuer Prozess", description: "Service starten", icon: <Icon name="bolt" size={20} /> },
    ],
  },
  {
    id: "work",
    title: "Posteingang & Budget",
    cards: [
      {
        id: "inbox",
        kind: "list",
        title: "Inbox",
        icon: <Icon name="inbox" size={18} />,
        count: 14,
        span: 2,
        rows: [
          { id: "r1", leading: <Icon name="mail" size={16} />, title: "UTILMD-Antwort offen", subtitle: "Stadtwerke München", trailing: <Badge tone="orange">Wartet</Badge> },
          { id: "r2", leading: <Icon name="mail" size={16} />, title: "APERAK eingegangen", subtitle: "Netze BW", trailing: <Badge tone="green">OK</Badge> },
          { id: "r3", leading: <Icon name="alert" size={16} />, title: "Clearingfall geprüft", subtitle: "E.ON Energie", trailing: <Badge tone="red">Fehler</Badge> },
        ],
        onShowAll: () => {},
        detail: (
          <p style={{ font: "var(--prn-text-body)", color: "var(--prn-label-2)" }}>
            Vollständige Inbox mit allen 14 Vorgängen …
          </p>
        ),
      },
      {
        id: "spend",
        kind: "trend",
        title: "Ausgaben Q2",
        value: "€248.300",
        delta: "+4 %",
        trend: "up",
        span: 2,
        data: [182, 196, 188, 214, 231, 248],
      },
    ],
  },
  {
    id: "services",
    title: "Services & IT-Designer",
    cards: [
      { id: "ebd", kind: "nav", title: "EBD-Prüfung", icon: <Icon name="compass" size={20} /> },
      { id: "partner", kind: "nav", title: "Marktpartner", icon: <Icon name="building" size={20} /> },
      {
        id: "costs",
        kind: "custom",
        title: "Kosten je Stelle",
        span: 2,
        render: () => <DonutChart segments={[{ label: "MaKo", value: 48 }, { label: "IT", value: 30 }, { label: "Sonst", value: 22 }]} showLegend />,
        detail: <AreaChart data={[120, 132, 128, 145, 151, 168]} width={520} height={260} showAxes />,
      },
    ],
  },
];

const groups = [
  { items: [
    { id: "home", label: "Launchpad", icon: <Icon name="grid" /> },
    { id: "inbox", label: "Posteingang", icon: <Icon name="inbox" />, trailing: "14" },
    { id: "reports", label: "Berichte", icon: <Icon name="chart" /> },
    { id: "settings", label: "Einstellungen", icon: <Icon name="settings" /> },
  ] },
];

/** Launchpad in voller AppShell — editierbar (Drag-Reorder), Drill-down per Vergrößern-Icon. */
export const Default: Story = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <AppShell
        title="MaCo"
        subtitle="Launchpad"
        logo={<Icon name="bolt" size={22} />}
        notifications
        notificationsCount={3}
        productSwitch
        user={<span style={{ width: 32, height: 32, borderRadius: 999, background: "var(--prn-accent)", color: "var(--prn-on-accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", font: "var(--prn-text-footnote)" }}>DU</span>}
        sidebar={<Sidebar groups={groups} selectedKey="home" />}
      >
        <div style={{ background: "var(--prn-bento-bg)", minHeight: "100%", padding: 20, margin: -16 }}>
          <Launchpad sections={sections} editable />
        </div>
      </AppShell>
    </div>
  ),
};

/** Nur das Launchpad-Grid (ohne Shell), zum Fokussieren auf die Cards. */
export const GridOnly: Story = {
  args: { sections, editable: true },
  decorators: [
    (Story) => (
      <div style={{ background: "var(--prn-bento-bg)", padding: 24, minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};
