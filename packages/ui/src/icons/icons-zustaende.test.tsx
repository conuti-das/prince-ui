import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Icon, type IconName } from "./icons";

const NEU: IconName[] = ["info", "help", "x-circle", "ban", "octagon-alert", "hourglass", "pause", "play", "redo", "undo", "send", "message", "edit", "signature", "user-check",
  "headset", "wrench", "shield", "lock", "unlock", "download", "upload", "unlink", "compare", "folder", "filter", "copy", "external-link", "calendar", "activity"];

describe("Icons für Zustände, Aktionen und Bereiche", () => {
  it.each(NEU)("%s rendert Linien im 24er-Raster, dekorativ ohne title", (n) => {
    const { container } = render(<Icon name={n} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.querySelectorAll("path, circle, rect").length).toBeGreaterThan(0);
  });
});
