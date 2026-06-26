import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { loadBo4eSchema } from "../schema/load-schema";
import { SmartObjectView } from "./SmartObjectView";
import cdoc from "../__fixtures__/cdoc-example.json";
import fields from "../__fixtures__/bo4e-fields.json";
import enums from "../__fixtures__/bo4e-enums.json";
import bos from "../__fixtures__/bo4e-bos.json";
import type { Bo4eObject, CDoc } from "../types";

const schema = loadBo4eSchema({ fields, enums, bos });
const malo = (cdoc as CDoc).content.OUTBOUND!.stammdaten.MARKTLOKATION![0] as Bo4eObject;
const now = new Date("2026-06-25T12:00:00Z");

describe("SmartObjectView (Marktlokation)", () => {
  it("fachlich renders the curated identity + marktrollen, no detail grid", () => {
    render(<SmartObjectView schema={schema} obj={malo} density="fachlich" editable={false} now={now} />);
    expect(screen.getByText(/MaLo 10037104444/)).toBeInTheDocument();
    expect(screen.getByText(/Marktrollen ·/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Einklappen/ })).not.toBeInTheDocument();
  });

  it("gefuellt expands to the full detail grid", () => {
    render(<SmartObjectView schema={schema} obj={malo} density="gefuellt" editable={false} now={now} />);
    expect(screen.getByRole("button", { name: /Einklappen/ })).toBeInTheDocument();
    expect(screen.getAllByText("10037104444").length).toBeGreaterThan(0);
  });

  it("editable gefuellt shows input widgets", () => {
    render(<SmartObjectView schema={schema} obj={malo} density="gefuellt" editable now={now} />);
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
  });
});
