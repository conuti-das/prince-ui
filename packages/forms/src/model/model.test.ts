import { describe, it, expect } from "vitest";
import type { FormSchema, TaskFormField } from "../types";
import {
  taskFormToSchema,
  camundaTypeToFieldType,
  camundaSubmitType,
} from "./task-form";
import { formDataToCamundaVariables, camundaTypeOf } from "./camunda";
import { validateForm, validateField } from "./validation";
import { evalConditional, getPath, setPath } from "./conditional";
import { flattenFields, dataFields, isDataField } from "./schema";

describe("taskFormToSchema", () => {
  const fields: TaskFormField[] = [
    {
      id: "name",
      label: "Name",
      type: { name: "string" },
      validationConstraints: [
        { name: "required" },
        { name: "maxlength", configuration: "50" },
      ],
    },
    { id: "amount", label: "Betrag", type: { name: "long" } },
    { id: "active", type: { name: "boolean" }, defaultValue: true },
    { id: "due", type: { name: "date" } },
    {
      id: "prio",
      type: { name: "enum" },
      values: { low: "Niedrig", high: "Hoch" },
    },
  ];

  it("liefert ein form-js-kompatibles Schema", () => {
    const schema = taskFormToSchema(fields);
    expect(schema.type).toBe("default");
    expect(schema.components).toHaveLength(5);
    expect(schema.exporter?.name).toBe("@conuti-das/prince-ui-forms");
  });

  it("mappt Camunda-Typen auf FormFieldTypes", () => {
    const schema = taskFormToSchema(fields);
    expect(schema.components[0]!.type).toBe("textfield");
    expect(schema.components[1]!.type).toBe("number");
    expect(schema.components[2]!.type).toBe("checkbox");
    expect(schema.components[3]!.type).toBe("datetime");
    expect(schema.components[4]!.type).toBe("select");
  });

  it("übernimmt key, label, defaultValue", () => {
    const schema = taskFormToSchema(fields);
    expect(schema.components[0]!.key).toBe("name");
    expect(schema.components[0]!.label).toBe("Name");
    expect(schema.components[2]!.defaultValue).toBe(true);
  });

  it("mappt validationConstraints", () => {
    const schema = taskFormToSchema(fields);
    expect(schema.components[0]!.validate).toEqual({ required: true, maxLength: 50 });
  });

  it("mappt enum-values auf options", () => {
    const schema = taskFormToSchema(fields);
    expect(schema.components[4]!.values).toEqual([
      { value: "low", label: "Niedrig" },
      { value: "high", label: "Hoch" },
    ]);
  });

  it("merkt sich den Camunda-Submit-Typ", () => {
    const schema = taskFormToSchema(fields);
    expect(schema.components[1]!._camundaType).toBe("Integer");
    expect(schema.components[2]!._camundaType).toBe("Boolean");
    expect(schema.components[3]!._camundaType).toBe("Date");
  });

  it("akzeptiert String-Typ statt {name}", () => {
    expect(camundaTypeToFieldType({ id: "x", type: "boolean" })).toBe("checkbox");
  });

  it("ist robust gegen leere Eingabe", () => {
    expect(taskFormToSchema([]).components).toEqual([]);
  });

  it("camundaSubmitType deckt alle Fälle ab", () => {
    expect(camundaSubmitType("boolean")).toBe("Boolean");
    expect(camundaSubmitType("double")).toBe("Double");
    expect(camundaSubmitType("integer")).toBe("Integer");
    expect(camundaSubmitType("date")).toBe("Date");
    expect(camundaSubmitType("unknown")).toBe("String");
  });
});

