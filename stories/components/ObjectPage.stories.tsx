import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ObjectPage,
  ObjectPageSection,
  ObjectPageSubSection,
  Button,
  type ObjectPageHandle,
} from "../../packages/ui/src/index";
import "../../packages/ui/src/data/data.css";

const meta = {
  title: "Components/ObjectPage",
  component: ObjectPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "SAP-UI5-äquivalenter ObjectPage-Floorplan: komponierbare `ObjectPageSection`/`ObjectPageSubSection`, Anchor-/Tab-Bar mit Scroll-Spy, `mode` default (gestapelt) vs iconTabBar, kollabierbarer/snapping Header mit Pin-Button (imperative `toggleHeaderArea` via Ref), Title-Slots (breadcrumbs/header/subHeader/snapped*/actionsBar/navigationBar/KPIs), Bild/Avatar, Floating-Footer und Placeholder. Die alte deklarative API (`title`/`subtitle`/`status`/`kpis`/`sections`) bleibt als Adapter erhalten.",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
    mode: { control: "radio", options: ["default", "iconTabBar"] },
    headerPinned: { control: "boolean" },
    imageShapeCircle: { control: "boolean" },
  },
} satisfies Meta<typeof ObjectPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/* ---- Legacy-API (Adapter, muss weiter funktionieren) ---- */

export const LegacyDeclarative: Story = {
  name: "Legacy declarative API",
  render: () => (
    <ObjectPage
      title="TX-10042"
      subtitle="UTILMD · Anmeldung Netznutzung"
      status={{ label: "Fehler", tone: "negative" }}
      actions={
        <>
          <Button variant="tinted">Erneut senden</Button>
          <Button variant="filled">Rohdaten</Button>
        </>
      }
      kpis={[
        { label: "Verarbeitungszeit", value: "1,8 s" },
        { label: "Versuche", value: "3", tone: "critical" },
        { label: "Betrag", value: "4.231,90 €" },
        { label: "EBD-Treffer", value: "E_0401" },
      ]}
      sections={[
        {
          title: "Stammdaten",
          fields: [
            { label: "Marktpartner", value: "9900123000007" },
            { label: "Name", value: "Stadtwerke Musterstadt" },
            { label: "Sparte", value: "Strom" },
            { label: "Nachrichtentyp", value: "UTILMD" },
          ],
        },
        {
          title: "Verarbeitung",
          fields: [
            { label: "Empfangen", value: "2026-06-23 08:14:02" },
            { label: "Status", value: "Fehler" },
            { label: "Versuche", value: "3", numeric: true },
            { label: "Dauer (ms)", value: "1834", numeric: true },
          ],
        },
      ]}
    />
  ),
};

/* ---- Voller Floorplan mit Anchor-Bar + Scroll-Spy ---- */

const fieldGrid = (rows: [string, string][]) => (
  <dl className="prn-field-grid">
    {rows.map(([k, v]) => (
      <div className="prn-field-row" key={k}>
        <dt className="prn-field-key">{k}</dt>
        <dd className="prn-field-val">{v}</dd>
      </div>
    ))}
  </dl>
);

export const Floorplan: Story = {
  name: "Floorplan (Sections + Anchor Bar + Scroll-Spy)",
  render: () => (
    <ObjectPage
      breadcrumbs={<span style={{ color: "var(--prn-label-2)" }}>Monitoring / Transaktionen / TX-10042</span>}
      header="TX-10042"
      subHeader="UTILMD · Anmeldung Netznutzung"
      status={{ label: "Fehler", tone: "negative" }}
      image="https://avatars.githubusercontent.com/u/0?v=4"
      imageShapeCircle
      kpis={[
        { label: "Verarbeitungszeit", value: "1,8 s" },
        { label: "Versuche", value: "3", tone: "critical" },
        { label: "Betrag", value: "4.231,90 €" },
      ]}
      actionsBar={
        <>
          <Button variant="tinted">Erneut senden</Button>
          <Button variant="filled">Rohdaten</Button>
        </>
      }
      navigationBar={<Button variant="plain">Nächste ›</Button>}
      headerArea={fieldGrid([
        ["Marktpartner", "9900123000007"],
        ["Name", "Stadtwerke Musterstadt"],
        ["Sparte", "Strom"],
      ])}
      footerArea={
        <>
          <Button variant="filled">Akzeptieren</Button>
          <Button variant="tinted">Ablehnen</Button>
        </>
      }
      style={{ height: 600 }}
    >
      <ObjectPageSection id="stammdaten" titleText="Stammdaten">
        {fieldGrid([
          ["Marktpartner", "9900123000007"],
          ["Name", "Stadtwerke Musterstadt"],
          ["Sparte", "Strom"],
          ["Nachrichtentyp", "UTILMD"],
        ])}
      </ObjectPageSection>
      <ObjectPageSection id="verarbeitung" titleText="Verarbeitung">
        <ObjectPageSubSection id="timing" titleText="Timing">
          {fieldGrid([
            ["Empfangen", "2026-06-23 08:14:02"],
            ["Dauer (ms)", "1834"],
          ])}
        </ObjectPageSubSection>
        <ObjectPageSubSection
          id="versuche"
          titleText="Versuche"
          actions={<Button variant="plain">Protokoll</Button>}
        >
          {fieldGrid([
            ["Versuche", "3"],
            ["Letzter Versuch", "08:17:40"],
          ])}
        </ObjectPageSubSection>
      </ObjectPageSection>
      <ObjectPageSection id="fehler" titleText="Fehlerdetails">
        {fieldGrid([
          ["Code", "Z18"],
          ["AHB-Prüfung", "Fehlende OBIS-Kennzahl"],
          ["EBD", "E_0401 / Schritt 7"],
        ])}
      </ObjectPageSection>
      <ObjectPageSection id="historie" titleText="Historie">
        {fieldGrid([
          ["Erstellt", "2026-06-23 08:14:02"],
          ["Geändert", "2026-06-23 08:17:40"],
        ])}
      </ObjectPageSection>
    </ObjectPage>
  ),
};

