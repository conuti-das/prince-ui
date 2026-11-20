import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DecisionDialog, type DecisionOption } from "./decision-dialog";
import { Select, SelectItem } from "./forms";
import { Link } from "./breadcrumbs";

const OPTIONEN: DecisionOption[] = [
  { id: "lesen", label: "Daten neu lesen", hint: "Der Prozess liest die Stammdaten erneut und läuft weiter." },
  { id: "ignorieren", label: "Abweichung ignorieren", hint: "Der Prozess läuft mit den vorhandenen Daten weiter." },
];

function Dialog(p: Partial<Parameters<typeof DecisionDialog>[0]> = {}) {
  return <DecisionDialog isOpen title="Klärfall bearbeiten" tone="critical" notice="Die Antwort des Netzbetreibers passt nicht zur Anmeldung."
    question="Wie soll der Prozess weitergehen?" options={OPTIONEN} confirmLabel="Entscheidung senden" onConfirm={() => {}}
    links={[{ label: "Zum Klärfall", href: "#/klaerfall/1", "data-testid": "zum-klaerfall" }, { label: "Zum Vorgang", href: "#/vorgang/1" }]}
    selectTestId="wahl" reasonTestId="grund" confirmTestId="ok" cancelTestId="abbrechen" {...p} />;
}

describe("DecisionDialog (Bearbeiten im Pop-up)", () => {
  it("Aufbau: Titel, Hinweis, eine Frage als Auswahlliste, Begründung freiwillig, Links mit „›“, Abbrechen und eine primäre Aktion", () => {
    render(<Dialog />);
    const d = screen.getByRole("dialog", { name: /Klärfall bearbeiten/ });
    expect(within(d).getByRole("note")).toHaveTextContent("Die Antwort des Netzbetreibers");
    expect(within(d).getByRole("button", { name: /Wie soll der Prozess weitergehen\?/ })).toBeInTheDocument();
    expect(within(d).getByRole("textbox", { name: "Begründung (freiwillig)" })).not.toBeRequired();
    const nav = within(d).getByRole("navigation", { name: "Springen" });
    expect(within(nav).getByRole("link", { name: "Zum Klärfall" })).toHaveAttribute("href", "#/klaerfall/1");
    expect(within(nav).getByTestId("zum-klaerfall")).toHaveTextContent("Zum Klärfall›");
    expect(within(d).getByTestId("abbrechen")).toHaveAttribute("data-variant", "plain");
    expect(within(d).getByTestId("ok")).toHaveAttribute("data-variant", "filled");
    expect(d.querySelectorAll("[data-variant=filled]")).toHaveLength(1);
  });

  it("die primäre Aktion geht erst mit gewählter Antwort; die Liste zeigt den Hinweis je Option, das Feld den der gewählten", async () => {
    const onConfirm = vi.fn();
    render(<Dialog onConfirm={onConfirm} />);
    expect(screen.getByTestId("ok")).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /Wie soll der Prozess weitergehen\?/ }));
    const liste = await screen.findByRole("listbox");
    const opt = within(liste).getByRole("option", { name: /Abweichung ignorieren/ });
    expect(opt).toHaveAccessibleDescription("Der Prozess läuft mit den vorhandenen Daten weiter.");
    await userEvent.click(opt);
    expect(screen.getByText("Der Prozess läuft mit den vorhandenen Daten weiter.")).toBeVisible();
    expect(screen.getByTestId("ok")).toBeEnabled();
    await userEvent.type(screen.getByRole("textbox", { name: "Begründung (freiwillig)" }), "  Daten sind korrekt  ");
    await userEvent.click(screen.getByTestId("ok"));
    expect(onConfirm).toHaveBeenCalledWith({ option: "ignorieren", reason: "Daten sind korrekt" });
  });

  it("wartet auf ein Promise (Knöpfe gesperrt) und bleibt bei einem Fehler offen", async () => {
    let ablehnen: (e: Error) => void = () => {};
    const onOpenChange = vi.fn();
    const { rerender } = render(<Dialog defaultOption="lesen" onOpenChange={onOpenChange} onConfirm={() => new Promise((_, r) => { ablehnen = r; })} />);
    await userEvent.click(screen.getByTestId("ok"));
    expect(screen.getByTestId("ok")).toBeDisabled();
    expect(screen.getByTestId("abbrechen")).toBeDisabled();
    ablehnen(new Error("409"));
    rerender(<Dialog defaultOption="lesen" onOpenChange={onOpenChange} errorMessage="Der Klärfall wurde inzwischen bearbeitet." onConfirm={() => new Promise(() => {})} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("inzwischen bearbeitet");
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("Begründung als Pflicht (offene Regel, abschaltbar): mindestens 5 Zeichen", async () => {
    render(<Dialog defaultOption="lesen" reasonRequired reasonLabel="Begründung" />);
    expect(screen.getByTestId("ok")).toBeDisabled();
    await userEvent.type(screen.getByRole("textbox", { name: "Begründung" }), "Okay!");
    expect(screen.getByTestId("ok")).toBeEnabled();
  });
});

describe("Select mit Hinweis und Fehler, Link mit Pfeil", () => {
  it("das Feld zeigt die gewählte Antwort; eine Vorauswahl (defaultOption) steht sofort im Feld", async () => {
    const { unmount } = render(<Dialog />);
    const feld = screen.getByRole("button", { name: /Wie soll der Prozess weitergehen\?/ });
    expect(feld).toHaveTextContent("Bitte wählen");
    await userEvent.click(feld);
    await userEvent.click(screen.getByRole("option", { name: /Abweichung ignorieren/ }));
    expect(screen.getByRole("button", { name: /Wie soll der Prozess weitergehen\?/ })).toHaveTextContent("Abweichung ignorieren");
    unmount();
    render(<Dialog defaultOption="lesen" />);
    expect(screen.getByRole("button", { name: /Wie soll der Prozess weitergehen\?/ })).toHaveTextContent("Daten neu lesen");
  });

  it("Select: Hinweis und Fehlertext unter dem Feld", () => {
    render(<Select label="Status" description="Wirkt sofort" errorMessage="Bitte wählen" isInvalid><SelectItem id="a">A</SelectItem></Select>);
    expect(screen.getByText("Wirkt sofort")).toBeInTheDocument();
    expect(screen.getByText("Bitte wählen")).toBeInTheDocument();
  });

  it("Link arrow: „›“ ist dekorativ, der Name bleibt der Text", () => {
    render(<Link href="#/vorgang/1" arrow>Vorgang öffnen</Link>);
    const l = screen.getByRole("link", { name: "Vorgang öffnen" });
    expect(l).toHaveAttribute("data-arrow");
    expect(l.querySelector(".prn-link-pfeil")).toHaveAttribute("aria-hidden", "true");
  });
});
