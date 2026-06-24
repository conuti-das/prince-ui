import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FormBuilder } from "../../packages/forms/src/index";
import type { FormSchema } from "../../packages/forms/src/types";
import "../../packages/ui/src/composites/composites.css";

const meta = {
  title: "Components/FormBuilder",
  component: FormBuilder,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Nativer Drag&Drop-Form-Builder im prince-ui-Look: Palette, Canvas (Klick/Drag zum Hinzufügen, Drag zum Umordnen), Eigenschafts-Panel und Live-Vorschau über FormRenderer. Erzeugt form-js-kompatibles Schema. `mode=\"expert\"` mountet den @bpmn-io/form-js FormEditor als Fallback (dynamischer Import).",
      },
    },
  },
} satisfies Meta<typeof FormBuilder>;
export default meta;
type Story = StoryObj<typeof meta>;

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

export const Playground: Story = {
  render: () => {
    const [schema, setSchema] = useState<FormSchema>(startSchema);
    return (
      <div style={{ padding: 24 }}>
        <FormBuilder
          value={schema}
          onChange={setSchema}
          onSave={(s) => console.log("save", s)}
        />
      </div>
    );
  },
};

export const Leer: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <FormBuilder onSave={(s) => console.log("save", s)} />
    </div>
  ),
};
