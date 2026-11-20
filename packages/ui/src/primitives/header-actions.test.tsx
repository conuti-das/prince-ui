import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeaderActions, berechneUeberlauf, type HeaderAction, type HeaderHelper, type HeaderMenuEntry } from "./header-actions";

const leer = () => {};
const AKTIONEN: HeaderAction[] = [
  { id: "frei", label: "Freigeben", kind: "primary", onAction: leer, icon: "send", "data-testid": "frei" },
  { id: "komm", label: "Kommentieren", kind: "secondary", onAction: leer, "data-testid": "komm" },
  { id: "abl", label: "Ablehnen", kind: "withdraw", onAction: leer, "data-testid": "abl" },
  { id: "zuw", label: "Zuweisen", kind: "secondary", onAction: leer, "data-testid": "zuw" },
];
const HELFER: HeaderHelper[] = [{ id: "akt", label: "Aktualisieren", icon: "redo", onAction: leer, "data-testid": "akt" }];
const MENU: HeaderMenuEntry[] = [
  { id: "hilfe", label: "Hilfe zu Freigaben", section: "help", onAction: leer },
  { id: "export", label: "Exportieren", section: "view", icon: "download", onAction: leer },
  { id: "abgeben", label: "Abgeben", section: "actions", kind: "withdraw", onAction: leer },
];

/** jsdom kennt kein Layout: Breite der Leiste und je Eintrag vorgeben */
let leiste = 2000;
const breite: Record<string, number> = {};
beforeEach(() => {
  leiste = 2000;
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) { return this.classList.contains("prn-hab") ? leiste : 0; });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const k = this.dataset.habKey; const w = k ? (breite[k] ?? 100) : this.hasAttribute("data-hab-menu") ? 34 : 0;
    return { width: w, height: 34, top: 0, left: 0, right: w, bottom: 34, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
  });
});
afterEach(() => vi.restoreAllMocks());

const reihenfolge = (c: HTMLElement) => [...c.querySelectorAll(".prn-hab > *")].map((e) =>
  e.classList.contains("prn-hab-trenner") ? "|" : e.hasAttribute("data-hab-menu") ? "⋯" : (e.querySelector("[data-testid]")?.getAttribute("data-testid") ?? e.className));

describe("HeaderActions (Aktionsleiste im Kopf)", () => {
  it("feste Reihenfolge: Rücknahme · Sekundär · Primär · Trenner · Hilfsaktionen · Menü, mit den Rollen der Knöpfe", () => {
    const { container } = render(<HeaderActions actions={AKTIONEN} helpers={HELFER} menu={MENU} data-testid="kopf" />);
    expect(reihenfolge(container)).toEqual(["abl", "komm", "zuw", "frei", "|", "akt", "⋯"]);
    expect(screen.getByTestId("abl")).toHaveAttribute("data-destructive", "true");
    expect(screen.getByTestId("abl")).toHaveAttribute("data-variant", "tinted");
    expect(screen.getByTestId("komm")).toHaveAttribute("data-variant", "tinted");
    expect(screen.getByTestId("frei")).toHaveAttribute("data-variant", "filled");
    expect(screen.getByRole("button", { name: "Aktualisieren" })).toHaveClass("prn-iconbutton");
    expect(screen.getByRole("group", { name: "Aktionen" })).toBeInTheDocument();
  });

  it("höchstens eine gefüllte: eine zweite primäre wird sekundär gezeigt und gemeldet", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<HeaderActions actions={[...AKTIONEN, { id: "senden", label: "Versenden", kind: "primary", onAction: leer, "data-testid": "senden" }]} />);
    expect(document.querySelectorAll(".prn-hab [data-variant=filled]")).toHaveLength(1);
    expect(screen.getByTestId("senden")).toHaveAttribute("data-variant", "tinted");
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/höchstens eine primäre/));
  });

  it("Menü „⋯“ mit festem Aufbau: weitere Aktionen (Farbcodierung) · Ansicht und Export · Hilfe", async () => {
    render(<HeaderActions actions={AKTIONEN} helpers={HELFER} menu={MENU} />);
    await userEvent.click(screen.getByRole("button", { name: "Weitere Aktionen" }));
    const menu = await screen.findByRole("menu");
    const gruppen = within(menu).getAllByRole("group");
    expect(gruppen.map((g) => g.getAttribute("aria-labelledby") ? document.getElementById(g.getAttribute("aria-labelledby")!)?.textContent : null)).toEqual(["Weitere Aktionen", "Ansicht und Export", "Hilfe"]);
    expect(within(menu).getByRole("menuitem", { name: "Abgeben" })).toHaveAttribute("data-tone", "danger");
    expect(within(gruppen[2]!).getByRole("menuitem", { name: "Hilfe zu Freigaben" })).toBeInTheDocument();
  });

  it("Überlauf: zuerst die Rücknahme, dann die sekundären ins Menü; die primäre bleibt sichtbar", async () => {
    leiste = 34 + 17 + 3 * 108 + 108; // Menü, Trenner, drei Einträge à 100 + Lücke, Hilfsaktion
    render(<HeaderActions actions={AKTIONEN} helpers={HELFER} />);
    expect(screen.queryByTestId("abl")).not.toBeInTheDocument();
    expect(screen.getByTestId("komm")).toBeInTheDocument();
    expect(screen.getByTestId("frei")).toHaveAttribute("data-variant", "filled");
    await userEvent.click(screen.getByRole("button", { name: "Weitere Aktionen" }));
    const item = await screen.findByRole("menuitem", { name: "Ablehnen" });
    expect(item).toHaveAttribute("data-tone", "danger");
  });

  it("sehr schmal (Telefon): nur die primäre und „⋯“ bleiben; alles andere im Menü in fester Reihenfolge", async () => {
    leiste = 200;
    render(<HeaderActions actions={AKTIONEN} helpers={HELFER} />);
    expect(screen.getByTestId("frei")).toBeInTheDocument();
    for (const id of ["abl", "komm", "zuw", "akt"]) expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Weitere Aktionen" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getAllByRole("menuitem").map((m) => m.textContent)).toEqual(["Ablehnen", "Kommentieren", "Zuweisen", "Aktualisieren"]);
  });

  it("Variante „alle Aktionen im Menü“: in der Zeile nur Hilfsaktionen und „⋯“", async () => {
    const { container } = render(<HeaderActions layout="menu" actions={AKTIONEN} helpers={HELFER} />);
    expect(reihenfolge(container)).toEqual(["akt", "⋯"]);
    await userEvent.click(screen.getByRole("button", { name: "Weitere Aktionen" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getAllByRole("menuitem").map((m) => [m.textContent, m.getAttribute("data-tone")])).toEqual([
      ["Ablehnen", "danger"], ["Kommentieren", "action"], ["Zuweisen", "action"], ["Freigeben", "action"],
    ]);
  });

  it("deaktiviert mit Grund: Knopf sichtbar und deaktiviert, der Grund steht dabei", () => {
    render(<HeaderActions actions={[{ id: "frei", label: "Freigeben", kind: "primary", onAction: leer, isDisabled: true, disabledReason: "Vier-Augen: Sie haben die Änderung selbst eingereicht", "data-testid": "frei" }]} />);
    expect(screen.getByTestId("frei")).toBeDisabled();
    expect(screen.getByText("Vier-Augen: Sie haben die Änderung selbst eingereicht")).toBeVisible();
  });
});

