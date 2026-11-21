import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
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

  it("misst neu, wenn ein Eintrag breiter wird (Schrift lädt nach): die Hilfsaktion wandert ins Menü statt über den Rand", async () => {
    const beobachtet: Element[] = [];
    let melden: (() => void) | null = null;
    vi.stubGlobal("ResizeObserver", class { constructor(cb: () => void) { melden = cb; } observe(e: Element) { beobachtet.push(e); } unobserve() {} disconnect() {} });
    const einzeln: HeaderAction[] = [{ id: "plan", label: "Transport planen", kind: "primary", onAction: leer, "data-testid": "plan" }];
    breite["a:plan"] = 150; breite["h:akt"] = 34;
    leiste = 150 + 8 + 17 + 34 + 8; // passt knapp
    render(<HeaderActions actions={einzeln} helpers={HELFER} />);
    expect(screen.getByTestId("akt")).toBeInTheDocument();
    expect(beobachtet.some((e) => (e as HTMLElement).dataset?.habKey === "a:plan"), "Einträge werden beobachtet").toBe(true);
    breite["a:plan"] = 170; // breitere Schrift: der Knopf wächst, die Leiste nicht
    await act(async () => { melden?.(); });
    expect(screen.queryByTestId("akt")).not.toBeInTheDocument();
    expect(screen.getByTestId("plan")).toBeInTheDocument();
    delete breite["a:plan"]; delete breite["h:akt"];
    vi.unstubAllGlobals();
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
    expect(regel?.[1]).toMatch(/flex:\s*1000 1 auto/);
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

  it("der Menüknopf zählt erst, wenn etwas ins Menü wandert (eine einzelne Aktion passt ohne Platz für „⋯“)", () => {
    const b = { "a:s": 90 };
    // 90 passt in 100 – mit fest gerechnetem Menüknopf (34) hätte „Sperren“ ins Menü gemusst (so in E: Benutzer, 1440 px)
    expect([...berechneUeberlauf({ reihenfolge: ["a:s"], breiten: b, feste: 0, menuBreite: 34, verfuegbar: 100, schluessel: ["a:s"] })]).toEqual([]);
    expect([...berechneUeberlauf({ reihenfolge: ["a:s"], breiten: b, feste: 0, menuBreite: 34, verfuegbar: 89, schluessel: ["a:s"] })]).toEqual(["a:s"]);
  });

  it("zählt n − 1 Lücken: zwei Einträge à 100 passen genau in 208, nicht erst in 216 (in E fehlte sonst „Aktualisieren“ in einer Spalte so breit wie ihr Inhalt)", () => {
    const b = { "a:x": 100, "a:p": 100 };
    expect([...berechneUeberlauf({ reihenfolge: ["a:x"], breiten: b, feste: 0, verfuegbar: 208, schluessel: ["a:x", "a:p"] })]).toEqual([]);
    expect([...berechneUeberlauf({ reihenfolge: ["a:x"], breiten: b, feste: 0, verfuegbar: 207, schluessel: ["a:x", "a:p"] })]).toEqual(["a:x"]);
    // Trenner (1 px samt Lücke davor) und Hilfsaktion 34: 100 + 8 + 100 + 9 + 34 + 8 = 259
    const c = { "a:x": 100, "a:p": 100, "h:h": 34 };
    expect([...berechneUeberlauf({ reihenfolge: ["a:x", "h:h"], breiten: c, feste: 9, verfuegbar: 259, schluessel: ["a:x", "a:p", "h:h"] })]).toEqual([]);
    // wandert etwas ins Menü, kommt der Menüknopf samt Lücke dazu: 100 + 9 + 34 + 8 + 34 + 8 = 193
    expect([...berechneUeberlauf({ reihenfolge: ["a:x", "h:h"], breiten: c, feste: 9, menuBreite: 34, verfuegbar: 258, schluessel: ["a:x", "a:p", "h:h"] })]).toEqual(["a:x"]);
  });
});
