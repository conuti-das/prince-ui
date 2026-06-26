import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarktlokationBody } from "./marktlokation";
import { loadBo4eSchema } from "../../schema/load-schema";
import fields from "../../__fixtures__/bo4e-fields.json";
import enums from "../../__fixtures__/bo4e-enums.json";
import bos from "../../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });

describe("MarktlokationBody (curated summary)", () => {
  it("renders the energierichtung badge", () => {
    render(
      <MarktlokationBody
        schema={schema}
        density="fachlich"
        editable={false}
        obj={{ boTyp: "MARKTLOKATION", energierichtung: "AUSSP" }}
      />,
    );
    expect(screen.getByText("Verbrauch")).toBeInTheDocument();
  });

  it("accepts higher densities without changing the curated summary", () => {
    render(
      <MarktlokationBody
        schema={schema}
        density="gefuellt"
        editable={false}
        obj={{ boTyp: "MARKTLOKATION", energierichtung: "AUSSP" }}
      />,
    );
    expect(screen.getByText("Verbrauch")).toBeInTheDocument();
  });
});
