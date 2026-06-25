import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { loadBo4eSchema } from "../schema/load-schema";
import { FullDetail } from "./FullDetail";
import fields from "../__fixtures__/bo4e-fields.json";
import enums from "../__fixtures__/bo4e-enums.json";
import bos from "../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });

describe("FullDetail", () => {
  it("read-only shows values as text", () => {
    render(<FullDetail schema={schema} boTyp="MARKTLOKATION" obj={{ marktlokationsId: "10037104444", sparte: "STROM" }} />);
    expect(screen.getByText("10037104444")).toBeInTheDocument();
  });

  it("editable renders an input for a string field plus an add-field control", () => {
    render(<FullDetail schema={schema} boTyp="MARKTLOKATION" obj={{ marktlokationsId: "10037104444" }} editable />);
    expect(screen.getByRole("textbox", { name: /Marktlokations-ID/ })).toHaveValue("10037104444");
    expect(screen.getByRole("button", { name: /Feld hinzufügen/ })).toBeInTheDocument();
  });
});
