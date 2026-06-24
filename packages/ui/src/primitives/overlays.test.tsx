import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./forms";
import { Modal, DialogTrigger, Menu, MenuItem, Popover, Tooltip } from "./overlays";

describe("overlays primitives", () => {
  it("Modal opens via DialogTrigger and shows its title", async () => {
    render(
      <DialogTrigger>
        <Button>Öffnen</Button>
        <Modal title="Widget konfigurieren">
          <p>Inhalt</p>
        </Modal>
      </DialogTrigger>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Öffnen" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Widget konfigurieren" })).toBeInTheDocument();
  });

  it("Menu opens and triggers a MenuItem action", async () => {
    const onAction = vi.fn();
    render(
      <Menu trigger={<Button>Menü</Button>}>
        <MenuItem id="edit" onAction={onAction}>
          Bearbeiten
        </MenuItem>
        <MenuItem id="del">Löschen</MenuItem>
      </Menu>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Menü" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Bearbeiten" }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("Popover renders content when opened via a trigger", async () => {
    render(
      <DialogTrigger>
        <Button>Mehr</Button>
        <Popover>
          <div>Popover-Inhalt</div>
        </Popover>
      </DialogTrigger>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Mehr" }));
    expect(screen.getByText("Popover-Inhalt")).toBeInTheDocument();
  });

  it("Tooltip shows its content on hover", async () => {
    render(
      <Tooltip trigger={<Button>Hover</Button>} delay={0}>
        EDIFACT-Rohdaten
      </Tooltip>,
    );
    await userEvent.hover(screen.getByRole("button", { name: "Hover" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("EDIFACT-Rohdaten");
  });
});