export const IconTabBarMode: Story = {
  name: "Mode: IconTabBar",
  render: () => (
    <ObjectPage
      mode="iconTabBar"
      header="TX-10042"
      subHeader="UTILMD · Anmeldung Netznutzung"
      status={{ label: "OK", tone: "positive" }}
      style={{ height: 520 }}
    >
      <ObjectPageSection id="stammdaten" titleText="Stammdaten">
        {fieldGrid([
          ["Marktpartner", "9900123000007"],
          ["Sparte", "Strom"],
        ])}
      </ObjectPageSection>
      <ObjectPageSection id="verarbeitung" titleText="Verarbeitung">
        {fieldGrid([["Status", "OK"], ["Dauer (ms)", "1834"]])}
      </ObjectPageSection>
      <ObjectPageSection id="anhaenge" titleText="Anhänge">
        {fieldGrid([["Dateien", "2"], ["Größe", "48 KB"]])}
      </ObjectPageSection>
    </ObjectPage>
  ),
};

export const SnappingHeaderImperative: Story = {
  name: "Snapping Header (imperative ref)",
  render: () => {
    const ref = useRef<ObjectPageHandle>(null);
    return (
      <div>
        <div style={{ padding: 8, display: "flex", gap: 8 }}>
          <Button variant="tinted" onPress={() => ref.current?.toggleHeaderArea()}>
            Header umschalten (toggleHeaderArea)
          </Button>
        </div>
        <ObjectPage
          ref={ref}
          header="TX-10042"
          subHeader="Scrolle nach unten — der Header kollabiert (snapping)."
          snappedHeader="TX-10042 (kompakt)"
          status={{ label: "Wartet", tone: "critical" }}
          headerArea={fieldGrid([
            ["Marktpartner", "9900123000007"],
            ["Name", "Stadtwerke Musterstadt"],
            ["Sparte", "Strom"],
          ])}
          onToggleHeaderArea={(v) => console.log("toggle header", v)}
          onPinButtonToggle={(p) => console.log("pin", p)}
          style={{ height: 520 }}
        >
          <ObjectPageSection id="a" titleText="Abschnitt A">
            <div style={{ height: 600 }}>{fieldGrid([["Feld", "Wert"]])}</div>
          </ObjectPageSection>
          <ObjectPageSection id="b" titleText="Abschnitt B">
            <div style={{ height: 600 }}>{fieldGrid([["Feld", "Wert"]])}</div>
          </ObjectPageSection>
        </ObjectPage>
      </div>
    );
  },
};

export const Placeholder: Story = {
  render: () => (
    <ObjectPage
      header="TX-10042"
      subHeader="Konnte nicht geladen werden"
      placeholder={
        <div style={{ padding: 48, textAlign: "center", color: "var(--prn-label-2)" }}>
          <p style={{ font: "var(--prn-text-title3)" }}>Daten nicht verfügbar</p>
          <p>Die Transaktion konnte nicht geladen werden. Bitte später erneut versuchen.</p>
          <Button variant="filled">Neu laden</Button>
        </div>
      }
      style={{ height: 420 }}
    />
  ),
};
