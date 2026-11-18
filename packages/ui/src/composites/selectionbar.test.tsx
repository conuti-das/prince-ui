import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectionBar } from "./selectionbar";

describe("SelectionBar", () => {
  it("ohne Auswahl nichts; mit reserveSpace bleibt der Platz", () => {
    const { container, rerender } = render(<SelectionBar count={0} actions={<button>Übernehmen</button>} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<SelectionBar count={0} reserveSpace actions={<button>Übernehmen</button>} />);
    expect(container.querySelector(".prn-selectionbar-space")).not.toBeNull();
    expect(screen.queryByRole("toolbar")).toBeNull();
  });

  it("zeigt Zahl, Hinweis, Aktionen und hebt die Auswahl auf", async () => {
    const onClear = vi.fn();
    render(<SelectionBar count={3} countLabel="Ausgewählt: 3" info="Davon nicht wiederholbar: 1" actions={<button>Wiederholen</button>} onClear={onClear} clearTestId="aufheben" aria-label="Sammelaktionen für die gewählten Zeilen" data-testid="leiste" />);
    const leiste = screen.getByRole("toolbar", { name: "Sammelaktionen für die gewählten Zeilen" });
    expect(leiste).toHaveAttribute("data-testid", "leiste");
    expect(screen.getByText("Ausgewählt: 3")).toBeInTheDocument();
    expect(screen.getByText("Davon nicht wiederholbar: 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wiederholen" })).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("aufheben"));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("Fehler wird angesagt und blendet die Aktionen aus; Standardtexte", () => {
    render(<SelectionBar count={120} error="Höchstens 100 Zeilen." actions={<button>Erledigen</button>} onClear={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Höchstens 100 Zeilen.");
    expect(screen.queryByRole("button", { name: "Erledigen" })).toBeNull();
    expect(screen.getByText("120 ausgewählt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Auswahl aufheben" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "Sammelaktionen" })).toBeInTheDocument();
  });
});
