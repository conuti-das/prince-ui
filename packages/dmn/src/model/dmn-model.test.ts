import { describe, it, expect } from "vitest";
import {
  parseDmnModel,
  serializeDmnModel,
  listDecisions,
  addRow,
  deleteRow,
  moveRow,
  updateCell,
  updateAnnotation,
  setHitPolicy,
  addColumn,
  updateColumn,
  deleteColumn,
  emptyRow,
  makeId,
} from "./dmn-model";
import type { DmnColumn, DmnRow, DmnTableModel } from "../types";

/* ---------------- Helpers (noUncheckedIndexedAccess-freundlich) ---------------- */

const col = (m: DmnTableModel, i: number): DmnColumn => {
  const c = m.columns[i];
  if (!c) throw new Error(`no column ${i}`);
  return c;
};
const row = (m: DmnTableModel, i: number): DmnRow => {
  const r = m.rows[i];
  if (!r) throw new Error(`no row ${i}`);
  return r;
};

/* ---------------- Fixtures ---------------- */

function singleDecisionXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             id="def1" name="Test" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="dec1" name="TestDecision">
    <decisionTable id="dt1" hitPolicy="UNIQUE">
      <input id="col_in1" label="Eingang">
        <inputExpression id="expr1" typeRef="string"><text>eingangParam</text></inputExpression>
        <inputValues id="iv1"><text>"Ja","Nein"</text></inputValues>
      </input>
      <output id="col_out1" label="Ausgang" name="ausgangParam" typeRef="string"/>
      <rule id="rule0">
        <inputEntry id="ie0"><text>"Ja"</text></inputEntry>
        <outputEntry id="oe0"><text>"OK"</text></outputEntry>
        <annotationEntry><text>Hinweis A</text></annotationEntry>
      </rule>
      <rule id="rule1">
        <inputEntry id="ie1"><text>"Nein"</text></inputEntry>
        <outputEntry id="oe1"><text>"NOK"</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>
</definitions>`;
}

function multiDecisionXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             id="defM" name="Multi" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="decA" name="DecisionA">
    <decisionTable id="dtA" hitPolicy="COLLECT" aggregation="SUM">
      <input id="a_in" label="A-In">
        <inputExpression id="a_expr" typeRef="number"><text>amount</text></inputExpression>
      </input>
      <output id="a_out" name="result" typeRef="number"/>
      <rule id="a_r0">
        <inputEntry id="a_ie0"><text>&gt;= 10</text></inputEntry>
        <outputEntry id="a_oe0"><text>1</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>
  <decision id="decB" name="DecisionB">
    <decisionTable id="dtB" hitPolicy="FIRST">
      <input id="b_in" label="B-In">
        <inputExpression id="b_expr" typeRef="string"><text>code</text></inputExpression>
      </input>
      <output id="b_out" name="label" typeRef="string"/>
      <rule id="b_r0">
        <inputEntry id="b_ie0"><text>"X"</text></inputEntry>
        <outputEntry id="b_oe0"><text>"first"</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>
</definitions>`;
}

/* ---------------- makeId ---------------- */

describe("makeId", () => {
  it("erzeugt eindeutige IDs mit Prefix", () => {
    const a = makeId("rule");
    const b = makeId("rule");
    expect(a).not.toBe(b);
    expect(a.startsWith("rule_")).toBe(true);
  });
});

/* ---------------- parseDmnModel ---------------- */

describe("parseDmnModel", () => {
  it("parst eine gültige Decision-Table", async () => {
    const model = await parseDmnModel(singleDecisionXml());
    expect(model.id).toBe("dec1");
    expect(model.name).toBe("TestDecision");
    expect(model.hitPolicy).toBe("UNIQUE");
    expect(model.columns).toHaveLength(2);

    const input = col(model, 0);
    const output = col(model, 1);
    expect(input.kind).toBe("input");
    expect(input.label).toBe("Eingang");
    expect(input.expression).toBe("eingangParam");
    expect(input.typeRef).toBe("string");
    expect(input.inputValues).toEqual(["Ja", "Nein"]);

    expect(output.kind).toBe("output");
    expect(output.expression).toBe("ausgangParam");

    expect(model.rows).toHaveLength(2);
    expect(row(model, 0).cells[input.id]).toBe('"Ja"');
    expect(row(model, 0).cells[output.id]).toBe('"OK"');
    expect(row(model, 0).annotation).toBe("Hinweis A");
    expect(row(model, 1).annotation).toBeUndefined();
  });

  it("liest COLLECT-Aggregation", async () => {
    const model = await parseDmnModel(multiDecisionXml(), { decisionId: "decA" });
    expect(model.hitPolicy).toBe("COLLECT");
    expect(model.aggregation).toBe("SUM");
  });

  it("wählt Decision per ID", async () => {
    const model = await parseDmnModel(multiDecisionXml(), { decisionId: "decB" });
    expect(model.id).toBe("decB");
    expect(model.hitPolicy).toBe("FIRST");
  });

  it("wählt Decision per Index", async () => {
    const model = await parseDmnModel(multiDecisionXml(), { decisionIndex: 1 });
    expect(model.id).toBe("decB");
  });

  it("wirft bei XML ohne Decision", async () => {
    await expect(parseDmnModel("<not>xml</not>")).rejects.toThrow();
  });

  it("wirft bei ungültigem XML", async () => {
    await expect(parseDmnModel("<<<")).rejects.toThrow(/DMN-Parsing/);
  });
});

