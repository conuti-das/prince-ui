/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DmnExpertEditor } from "./DmnExpertEditor";

const importXML = vi.fn().mockResolvedValue({ warnings: [] });
const saveXML = vi.fn().mockResolvedValue({ xml: "<definitions id='saved'/>" });
const destroy = vi.fn();
const on = vi.fn();
const ctor = vi.fn();

vi.mock("dmn-js/lib/Modeler", () => ({
  default: class FakeModeler {
    constructor(opts: unknown) {
      ctor(opts);
    }
    importXML = importXML;
    saveXML = saveXML;
    on = on;
    destroy = destroy;
  },
}));

const XML = "<definitions id='def1'/>";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DmnExpertEditor", () => {
  it("bootet den dmn-js-Modeler und importiert das XML", async () => {
    render(<DmnExpertEditor defaultValue={XML} propertiesPanel={false} />);
    await waitFor(() => expect(ctor).toHaveBeenCalled());
    await waitFor(() => expect(importXML).toHaveBeenCalledWith(XML));
    expect(screen.getByText(/Experten-Modus/)).toBeInTheDocument();
  });

  it("ruft onSave mit serialisiertem XML", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<DmnExpertEditor defaultValue={XML} onSave={onSave} propertiesPanel={false} />);
    await waitFor(() => expect(ctor).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByText("Speichern")).not.toBeDisabled(),
    );
    fireEvent.click(screen.getByText("Speichern"));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("<definitions id='saved'/>"));
  });

  it("ruft onSwitchToTable", async () => {
    const onSwitchToTable = vi.fn();
    render(
      <DmnExpertEditor defaultValue={XML} onSwitchToTable={onSwitchToTable} propertiesPanel={false} />,
    );
    await waitFor(() => expect(ctor).toHaveBeenCalled());
    fireEvent.click(screen.getByText("Tabelle"));
    expect(onSwitchToTable).toHaveBeenCalled();
  });

  it("registriert change-Listener, wenn onChange gesetzt ist", async () => {
    render(
      <DmnExpertEditor defaultValue={XML} onChange={() => {}} propertiesPanel={false} />,
    );
    await waitFor(() => expect(on).toHaveBeenCalled());
    const events = on.mock.calls.map((c) => c[0]);
    expect(events).toContain("commandStack.changed");
  });
});