describe("HeaderActions menuTestId", () => {
  it("Menüknopf trägt die vorgegebene testid, sonst `${data-testid}-menu`", () => {
    const { unmount } = render(<HeaderActions helpers={HELFER} menu={MENU} data-testid="kopf" menuTestId="kopf-mehr" />);
    expect(screen.getByTestId("kopf-mehr")).toHaveAccessibleName("Weitere Aktionen");
    unmount();
    render(<HeaderActions helpers={HELFER} menu={MENU} data-testid="kopf" />);
    expect(screen.getByTestId("kopf-menu")).toBeInTheDocument();
  });
});

describe("HeaderActions im Kopf-Slot", () => {
  it("CSS: der Aktions-Slot von DetailHeader und ObjectPage wächst, wenn er die Leiste trägt (sonst misst sie nur ihren Inhalt)", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const css = readFileSync(resolve(process.cwd(), "src/primitives/header-actions.css"), "utf8");
    const regel = css.match(/\.prn-detailheader-actions:has\(> \.prn-hab\),\s*\.prn-objectpage-actions:has\(> \.prn-hab\) \{([^}]*)\}/);
    expect(regel?.[1]).toMatch(/flex:\s*1 1 auto/);
    expect(regel?.[1]).toMatch(/min-width:\s*0/);
  });
});

describe("berechneUeberlauf", () => {
  it("nimmt in der vorgegebenen Reihenfolge weg, bis es passt", () => {
    const b = { "a:x": 100, "a:y": 100, "a:p": 100, "h:h": 40 };
    const schluessel = ["a:x", "a:y", "a:p", "h:h"];
    expect([...berechneUeberlauf({ reihenfolge: ["a:x", "a:y", "h:h"], breiten: b, feste: 50, verfuegbar: 1000, schluessel })]).toEqual([]);
    expect([...berechneUeberlauf({ reihenfolge: ["a:x", "a:y", "h:h"], breiten: b, feste: 50, verfuegbar: 320, schluessel })]).toEqual(["a:x"]);
    expect([...berechneUeberlauf({ reihenfolge: ["a:x", "a:y", "h:h"], breiten: b, feste: 50, verfuegbar: 10, schluessel })]).toEqual(["a:x", "a:y", "h:h"]);
  });
});