describe("schema helpers", () => {
  const schema: FormSchema = {
    type: "default",
    components: [
      { type: "textfield", key: "a" },
      { type: "separator" },
      {
        type: "group",
        key: "grp",
        components: [
          { type: "number", key: "b" },
          { type: "text", text: "info" },
        ],
      },
    ],
  };

  it("flattenFields steigt in Gruppen ab", () => {
    expect(flattenFields(schema).map((f) => f.type)).toEqual([
      "textfield",
      "separator",
      "group",
      "number",
      "text",
    ]);
  });

  it("dataFields filtert präsentationelle Felder", () => {
    expect(dataFields(schema).map((f) => f.key)).toEqual(["a", "b"]);
  });

  it("isDataField erkennt präsentationelle Felder", () => {
    expect(isDataField({ type: "text" })).toBe(false);
    expect(isDataField({ type: "textfield" })).toBe(false); // ohne key
    expect(isDataField({ type: "textfield", key: "x" })).toBe(true);
  });
});

describe("getPath / setPath", () => {
  it("liest verschachtelte Pfade", () => {
    expect(getPath({ a: { b: { c: 5 } } }, "a.b.c")).toBe(5);
    expect(getPath({ a: 1 }, "x.y")).toBeUndefined();
    expect(getPath(null, "a")).toBeUndefined();
  });
  it("setzt verschachtelte Pfade mit Auto-Nesting", () => {
    const obj: Record<string, unknown> = {};
    setPath(obj, "a.b.c", 9);
    expect(obj).toEqual({ a: { b: { c: 9 } } });
  });
});

describe("evalConditional", () => {
  const data = { role: "admin", count: 5, flag: true, name: "" };

  it("leerer/fehlender Ausdruck → nicht verstecken", () => {
    expect(evalConditional(undefined, data)).toBe(false);
    expect(evalConditional("", data)).toBe(false);
  });
  it("Gleichheit (mit/ohne führendem =)", () => {
    expect(evalConditional('=role = "admin"', data)).toBe(true);
    expect(evalConditional('role == "user"', data)).toBe(false);
  });
  it("Ungleichheit", () => {
    expect(evalConditional('role != "user"', data)).toBe(true);
  });
  it("numerische Vergleiche", () => {
    expect(evalConditional("count > 3", data)).toBe(true);
    expect(evalConditional("count >= 5", data)).toBe(true);
    expect(evalConditional("count < 3", data)).toBe(false);
    expect(evalConditional("count <= 5", data)).toBe(true);
  });
  it("Booleans und Truthiness", () => {
    expect(evalConditional("flag", data)).toBe(true);
    expect(evalConditional("name", data)).toBe(false);
    expect(evalConditional("flag = true", data)).toBe(true);
  });
  it("Negation", () => {
    expect(evalConditional("not(flag)", data)).toBe(false);
    expect(evalConditional("!flag", data)).toBe(false);
    expect(evalConditional("not(name)", data)).toBe(true);
  });
  it("and / or", () => {
    expect(evalConditional('role = "admin" and count > 3', data)).toBe(true);
    expect(evalConditional('role = "user" and count > 3', data)).toBe(false);
    expect(evalConditional('role = "user" or count > 3', data)).toBe(true);
  });
  it("trennt or nicht innerhalb von Strings", () => {
    expect(evalConditional('name = "a or b"', { name: "a or b" })).toBe(true);
  });
  it("verschachtelte Pfade", () => {
    expect(evalConditional('user.role = "admin"', { user: { role: "admin" } })).toBe(true);
  });
  it("ist robust gegen Müll → false", () => {
    expect(evalConditional("(((", data)).toBe(false);
  });
});