describe("listDecisions", () => {
  it("listet alle Decisions mit Table", async () => {
    const refs = await listDecisions(multiDecisionXml());
    expect(refs).toEqual([
      { id: "decA", name: "DecisionA" },
      { id: "decB", name: "DecisionB" },
    ]);
  });
});

/* ---------------- Round-trip ---------------- */

describe("serializeDmnModel — Round-trip", () => {
  it("XML -> Modell -> XML -> Modell ist verlustfrei (Kerndaten)", async () => {
    const model1 = await parseDmnModel(singleDecisionXml());
    const xml = await serializeDmnModel(model1, singleDecisionXml());
    const model2 = await parseDmnModel(xml);

    expect(model2.id).toBe(model1.id);
    expect(model2.name).toBe(model1.name);
    expect(model2.hitPolicy).toBe(model1.hitPolicy);
    expect(model2.columns.map((c) => [c.kind, c.expression, c.typeRef])).toEqual(
      model1.columns.map((c) => [c.kind, c.expression, c.typeRef]),
    );
    expect(col(model2, 0).inputValues).toEqual(["Ja", "Nein"]);
    expect(model2.rows).toHaveLength(model1.rows.length);
    expect(row(model2, 0).annotation).toBe("Hinweis A");
  });

  it("erhält andere Decisions beim Schreiben einer Decision", async () => {
    const original = multiDecisionXml();
    const modelA = await parseDmnModel(original, { decisionId: "decA" });
    const modified = updateCell(modelA, row(modelA, 0).id, col(modelA, 1).id, "99");
    const xml = await serializeDmnModel(modified, original);

    // decB bleibt unberührt
    const refs = await listDecisions(xml);
    expect(refs.map((r) => r.id)).toEqual(["decA", "decB"]);
    const modelBAfter = await parseDmnModel(xml, { decisionId: "decB" });
    expect(modelBAfter.hitPolicy).toBe("FIRST");
    expect(row(modelBAfter, 0).cells[col(modelBAfter, 1).id]).toBe('"first"');

    const modelAAfter = await parseDmnModel(xml, { decisionId: "decA" });
    expect(row(modelAAfter, 0).cells[col(modelAAfter, 1).id]).toBe("99");
    expect(modelAAfter.aggregation).toBe("SUM");
  });

  it("serialisiert Spaltenänderungen (add/update/delete) verlustfrei", async () => {
    let model = await parseDmnModel(singleDecisionXml());
    model = addColumn(model, "input", { label: "Sparte", expression: "sparte" });
    const newColId = model.columns.find((c) => c.expression === "sparte")!.id;
    model = updateCell(model, row(model, 0).id, newColId, '"Strom"');
    model = deleteColumn(model, "col_out1");
    model = addColumn(model, "output", { label: "Code", expression: "code", typeRef: "number" });

    const xml = await serializeDmnModel(model, singleDecisionXml());
    const reparsed = await parseDmnModel(xml);

    const inputs = reparsed.columns.filter((c) => c.kind === "input");
    const outputs = reparsed.columns.filter((c) => c.kind === "output");
    expect(inputs.map((c) => c.expression)).toContain("sparte");
    expect(inputs).toHaveLength(2);
    expect(outputs).toHaveLength(1);
    expect(outputs[0]!.expression).toBe("code");
    expect(outputs[0]!.typeRef).toBe("number");

    const sparteCol = reparsed.columns.find((c) => c.expression === "sparte")!;
    expect(row(reparsed, 0).cells[sparteCol.id]).toBe('"Strom"');
  });

  it("schreibt Hit-Policy + Aggregation", async () => {
    let model = await parseDmnModel(singleDecisionXml());
    model = setHitPolicy(model, "COLLECT", "SUM");
    const xml = await serializeDmnModel(model, singleDecisionXml());
    const reparsed = await parseDmnModel(xml);
    expect(reparsed.hitPolicy).toBe("COLLECT");
    expect(reparsed.aggregation).toBe("SUM");
  });

  it("kann ohne originalXml ein neues Dokument erzeugen", async () => {
    const model: DmnTableModel = {
      id: "freshDecision",
      name: "Frisch",
      hitPolicy: "UNIQUE",
      columns: [
        { id: "in1", label: "A", expression: "a", kind: "input", typeRef: "string" },
        { id: "out1", label: "B", expression: "b", kind: "output", typeRef: "string" },
      ],
      rows: [{ id: "r1", cells: { in1: '"x"', out1: '"y"' } }],
    };
    const xml = await serializeDmnModel(model);
    expect(xml).toContain("freshDecision");
    const reparsed = await parseDmnModel(xml);
    expect(reparsed.name).toBe("Frisch");
    expect(row(reparsed, 0).cells[col(reparsed, 0).id]).toBe('"x"');
  });
});

