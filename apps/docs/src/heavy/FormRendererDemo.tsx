import { useState } from "react";
import {
  FormRenderer,
  type FormSchema,
  type FormRendererSubmit,
} from "@conuti-das/prince-ui-forms";
import { Card, Notice } from "@conuti-das/prince-ui";

/* MaKo-Flavor-Demo: Klärfall-Formular (FormRenderer.stories.tsx „Klärfall"). */
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

export default function FormRendererDemo() {
  const [result, setResult] = useState<FormRendererSubmit | null>(null);
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 520 }}>
      <Card title="Klärfall bearbeiten">
        <FormRenderer
          schema={klaerfallSchema}
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
}
