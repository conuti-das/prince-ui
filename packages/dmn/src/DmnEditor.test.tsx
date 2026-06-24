/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DmnEditor } from "./DmnEditor";

// dmn-js wird im Experten-Modus dynamisch geladen — hier mocken, damit der
// Switcher ohne echte Engine testbar bleibt.
vi.mock("dmn-js/lib/Modeler", () => {
  return {
    default: class FakeModeler {
      constructor() {}
      importXML() {
        return Promise.resolve({ warnings: [] });
      }
      saveXML() {
        return Promise.resolve({ xml: "<definitions/>" });
      }
      on() {}
      destroy() {}
    },
  };
});

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="def1" name="T" namespace="http://x">
  <decision id="dec1" name="D">
    <decisionTable id="dt1" hitPolicy="UNIQUE">
      <input id="i1" label="In"><inputExpression id="e1" typeRef="string"><text>a</text></inputExpression></input>
      <output id="o1" name="out" typeRef="string"/>
      <rule id="r0"><inputEntry id="ie0"><text>"x"</text></inputEntry><outputEntry id="oe0"><text>"y"</text></outputEntry></rule>
    </decisionTable>
  </decision>
</definitions>`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DmnEditor", () => {
  it("startet im Tabellen-Modus", async () => {
    render(<DmnEditor defaultValue={XML} />);
    await waitFor(() => expect(screen.getByText("In")).toBeInTheDocument());
    expect(screen.getByRole("radiogroup", { name: "Editor-Modus" })).toBeInTheDocument();
  });

  it("wechselt in den Experten-Modus und zurück", async () => {
    render(<DmnEditor defaultValue={XML} />);
    await waitFor(() => expect(screen.getByText("In")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("radio", { name: "Experte" }));
    await waitFor(() =>
      expect(screen.getByText(/Experten-Modus/)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("radio", { name: "Tabelle" }));
    await waitFor(() => expect(screen.getByText("In")).toBeInTheDocument());
  });

  it("respektiert den controlled mode", async () => {
    const onModeChange = vi.fn();
    render(<DmnEditor defaultValue={XML} mode="expert" onModeChange={onModeChange} />);
    await waitFor(() =>
      expect(screen.getByText(/Experten-Modus/)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("radio", { name: "Tabelle" }));
    expect(onModeChange).toHaveBeenCalledWith("table");
    // bleibt expert, weil controlled
    expect(screen.getByText(/Experten-Modus/)).toBeInTheDocument();
  });
});