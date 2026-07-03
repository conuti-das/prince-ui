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

  it("versteckt BoTyp und Versionsstruktur in fachlich", () => {
    render(
      <GenericBody
        schema={schema}
        boTyp="GESCHAEFTSPARTNER"
        obj={{ boTyp: "GESCHAEFTSPARTNER", versionStruktur: "1", name1: "Fisch" }}
        density="fachlich"
      />,
    );
    expect(screen.getByText("Fisch")).toBeInTheDocument();
    expect(screen.queryByText("BO-Typ")).toBeNull();
    expect(screen.queryByText("Versionsstruktur")).toBeNull();
  });

  it("zeigt BoTyp und Versionsstruktur in alle", () => {
    render(
      <GenericBody
        schema={schema}
        boTyp="GESCHAEFTSPARTNER"
        obj={{ boTyp: "GESCHAEFTSPARTNER", versionStruktur: "1", name1: "Fisch" }}
        density="alle"
      />,
    );
    expect(screen.getByText("Versionsstruktur")).toBeInTheDocument();
    expect(screen.getByText("BO-Typ")).toBeInTheDocument();
  });
});
