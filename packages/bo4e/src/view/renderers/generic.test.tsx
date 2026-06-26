import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GenericBody } from "./generic";
import { loadBo4eSchema } from "../../schema/load-schema";
import fields from "../../__fixtures__/bo4e-fields.json";
import enums from "../../__fixtures__/bo4e-enums.json";
import bos from "../../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });

describe("GenericBody density", () => {
  it("fachlich shows compact scalars only", () => {
    render(
      <GenericBody schema={schema} boTyp="VERTRAG" obj={{ boTyp: "VERTRAG", sparte: "STROM" }} density="fachlich" />,
    );
    expect(screen.getByText("STROM")).toBeInTheDocument();
  });
  it("gefuellt surfaces a nested object that fachlich hid", () => {
    render(
      <GenericBody
        schema={schema}
        boTyp="GESCHAEFTSPARTNER"
        obj={{ boTyp: "GESCHAEFTSPARTNER", partneradresse: { ort: "Köln" } }}
        density="gefuellt"
      />,
    );
    expect(screen.getByText("Köln")).toBeInTheDocument();
  });
});
