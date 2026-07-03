import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { loadBo4eSchema } from "./schema/load-schema";
import { CDocView } from "./CDocView";
import cdoc from "./__fixtures__/cdoc-example.json";
import fields from "./__fixtures__/bo4e-fields.json";
import enums from "./__fixtures__/bo4e-enums.json";
import bos from "./__fixtures__/bo4e-bos.json";
import type { CDoc } from "./types";

const schema = loadBo4eSchema({ fields, enums, bos });
const doc = cdoc as CDoc;
const now = new Date("2026-06-25T12:00:00Z");

describe("CDocView", () => {
  it("shows group tabs (label != boTyp) and an anomaly bar", () => {
    render(<CDocView doc={doc} schema={schema} now={now} />);
    expect(screen.getByRole("tab", { name: /marktlokation/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /energieliefervertrag/i })).toBeInTheDocument();
    expect(screen.getByText(/Auffälligkeiten erkannt/)).toBeInTheDocument();
  });

  it("ignoriert Auffälligkeiten in Zusatzdaten (keine Anomalie-Leiste)", () => {
    const d: CDoc = {
      id: "x",
      businessKey: "x",
      content: {
        OUTBOUND: {
          stammdaten: { MARKTLOKATION: [{ boTyp: "MARKTLOKATION", marktlokationsId: "1" }] },
          zusatzdaten: { boTyp: "ZUSATZDATEN", intern: "#PLATZHALTER#" },
        },
      },
    };
    render(<CDocView doc={d} schema={schema} now={now} />);
    expect(screen.queryByText(/Auffälligkeiten erkannt/)).toBeNull();
  });

  it("zeigt Auffälligkeiten in Stammdaten weiter", () => {
    const d: CDoc = {
      id: "y",
      businessKey: "y",
      content: {
        OUTBOUND: {
          stammdaten: { MARKTLOKATION: [{ boTyp: "MARKTLOKATION", marktlokationsId: "#PLATZHALTER#" }] },
        },
      },
    };
    render(<CDocView doc={d} schema={schema} now={now} />);
    expect(screen.getByText(/Auffälligkeiten erkannt/)).toBeInTheDocument();
  });

  it("switches to the Energieliefervertrag tab", async () => {
    render(<CDocView doc={doc} schema={schema} now={now} />);
    await userEvent.click(screen.getByRole("tab", { name: /energieliefervertrag/i }));
    expect(screen.getByText("Vertragsart")).toBeInTheDocument();
  });

  it("defaults to Fachlich with the Bearbeiten switch disabled", () => {
    render(<CDocView doc={doc} schema={schema} now={now} />);
    expect(screen.getByRole("radio", { name: "Fachlich" })).toBeChecked();
    expect(screen.getByRole("switch", { name: /Bearbeiten/ })).toBeDisabled();
  });

  it("switching to Gefüllt enables the Bearbeiten switch", async () => {
    render(<CDocView doc={doc} schema={schema} now={now} />);
    await userEvent.click(screen.getByRole("radio", { name: "Gefüllt" }));
    expect(screen.getByRole("switch", { name: /Bearbeiten/ })).toBeEnabled();
  });
});
