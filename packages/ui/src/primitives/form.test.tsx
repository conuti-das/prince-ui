import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "./form";
import { TextField, Button } from "./forms";

describe("form primitives", () => {
  it("Form submits via a type=submit button", async () => {
    const onSubmit = vi.fn();
    const { getByRole } = render(
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <TextField label="Name" />
        <Button type="submit">Senden</Button>
      </Form>,
    );
    await userEvent.click(getByRole("button", { name: "Senden" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("Form renders a <form> element", () => {
    const { container } = render(
      <Form>
        <TextField label="Marktpartner" />
      </Form>,
    );
    expect(container.querySelector("form")).toBeInTheDocument();
  });

  it("Form surfaces server validationErrors on a named field", () => {
    const { getByText } = render(
      <Form validationErrors={{ email: "Bereits vergeben" }}>
        <TextField name="email" label="E-Mail" />
      </Form>,
    );
    expect(getByText("Bereits vergeben")).toBeInTheDocument();
  });
});
