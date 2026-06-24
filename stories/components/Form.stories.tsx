import type { Meta, StoryObj } from "@storybook/react";
import { Form, TextField, Button } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";
import "../../packages/ui/src/primitives/form.css";

const meta = {
  title: "Components/Form",
  component: Form,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Form-Layout auf Basis von react-aria-components `Form`; bündelt Felder, native Validierung und Server-Fehler via `FieldError`. Über `validationErrors` werden serverseitige Fehler den Feldern (per `name`) zugeordnet und automatisch im jeweiligen `FieldError` angezeigt.",
      },
    },
  },
  argTypes: {},
} satisfies Meta<typeof Form>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Form>
      <TextField name="marktpartner" label="Marktpartner" isRequired placeholder="z. B. 9900123000007" />
      <TextField name="email" label="E-Mail" type="email" placeholder="name@example.com" />
      <Button type="submit">Speichern</Button>
    </Form>
  ),
};

export const WithValidationErrors: Story = {
  render: () => (
    <Form validationErrors={{ email: "Bereits vergeben" }}>
      <TextField name="marktpartner" label="Marktpartner" placeholder="z. B. 9900123000007" />
      <TextField name="email" label="E-Mail" type="email" placeholder="name@example.com" />
      <Button type="submit">Speichern</Button>
    </Form>
  ),
};