/* ---------------- Reine Mutationen ---------------- */

describe("Modell-Mutationen", () => {
  let base: DmnTableModel;
  const setup = async () => {
    base = await parseDmnModel(singleDecisionXml());
  };

  it("emptyRow erzeugt Zellen für jede Spalte", async () => {
    await setup();
    const newRow = emptyRow(base);
    expect(Object.keys(newRow.cells).sort()).toEqual(
      base.columns.map((c) => c.id).sort(),
    );
  });

  it("addRow hängt an oder fügt an Position ein", async () => {
    await setup();
    const appended = addRow(base);
    expect(appended.rows).toHaveLength(base.rows.length + 1);
    const inserted = addRow(base, 0);
    expect(row(inserted, 0).id).not.toBe(row(base, 0).id);
  });

  it("deleteRow entfernt eine Zeile", async () => {
    await setup();
    const after = deleteRow(base, row(base, 0).id);
    expect(after.rows).toHaveLength(base.rows.length - 1);
  });

  it("moveRow verschiebt korrekt und ignoriert Grenzen", async () => {
    await setup();
    const id0 = row(base, 0).id;
    const down = moveRow(base, id0, 1);
    expect(row(down, 1).id).toBe(id0);
    expect(moveRow(base, id0, -1)).toBe(base); // schon ganz oben
    expect(moveRow(base, "unknown", 1)).toBe(base);
  });

  it("updateCell ändert nur die Zielzelle", async () => {
    await setup();
    const colId = col(base, 0).id;
    const after = updateCell(base, row(base, 0).id, colId, '"Nein"');
    expect(row(after, 0).cells[colId]).toBe('"Nein"');
    expect(row(after, 1).cells[colId]).toBe(row(base, 1).cells[colId]);
  });

  it("updateAnnotation setzt die Annotation", async () => {
    await setup();
    const after = updateAnnotation(base, row(base, 1).id, "Neue Notiz");
    expect(row(after, 1).annotation).toBe("Neue Notiz");
  });

  it("setHitPolicy entfernt Aggregation bei Nicht-COLLECT", async () => {
    await setup();
    const collect = setHitPolicy(base, "COLLECT", "MAX");
    expect(collect.aggregation).toBe("MAX");
    const unique = setHitPolicy(collect, "UNIQUE");
    expect(unique.aggregation).toBeUndefined();
  });

  it("addColumn fügt Input vor Outputs ein", async () => {
    await setup();
    const after = addColumn(base, "input");
    const kinds = after.columns.map((c) => c.kind);
    expect(kinds).toEqual(["input", "input", "output"]);
    expect(after.rows.every((r) => after.columns.every((c) => c.id in r.cells))).toBe(true);
  });

  it("updateColumn patcht Felder", async () => {
    await setup();
    const colId = col(base, 0).id;
    const after = updateColumn(base, colId, { label: "Umbenannt", typeRef: "boolean" });
    const patched = after.columns.find((c) => c.id === colId)!;
    expect(patched.label).toBe("Umbenannt");
    expect(patched.typeRef).toBe("boolean");
  });

  it("deleteColumn entfernt Spalte und Zellen", async () => {
    await setup();
    const colId = col(base, 0).id;
    const after = deleteColumn(base, colId);
    expect(after.columns.find((c) => c.id === colId)).toBeUndefined();
    expect(after.rows.every((r) => !(colId in r.cells))).toBe(true);
  });
});
