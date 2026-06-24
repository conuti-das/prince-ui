import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  FormRenderer,
  taskFormToSchema,
  type FormRendererSubmit,
} from "../../packages/forms/src/index";
import type { FormSchema, TaskFormField } from "../../packages/forms/src/types";
import { Card, Notice } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";

const meta = {
  title: "Components/FormRenderer",
  component: FormRenderer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Schema-getriebener Formular-Renderer (form-js-kompatibles Schema) auf prince-ui-Feld-Primitives. Validierung, bedingte Sichtbarkeit, read-only und Camunda-Submit-Format inklusive.",
      },
    },
  },
} satisfies Meta<typeof FormRenderer>;
export default meta;
type Story = StoryObj<typeof meta>;

/* MaKo-Flavor-Demo: Klärfall-Formular. */
const klaerfallSchema: FormSchema = {
  type: "default",
  components: [
    {
      type: "text",
      text: "Bitte prüfen Sie den Klärfall zur Marktkommunikation und tragen Sie das Ergebnis ein.",
    },
    {
      type: "textfield",
      key: "marktlokationsId",
      label: "Marktlokations-ID",
      description: "11-stellige MaLo-ID",
      validate: { required: true, pattern: "^[0-9]{11}$" },
    },
    {
      type: "select",
      key: "pruefidentifikator",
      label: "Prüfidentifikator",
      validate: { required: true },
      values: [
        { value: "11001", label: "11001 – Anmeldung" },
        { value: "11002", label: "11002 – Abmeldung" },
        { value: "11016", label: "11016 – Stammdatenänderung" },
      ],
    },
    {
      type: "radio",
      key: "entscheidung",
      label: "Entscheidung",
      validate: { required: true },
      values: [
        { value: "accept", label: "Akzeptieren" },
        { value: "reject", label: "Ablehnen" },
        { value: "clarify", label: "Rückfrage stellen" },
      ],
    },
    {
      type: "textarea",
      key: "begruendung",
      label: "Begründung",
      description: "Pflicht bei Ablehnung",
      conditional: { hide: 'entscheidung != "reject"' },
      validate: { required: true, maxLength: 500 },
    },
    {
      type: "number",
      key: "fristTage",
      label: "Bearbeitungsfrist (Tage)",
      defaultValue: 14,
      validate: { min: 1, max: 90 },
    },
    {
      type: "datetime",
      key: "faelligAm",
      label: "Fällig am",
    },
    { type: "separator" },
    {
      type: "checkbox",
      key: "eskalation",
      label: "An Fachbereich eskalieren",
    },
  ],
};

export const Klaerfall: Story = {
  args: { schema: klaerfallSchema },
  render: (args) => {
    const [result, setResult] = useState<FormRendererSubmit | null>(null);
    return (
      <div style={{ display: "grid", gap: 24, maxWidth: 520 }}>
        <Card title="Klärfall bearbeiten">
          <FormRenderer
            {...args}
            onSubmit={(r) => setResult(r)}
            submitLabel="Klärfall abschließen"
          />
        </Card>
        {result && (
          <Notice
            tone={Object.keys(result.errors).length ? "negative" : "positive"}
            title={
              Object.keys(result.errors).length
                ? "Validierungsfehler"
                : "Submit (Camunda-Variablen)"
            }
          >
            <pre style={{ margin: 0, fontSize: 12, whiteSpace: "pre-wrap" }}>
              {JSON.stringify(
                Object.keys(result.errors).length ? result.errors : result.variables,
                null,
                2,
              )}
            </pre>
          </Notice>
        )}
      </div>
    );
  },
};

export const ReadOnly: Story = {
  args: {
    schema: klaerfallSchema,
    readOnly: true,
    data: {
      marktlokationsId: "12345678901",
      pruefidentifikator: "11016",
      entscheidung: "accept",
      fristTage: 14,
      faelligAm: "2026-07-01",
      eskalation: false,
    },
  },
  render: (args) => (
    <Card title="Klärfall (read-only)" style={{ maxWidth: 520 }}>
      <FormRenderer {...args} />
    </Card>
  ),
};

/* Camunda TaskFormField → Schema. */
const taskFields: TaskFormField[] = [
  { id: "kundenname", label: "Kundenname", type: { name: "string" }, validationConstraints: [{ name: "required" }] },
  { id: "betrag", label: "Betrag (EUR)", type: { name: "double" } },
  { id: "genehmigt", label: "Genehmigt", type: { name: "boolean" }, defaultValue: false },
  {
    id: "kategorie",
    label: "Kategorie",
    type: { name: "enum" },
    values: { strom: "Strom", gas: "Gas", wasser: "Wasser" },
  },
];

export const AusCamundaTaskForm: Story = {
  args: { schema: taskFormToSchema(taskFields) },
  render: (args) => (
    <Card title="Aus Camunda Task-Form generiert" style={{ maxWidth: 520 }}>
      <FormRenderer {...args} onSubmit={() => {}} />
    </Card>
  ),
};