describe("validateField", () => {
  it("required", () => {
    expect(validateField({ type: "textfield", validate: { required: true } }, "")).toHaveLength(1);
    expect(validateField({ type: "textfield", validate: { required: true } }, "x")).toHaveLength(0);
  });
  it("min/max", () => {
    expect(validateField({ type: "number", validate: { min: 10 } }, 5)).toHaveLength(1);
    expect(validateField({ type: "number", validate: { max: 10 } }, 20)).toHaveLength(1);
    expect(validateField({ type: "number", validate: { min: 1, max: 10 } }, 5)).toHaveLength(0);
  });
  it("minLength/maxLength", () => {
    expect(validateField({ type: "textfield", validate: { minLength: 3 } }, "ab")).toHaveLength(1);
    expect(validateField({ type: "textfield", validate: { maxLength: 3 } }, "abcd")).toHaveLength(1);
  });
  it("pattern", () => {
    const f = { type: "textfield" as const, validate: { pattern: "^[a-z]+$" } };
    expect(validateField(f, "ABC")).toHaveLength(1);
    expect(validateField(f, "abc")).toHaveLength(0);
  });
  it("leerer Wert ohne required → kein Fehler", () => {
    expect(validateField({ type: "textfield", validate: { minLength: 3 } }, "")).toHaveLength(0);
  });
  it("ungültiges Pattern blockiert nicht", () => {
    expect(validateField({ type: "textfield", validate: { pattern: "(" } }, "x")).toHaveLength(0);
  });
});

describe("validateForm", () => {
  const schema: FormSchema = {
    type: "default",
    components: [
      { type: "textfield", key: "name", validate: { required: true } },
      { type: "number", key: "age", validate: { min: 18 } },
      {
        type: "textfield",
        key: "reason",
        validate: { required: true },
        conditional: { hide: "age >= 18" },
      },
    ],
  };

  it("sammelt Fehler je Feld", () => {
    const errors = validateForm(schema, { name: "", age: 10 });
    expect(errors.name).toBeDefined();
    expect(errors.age).toBeDefined();
  });

  it("überspringt versteckte Felder", () => {
    const errors = validateForm(schema, { name: "x", age: 20 });
    // reason ist versteckt (age >= 18) → kein required-Fehler
    expect(errors.reason).toBeUndefined();
    expect(errors).toEqual({});
  });

  it("validiert sichtbare bedingte Felder", () => {
    const errors = validateForm(schema, { name: "x", age: 16 });
    expect(errors.reason).toBeDefined();
  });
});

describe("formDataToCamundaVariables", () => {
  it("heuristische Typen ohne Schema", () => {
    const vars = formDataToCamundaVariables({ a: "x", b: 3, c: 1.5, d: true });
    expect(vars).toEqual({
      a: { value: "x", type: "String" },
      b: { value: 3, type: "Integer" },
      c: { value: 1.5, type: "Double" },
      d: { value: true, type: "Boolean" },
    });
  });

  it("nutzt deklarierte Typen aus dem Schema", () => {
    const schema = taskFormToSchema([
      { id: "amount", type: { name: "long" } },
      { id: "active", type: { name: "boolean" } },
    ]);
    const vars = formDataToCamundaVariables({ amount: 7, active: false }, schema);
    expect(vars.amount).toEqual({ value: 7, type: "Integer" });
    expect(vars.active).toEqual({ value: false, type: "Boolean" });
  });

  it("überspringt versteckte Felder und undefined", () => {
    const schema: FormSchema = {
      type: "default",
      components: [
        { type: "textfield", key: "a" },
        { type: "textfield", key: "b", conditional: { hide: "a = \"hide\"" } },
        { type: "textfield", key: "c" },
      ],
    };
    const vars = formDataToCamundaVariables({ a: "hide", b: "secret" }, schema);
    expect(vars.b).toBeUndefined(); // versteckt
    expect(vars.c).toBeUndefined(); // undefined
    expect(vars.a).toEqual({ value: "hide", type: "String" });
  });

  it("camundaTypeOf-Heuristik", () => {
    expect(camundaTypeOf(true)).toBe("Boolean");
    expect(camundaTypeOf(3)).toBe("Integer");
    expect(camundaTypeOf(3.5)).toBe("Double");
    expect(camundaTypeOf("x")).toBe("String");
    expect(camundaTypeOf({ a: 1 })).toBe("Json");
    expect(camundaTypeOf(new Date())).toBe("Date");
  });
});
