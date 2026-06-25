import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { loadBo4eSchema } from "../schema/load-schema";
import { SchemaField } from "./SchemaField";
import fields from "../__fixtures__/bo4e-fields.json";
import enums from "../__fixtures__/bo4e-enums.json";
import bos from "../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });

describe("SchemaField", () => {
  it("opens a popover with description and enum values", async () => {
    render(
      <SchemaField schema={schema} boTyp="MARKTLOKATION" fieldKey="energierichtung" value="AUSSP">
        <span>AUSSP</span>
      </SchemaField>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText(/eingespeist|ausgespeist|entnommen/i)).toBeInTheDocument();
    expect(screen.getByText("EINSP")).toBeInTheDocument();
  });

  it("shows UTC + Berlin for date fields", async () => {
    render(
      <SchemaField schema={schema} boTyp="VERTRAG" fieldKey="vertragsende" value="2026-05-06T09:46:00Z">
        <span>x</span>
      </SchemaField>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText(/Übermittelt \(UTC\)/)).toBeInTheDocument();
    expect(screen.getByText(/2026-05-06T09:46:00Z/)).toBeInTheDocument();
  });
});
