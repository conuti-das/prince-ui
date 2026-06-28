import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NestedValue } from "./NestedValue";
import { loadBo4eSchema } from "../schema/load-schema";
import fields from "../__fixtures__/bo4e-fields.json";
import enums from "../__fixtures__/bo4e-enums.json";
import bos from "../__fixtures__/bo4e-bos.json";
import structure from "../__fixtures__/bo4e-structure.json";
import type { Bo4eStructure } from "../types";

const schema = loadBo4eSchema({ fields, enums, bos });
const base = {
  schema,
  boTyp: "MARKTLOKATION",
  editable: false as const,
  path: [] as (string | number)[],
  depth: 0,
};

describe("NestedValue", () => {
  it("renders a scalar value", () => {
    render(<NestedValue {...base} fieldKey="sparte" value="STROM" density="gefuellt" />);
    expect(screen.getByText("STROM")).toBeInTheDocument();
  });

  it("prunes deep-empty values at density gefuellt", () => {
    const { container } = render(
      <NestedValue {...base} fieldKey="leer" value={{ a: null }} density="gefuellt" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows deep-empty as ghost at density alle", () => {
    render(<NestedValue {...base} fieldKey="leer" value={null} density="alle" />);
    expect(screen.getByText(/leer/i)).toBeInTheDocument();
  });

  it("renders a nested object as a disclosure block", () => {
    render(
      <NestedValue
        {...base}
        fieldKey="partneradresse"
        value={{ ort: "Köln", plz: "50667" }}
        density="gefuellt"
      />,
    );
    expect(screen.getByText("Köln")).toBeInTheDocument();
    expect(screen.getByText("50667")).toBeInTheDocument();
  });

  it("renders an object-array as repeated sub-cards", () => {
    render(
      <NestedValue
        {...base}
        fieldKey="marktlokationsTyp"
        value={[{ typ: "A" }, { typ: "B" }]}
        density="gefuellt"
      />,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("renders the deepest filled branch (~4 levels) at gefuellt within MAX_DEPTH", () => {
    const value = [{ zaehlwerke: [{ verwendungszwecke: [{ zweck: ["MESSUNG"] }] }] }];
    render(
      <NestedValue
        {...base}
        fieldKey="datenDerBeteiligtenMarktrolle"
        value={value}
        density="gefuellt"
        depth={0}
      />,
    );
    expect(screen.queryByText(/weitere Ebenen/)).not.toBeInTheDocument();
  });

  it("no create button for an empty array without a structure map", () => {
    render(<NestedValue {...base} fieldKey="zaehlwerke" value={[]} density="alle" editable onChange={() => {}} />);
    expect(screen.queryByText(/Eintrag hinzufügen/)).not.toBeInTheDocument();
  });

  it("offers add for an empty array when the structure map provides it", () => {
    const s = loadBo4eSchema({
      fields,
      enums,
      bos,
      structure: { MARKTLOKATION: { zaehlwerke: { kind: "array", ref: "ZAEHLWERK" } } },
    });
    render(
      <NestedValue
        {...base}
        schema={s}
        fieldKey="zaehlwerke"
        value={[]}
        density="alle"
        editable
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(/Eintrag hinzufügen/)).toBeInTheDocument();
  });

  it("the generated structure fixture drives create on real MALO fields", () => {
    const s = loadBo4eSchema({ fields, enums, bos, structure: structure as Bo4eStructure });
    // zaehlwerke is an array<ZAEHLWERK> per the generated structure map
    render(
      <NestedValue
        {...base}
        schema={s}
        fieldKey="zaehlwerke"
        value={[]}
        density="alle"
        editable
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(/Eintrag hinzufügen/)).toBeInTheDocument();
  });

  it("prefills a created scalar with the schema example", async () => {
    const user = userEvent.setup();
    let captured: { path: (string | number)[]; value: unknown } | undefined;
    // marktlokationsId has example "55555555555" in the field-dict
    render(
      <NestedValue
        {...base}
        fieldKey="marktlokationsId"
        value={null}
        density="alle"
        editable
        onChange={(path, value) => {
          captured = { path, value };
        }}
      />,
    );
    await user.click(screen.getByText(/anlegen/));
    expect(captured?.value).toBe("55555555555");
  });

  it("the generated structure fixture drives component create for empty objects", () => {
    const s = loadBo4eSchema({ fields, enums, bos, structure: structure as Bo4eStructure });
    // gueltigkeitszeitraum is an object<ZEITRAUM> per the generated structure map
    render(
      <NestedValue
        {...base}
        schema={s}
        fieldKey="gueltigkeitszeitraum"
        value={{}}
        density="alle"
        editable
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(/Komponente anlegen/)).toBeInTheDocument();
  });
});
