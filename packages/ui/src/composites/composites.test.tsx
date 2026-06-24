import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Card,
  KpiCard,
  Badge,
  Amount,
  List,
  ListRow,
  Sidebar,
  Toolbar,
  EmptyState,
  Notice,
  DescriptionList,
  Field,
} from "./composites";

describe("composites", () => {
  it("Card renders its title and children", () => {
    render(
      <Card title="Übersicht">
        <p>Inhalt</p>
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "Übersicht" })).toBeInTheDocument();
    expect(screen.getByText("Inhalt")).toBeInTheDocument();
  });

  it("KpiCard shows label, value and a trend delta", () => {
    render(<KpiCard label="Umsatz" value="1.234 €" delta="+8 %" trend="up" />);
    expect(screen.getByText("Umsatz")).toBeInTheDocument();
    expect(screen.getByText("1.234 €")).toBeInTheDocument();
    expect(screen.getByText("+8 %")).toBeInTheDocument();
  });

  it("Badge renders its tone", () => {
    render(<Badge tone="green">OK</Badge>);
    const badge = screen.getByText("OK");
    expect(badge).toHaveAttribute("data-tone", "green");
  });

  it("Amount formats a negative signed currency value", () => {
    render(<Amount value={-5} currency="EUR" signed colored />);
    const el = screen.getByText(/-/);
    expect(el).toHaveAttribute("data-sign", "neg");
    expect(el).toHaveAttribute("data-colored", "");
  });

  it("List renders a label and ListRow content", () => {
    render(
      <List label="Marktpartner">
        <ListRow title="Stadtwerke" subtitle="9900123000007" trailing="›" />
      </List>,
    );
    expect(screen.getByText("Marktpartner")).toBeInTheDocument();
    expect(screen.getByText("Stadtwerke")).toBeInTheDocument();
    expect(screen.getByText("9900123000007")).toBeInTheDocument();
  });

  it("ListRow is pressable when onPress is given", async () => {
    const onPress = vi.fn();
    render(
      <List>
        <ListRow title="Klickbar" onPress={onPress} />
      </List>,
    );
    await userEvent.click(screen.getByRole("button", { name: /Klickbar/ }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("Sidebar renders groups and selects an item", async () => {
    const onSelect = vi.fn();
    render(
      <Sidebar
        header="App"
        selectedKey="a"
        onSelect={onSelect}
        groups={[
          {
            label: "Monitoring",
            items: [
              { id: "a", label: "Transaktionen", trailing: "248" },
              { id: "b", label: "EBD" },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByText("Monitoring")).toBeInTheDocument();
    expect(screen.getByText("248")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /EBD/ }));
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("Toolbar renders title, subtitle and actions", () => {
    render(
      <Toolbar
        title="Transaktionen"
        subtitle="248 offen"
        actions={<Badge tone="blue">Auto</Badge>}
      />,
    );
    expect(screen.getByText("Transaktionen")).toBeInTheDocument();
    expect(screen.getByText("248 offen")).toBeInTheDocument();
    expect(screen.getByText("Auto")).toBeInTheDocument();
  });

  it("EmptyState shows title, description and action", () => {
    render(
      <EmptyState
        title="Nichts da"
        description="leer"
        action={<Badge tone="blue">Reset</Badge>}
      />,
    );
    expect(screen.getByText("Nichts da")).toBeInTheDocument();
    expect(screen.getByText("leer")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("Notice renders a tone, title and body as status", () => {
    render(
      <Notice tone="negative" title="Fehler">
        Segment UNH ungültig
      </Notice>,
    );
    const notice = screen.getByRole("status");
    expect(notice).toHaveAttribute("data-tone", "negative");
    expect(screen.getByText("Fehler")).toBeInTheDocument();
    expect(screen.getByText("Segment UNH ungültig")).toBeInTheDocument();
  });

  it("KpiCard colors the value via tone", () => {
    render(<KpiCard label="Fehlerquote" value="3,2 %" tone="negative" />);
    expect(screen.getByText("3,2 %")).toHaveAttribute("data-tone", "negative");
  });

  it("KpiCard is pressable, renders as a button and supports accent", async () => {
    const onPress = vi.fn();
    render(<KpiCard label="Offen" value="248" onPress={onPress} accent />);
    const card = screen.getByRole("button", { name: /Offen/ });
    expect(card).toHaveAttribute("data-accent", "");
    await userEvent.click(card);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("Amount accepts a pre-formatted string and detects its sign", () => {
    render(<Amount value="-1.234,56 €" colored />);
    const el = screen.getByText("-1.234,56 €");
    expect(el).toHaveAttribute("data-sign", "neg");
    expect(el).toHaveAttribute("data-colored", "");
  });

  it("Amount dims the decimal tail when dimDecimals is set", () => {
    const { container } = render(<Amount value={1234.5} dimDecimals />);
    const dec = container.querySelector(".prn-amount-dec");
    expect(dec).not.toBeNull();
    // de-DE: Tausenderpunkt + Dezimalkomma → Tail = ",5"
    expect(dec?.textContent).toContain(",5");
  });

  it("Card applies translucent glass styling", () => {
    const { container } = render(<Card translucent>Glas</Card>);
    expect(container.querySelector(".prn-card")).toHaveAttribute("data-translucent", "");
  });

  it("Sidebar collapses a collapsible group and hides its items", async () => {
    render(
      <Sidebar
        groups={[
          {
            label: "Verwaltung",
            collapsible: true,
            items: [
              { id: "x", label: "Benutzer" },
              { id: "y", label: "Rollen" },
            ],
          },
        ]}
      />,
    );
    const toggle = screen.getByRole("button", { name: /Verwaltung/ });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const benutzer = screen.getByText("Benutzer");
    expect(benutzer).toBeVisible();
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    // Items stehen in einem [hidden] Container → nicht mehr sichtbar
    expect(benutzer).not.toBeVisible();
  });

  it("Sidebar honors defaultCollapsed", () => {
    render(
      <Sidebar
        groups={[
          {
            label: "Archiv",
            collapsible: true,
            defaultCollapsed: true,
            items: [{ id: "z", label: "Alt" }],
          },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: /Archiv/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("DescriptionList + Field render label/value pairs as a dl", () => {
    render(
      <DescriptionList layout="inline">
        <Field label="Marktpartner" value="Stadtwerke" />
        <Field label="Code">9900123000007</Field>
      </DescriptionList>,
    );
    expect(screen.getByText("Marktpartner")).toBeInTheDocument();
    expect(screen.getByText("Stadtwerke")).toBeInTheDocument();
    expect(screen.getByText("Code")).toBeInTheDocument();
    expect(screen.getByText("9900123000007")).toBeInTheDocument();
  });
});