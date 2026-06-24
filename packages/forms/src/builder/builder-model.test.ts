import { describe, it, expect } from "vitest";
import {
  createField,
  emptySchema,
  insertField,
  removeFieldAt,
  moveField,
  updateFieldAt,
  hasOptions,
  isPresentational,
} from "./builder-model";

describe("builder-model", () => {
  it("emptySchema ist form-js-kompatibel", () => {
    const s = emptySchema();
    expect(s.type).toBe("default");
    expect(s.components).toEqual([]);
  });

  it("createField setzt key/label für Datenfelder", () => {
    const f = createField("textfield");
    expect(f.type).toBe("textfield");
    expect(f.key).toBeTruthy();
    expect(f.label).toBe("Textfeld");
    expect(f.id).toBe(f.key);
  });

  it("createField setzt Options für Auswahltypen", () => {
    expect(createField("select").values).toHaveLength(2);
    expect(createField("radio").values).toHaveLength(2);
    expect(createField("textfield").values).toBeUndefined();
  });

  it("createField für präsentationelle Felder ohne key", () => {
    expect(createField("separator").key).toBeUndefined();
    expect(createField("text").text).toBe("Statischer Text");
  });

  it("erzeugt eindeutige IDs", () => {
    const ids = new Set([createField("textfield").id, createField("textfield").id]);
    expect(ids.size).toBe(2);
  });

  it("insertField am Ende und an Position", () => {
    let s = emptySchema();
    const a = createField("textfield");
    const b = createField("number");
    s = insertField(s, a);
    s = insertField(s, b, 0);
    expect(s.components.map((f) => f.type)).toEqual(["number", "textfield"]);
  });

  it("insertField klemmt out-of-range index", () => {
    let s = emptySchema();
    s = insertField(s, createField("textfield"), 99);
    expect(s.components).toHaveLength(1);
  });

  it("removeFieldAt entfernt", () => {
    let s = insertField(insertField(emptySchema(), createField("textfield")), createField("number"));
    s = removeFieldAt(s, 0);
    expect(s.components).toHaveLength(1);
    expect(s.components[0]!.type).toBe("number");
  });

  it("moveField ordnet um", () => {
    let s = emptySchema();
    s = insertField(s, { ...createField("textfield"), id: "a" });
    s = insertField(s, { ...createField("number"), id: "b" });
    s = insertField(s, { ...createField("checkbox"), id: "c" });
    s = moveField(s, 0, 2);
    expect(s.components.map((f) => f.id)).toEqual(["b", "c", "a"]);
  });

  it("moveField ignoriert ungültige Quelle", () => {
    const s = insertField(emptySchema(), createField("textfield"));
    expect(moveField(s, 5, 0)).toBe(s);
  });

  it("updateFieldAt merged Patch", () => {
    let s = insertField(emptySchema(), createField("textfield"));
    s = updateFieldAt(s, 0, { label: "Neu", validate: { required: true } });
    expect(s.components[0]!.label).toBe("Neu");
    expect(s.components[0]!.validate).toEqual({ required: true });
  });

  it("Typ-Prädikate", () => {
    expect(isPresentational("separator")).toBe(true);
    expect(isPresentational("textfield")).toBe(false);
    expect(hasOptions("select")).toBe(true);
    expect(hasOptions("number")).toBe(false);
  });
});
