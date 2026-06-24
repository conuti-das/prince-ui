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
});