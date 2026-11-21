import { readFileSync } from "node:fs";
import { RouterProvider } from "react-aria-components";
import { resolve } from "node:path";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

  it("Badge wrap: langes Wort darf umbrechen (data-wrap), ohne wrap bleibt die Pille einzeilig", () => {
    render(<><Badge wrap>Gilt als angenommen – keine APERAK in der Frist</Badge><Badge>kurz</Badge></>);
    expect(screen.getByText(/Gilt als angenommen/)).toHaveAttribute("data-wrap", "");
    expect(screen.getByText("kurz")).not.toHaveAttribute("data-wrap");
    const css = readFileSync(resolve(process.cwd(), "src/composites/composites.css"), "utf8");
    const regel = /\.prn-badge\[data-wrap\]\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(regel).toMatch(/white-space:\s*normal/);
  });

  it("Badge renders a leading icon", () => {
    render(<Badge tone="blue" icon={<svg data-testid="ic" />}>Live</Badge>);
    expect(screen.getByTestId("ic")).toBeInTheDocument();
  });

  it("Badge supports solid variant and arbitrary brand color", () => {
    render(
      <Badge variant="solid" color="#e8112a" textColor="#fff">
        TEAM
      </Badge>,
    );
    const badge = screen.getByText("TEAM");
    expect(badge).toHaveAttribute("data-variant", "solid");
    expect(badge).toHaveAttribute("data-custom-color");
    expect(badge).toHaveStyle({ "--prn-badge-color": "#e8112a" });
  });

  it("Card is pressable, renders as a button and forwards style", async () => {
    const onPress = vi.fn();
    render(
      <Card onPress={onPress} style={{ minWidth: 140 }}>
        Klick
      </Card>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("prn-card-pressable");
    expect(btn).toHaveStyle({ minWidth: "140px" });
    await userEvent.click(btn);
    expect(onPress).toHaveBeenCalledTimes(1);
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

  it("ListRow as link: <a href> inside a listitem that carries testid and data-*", () => {
    render(
      <List label="Aufgaben">
        <ListRow title="Änderung freigeben" subtitle="Marktpartner 9900000000002" href="#/admin/freigaben" data-testid="aufgabe" data-id="a1" tone="critical" />
        <ListRow title="Klärfall" href="#/klaerfaelle?fall=1" data-testid="aufgabe" data-id="a2" aria-label="Klärfall, überfällig" />
      </List>,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "#/admin/freigaben");
    expect(links[0]).toHaveAttribute("data-tone", "critical");
    expect(links[1]).toHaveAccessibleName("Klärfall, überfällig");
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("data-testid", "aufgabe");
    expect(items[0]).toHaveAttribute("data-id", "a1");
    expect(items[0]).toContainElement(links[0] ?? null);
    expect(items[0]?.parentElement).toHaveAttribute("role", "list");
  });

  it("link ListRow leaves Ctrl/⌘/Shift/middle clicks to the browser (no onPress, no preventDefault); a plain click still calls onPress", async () => {
    const onPress = vi.fn();
    render(
      <List>
        <ListRow title="Aufgabe" href="#/inbox?aufgabe=1" onPress={onPress} />
      </List>,
    );
    const link = screen.getByRole("link", { name: /Aufgabe/ });
    for (const art of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }]) {
      expect(fireEvent.pointerDown(link, { ...art, button: 0, pointerType: "mouse" })).toBe(true);
      expect(fireEvent.mouseDown(link, { ...art, button: 0 })).toBe(true);
      expect(fireEvent.pointerUp(link, { ...art, button: 0, pointerType: "mouse" })).toBe(true);
      expect(fireEvent.mouseUp(link, { ...art, button: 0 })).toBe(true);
      expect(fireEvent.click(link, { ...art, button: 0 })).toBe(true);
    }
    expect(fireEvent.mouseDown(link, { button: 1 })).toBe(true);
    expect(fireEvent(link, new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 }))).toBe(true);
    expect(onPress).not.toHaveBeenCalled();
    await userEvent.click(link);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("pressable ListRow sits in a listitem; data-* never land on the button", async () => {
    const onPress = vi.fn();
    render(
      <List>
        <ListRow title="Eins" onPress={onPress} data-testid="zeile" />
        <ListRow title="Zwei" onPress={onPress} />
      </List>,
    );
    const knopf = screen.getByRole("button", { name: /Eins/ });
    expect(knopf).not.toHaveAttribute("data-testid");
    expect(knopf.closest("[role=listitem]")).toHaveAttribute("data-testid", "zeile");
    await userEvent.click(knopf);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("separator rule reaches wrapped rows (pressable and link rows sit in .prn-row-item)", () => {
    const { container } = render(
      <List>
        <ListRow title="A" onPress={() => {}} />
        <ListRow title="B" href="#b" />
        <ListRow title="C" />
      </List>,
    );
    const css = readFileSync(resolve(process.cwd(), "src/composites/composites.css"), "utf8");
    const regel = css.match(/^(\.prn-list-rows > [^{]+)\{\s*border-top: 1px/m)?.[1]?.trim();
    expect(regel).toBeTruthy();
    expect(container.querySelectorAll(regel!)).toHaveLength(2);
  });

  it("ListRow trailingPlacement=below and wrap set data attributes for the layout", () => {
    render(
      <List>
        <ListRow title="Lang" subtitle="sehr lang" trailing="Zustand" trailingPlacement="below" wrap />
      </List>,
    );
    const zeile = screen.getByRole("listitem");
    expect(zeile).toHaveAttribute("data-trailing", "below");
    expect(zeile).toHaveAttribute("data-wrap", "");
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

  it("Sidebar: Gruppentitel steuert die Items (aria-controls), Chevron als Icon", async () => {
    render(<Sidebar groups={[{ label: "Verwaltung", collapsible: true, items: [{ id: "x", label: "Benutzer" }] }]} />);
    const toggle = screen.getByRole("button", { name: /Verwaltung/ });
    const ziel = document.getElementById(toggle.getAttribute("aria-controls") ?? "");
    expect(ziel).not.toBeNull();
    expect(ziel).toContainElement(screen.getByText("Benutzer"));
    expect(toggle.querySelector(".prn-sidebar-group-chevron svg")).not.toBeNull();
  });

  it("Sidebar: CSS blendet zugeklappte Gruppen aus ([hidden] gegen display:flex)", () => {
    const css = readFileSync(resolve(process.cwd(), "src/composites/composites.css"), "utf8");
    expect(css).toMatch(/\.prn-sidebar-group-items\[hidden\]\s*\{\s*display:\s*none;/);
  });

  it("Sidebar: Einträge mit href sind Links, der aktive trägt aria-current=page, testid und aria-label durchgereicht", async () => {
    const onSelect = vi.fn();
    render(
      <Sidebar aria-label="Hauptmenü" data-testid="menue" selectedKey="b" onSelect={onSelect}
        groups={[{ items: [{ id: "a", label: "Start", href: "#/start", "data-testid": "nav-start" }, { id: "b", label: "Liste", href: "#/liste" }, { id: "c", label: "Knopf" }] }]} />,
    );
    expect(screen.getByRole("navigation", { name: "Hauptmenü" })).toHaveAttribute("data-testid", "menue");
    const start = screen.getByRole("link", { name: "Start" });
    expect(start).toHaveAttribute("href", "#/start");
    expect(start).toHaveAttribute("data-testid", "nav-start");
    expect(start).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Liste" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Knopf" })).toBeInTheDocument();
    await userEvent.click(start);
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it("Sidebar: Links nutzen den RouterProvider von React Aria (Client-Routing)", async () => {
    const navigate = vi.fn();
    render(
      <RouterProvider navigate={navigate}>
        <Sidebar groups={[{ items: [{ id: "a", label: "Start", href: "/start" }] }]} />
      </RouterProvider>,
    );
    await userEvent.click(screen.getByRole("link", { name: "Start" }));
    expect(navigate).toHaveBeenCalledWith("/start", undefined);
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