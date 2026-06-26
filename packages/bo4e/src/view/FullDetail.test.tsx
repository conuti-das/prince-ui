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
  it("gefuellt read-only shows values as text", () => {
    render(
      <FullDetail
        schema={schema}
        boTyp="MARKTLOKATION"
        obj={{ boTyp: "MARKTLOKATION", marktlokationsId: "10037104444", sparte: "STROM" }}
        density="gefuellt"
        editable={false}
      />,
    );
    expect(screen.getByText("10037104444")).toBeInTheDocument();
  });

  it("alle read-only adds documented empty scalar ghosts", () => {
    render(
      <FullDetail
        schema={schema}
        boTyp="MARKTLOKATION"
        obj={{ boTyp: "MARKTLOKATION", marktlokationsId: "10037104444" }}
        density="alle"
        editable={false}
      />,
    );
    // 'sparte' is documented but absent → appears as a ghost label
    expect(screen.getByText("Sparte")).toBeInTheDocument();
  });

  it("editable renders an input for a string field", () => {
    render(
      <FullDetail
        schema={schema}
        boTyp="MARKTLOKATION"
        obj={{ boTyp: "MARKTLOKATION", marktlokationsId: "10037104444" }}
        density="gefuellt"
        editable
      />,
    );
    expect(screen.getByRole("textbox", { name: /Marktlokations-ID/ })).toHaveValue("10037104444");
  });
});
