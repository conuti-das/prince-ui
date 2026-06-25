import type { FieldDoc, EnumDoc } from "../types";
import { humanize } from "../core/humanize";

interface RawField {
  translation?: string;
  description?: string;
  example?: string;
  pattern?: string;
  enumRef?: string;
}
interface RawEnumValue {
  value: string;
}
interface RawEnum {
  description?: string;
  values: RawEnumValue[];
}
interface RawBo {
  description?: string;
  properties?: string[];
}

export interface Bo4eSchema {
  fields: Record<string, Record<string, RawField>>;
  enums: Record<string, RawEnum>;
  bos: Record<string, RawBo>;
}

export function loadBo4eSchema(src: { fields: unknown; enums: unknown; bos: unknown }): Bo4eSchema {
  return {
    fields: src.fields as Bo4eSchema["fields"],
    enums: src.enums as Bo4eSchema["enums"],
    bos: src.bos as Bo4eSchema["bos"],
  };
}

export function resolveField(schema: Bo4eSchema, boTyp: string, key: string): FieldDoc {
  const raw = schema.fields[boTyp]?.[key];
  let enumDoc: EnumDoc | undefined;
  const enumRef = raw?.enumRef;
  if (enumRef) {
    const e = schema.enums[enumRef];
    if (e) enumDoc = { description: e.description, values: e.values.map((v) => v.value) };
  }
  return {
    translation: raw?.translation ?? humanize(key),
    description: raw?.description,
    example: raw?.example,
    pattern: raw?.pattern,
    enumRef,
    enum: enumDoc,
    isRef: /Id$|Nr$|nummer$|referenz/i.test(key),
    isCom: false,
  };
}

export function getBoOrder(schema: Bo4eSchema): string[] {
  return Object.keys(schema.bos);
}

export function getFieldOrder(schema: Bo4eSchema, boTyp: string): string[] {
  return schema.bos[boTyp]?.properties ?? Object.keys(schema.fields[boTyp] ?? {});
}
