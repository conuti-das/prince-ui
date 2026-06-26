import { useState } from "react";
import { FormBuilder, type FormSchema } from "@conuti-das/prince-ui-forms";

const startSchema: FormSchema = {
  type: "default",
  components: [
    {
      id: "Field_malo",
      type: "textfield",
      key: "marktlokationsId",
      label: "Marktlokations-ID",
      validate: { required: true, pattern: "^[0-9]{11}$" },
    },
    {
      id: "Field_prio",
      type: "select",
      key: "pruefidentifikator",
      label: "Prüfidentifikator",
      values: [
        { value: "11001", label: "11001 – Anmeldung" },
        { value: "11002", label: "11002 – Abmeldung" },
      ],
    },
    { id: "Field_sep", type: "separator" },
    {
      id: "Field_esk",
      type: "checkbox",
      key: "eskalation",
      label: "An Fachbereich eskalieren",
    },
  ],
};

/**
 * Nativer Drag&Drop-Form-Builder im prince-ui-Look (controlled) — entspricht
 * der Story „Playground".
 */
export default function FormBuilderDemo() {
  const [schema, setSchema] = useState<FormSchema>(startSchema);
  return (
    <div style={{ minHeight: 520 }}>
      <FormBuilder
        value={schema}
        onChange={setSchema}
        onSave={(s) => console.log("[FormBuilder] save", s)}
      />
    </div>
  );
}
