import type { Meta, StoryObj } from "@storybook/react";
import { AppShell, Sidebar, Button, KpiCard, Icon } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";
import "../../packages/ui/src/composites/appshell.css";
import "../../packages/ui/src/primitives/forms.css";
import "../../packages/ui/src/surfaces/glass.css";

/**
 * AppShell — Apple-orientierte App-Hülle (vgl. Fiori ShellBar / Carbon UI Shell).
 *
 * Gibt Layout + Chrome vor: sticky Shell-Bar (Logo/Titel/Suche/Aktionen/User),
 * Sidebar links, scrollbarer Content. Glas liegt per Default auf Shell-Bar +
 * Sidebar. Auf schmalen Screens wird die Sidebar zum Off-canvas-Overlay (Toggle
 * oben links). Light/Dark/CU über die Theme-Toolbar.
 */
const meta: Meta<typeof AppShell> = {
  title: "Components/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AppShell>;

const groups = [
  {
    items: [
      { id: "summary", label: "Übersicht", icon: <Icon name="heart" /> },
      { id: "activity", label: "Aktivität", icon: <Icon name="flame" /> },
      { id: "sleep", label: "Schlaf", icon: <Icon name="moon" /> },
      { id: "heart", label: "Herz", icon: <Icon name="heart" />, trailing: "2" },
    ],
  },
  {
    label: "Verwaltung",
    items: [
      { id: "reports", label: "Berichte", icon: <Icon name="chart" /> },
      { id: "settings", label: "Einstellungen", icon: <Icon name="settings" /> },
    ],
  },
];

const content = (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 16,
    }}
  >
    <KpiCard label="Schritte" value="3.824" delta="+12 %" trend="up" />
    <KpiCard label="Ruhepuls" value="62 bpm" />
    <KpiCard label="Aktivität" value="375 kcal" accent />
    <KpiCard label="Schlaf" value="7 h 29" />
  </div>
);

/** Glas-Shell (Default): Shell-Bar + Sidebar transluzent über dem Content. */
export const Default: Story = {
  args: {
    title: "MaCo",
    logo: <Icon name="bolt" size={22} />,
    search: (
      <input
        aria-label="Suche"
        placeholder="Suchen …"
        style={{
          width: "100%",
          height: 32,
          padding: "0 12px",
          borderRadius: "var(--prn-radius-pill)",
          border: "1px solid var(--prn-border)",
          background: "var(--prn-fill)",
          color: "var(--prn-label)",
        }}
      />
    ),
    actions: <Button variant="tinted">Aktion</Button>,
    user: (
      <span
        aria-label="Konto"
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--prn-radius-pill)",
          background: "var(--prn-accent)",
          color: "var(--prn-on-accent)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          font: "var(--prn-text-footnote)",
        }}
      >
        DU
      </span>
    ),
    sidebar: <Sidebar groups={groups} selectedKey="summary" />,
    children: content,
  },
};

/** Opake Variante (`glass={false}`) — Shell-Chrome ohne Transluzenz. */
export const Opaque: Story = {
  args: { ...Default.args, glass: false },
};
