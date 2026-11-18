import "@testing-library/jest-dom/vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Disclosure, DisclosureGroup } from "./disclosure";

describe("disclosure primitives", () => {
  it("Disclosure renders its trigger label", () => {
    render(
      <Disclosure title="Details">
        <p>Inhalt</p>
      </Disclosure>,
    );
    expect(screen.getByRole("button", { name: "Details" })).toBeInTheDocument();
  });

  it("Disclosure expands on trigger click and fires onExpandedChange", async () => {
    const onExpandedChange = vi.fn();
    render(
      <Disclosure title="Mehr" onExpandedChange={onExpandedChange}>
        <p>Versteckter Text</p>
      </Disclosure>,
    );
    const trigger = screen.getByRole("button", { name: "Mehr" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("Disclosure honours defaultExpanded", () => {
    render(
      <Disclosure title="Offen" defaultExpanded>
        <p>Sichtbarer Text</p>
      </Disclosure>,
    );
    expect(screen.getByRole("button", { name: "Offen" })).toHaveAttribute("aria-expanded", "true");
  });

  it("DisclosureGroup allows multiple expanded sections", async () => {
    render(
      <DisclosureGroup allowsMultipleExpanded>
        <Disclosure id="a" title="Erste">
          <p>A</p>
        </Disclosure>
        <Disclosure id="b" title="Zweite">
          <p>B</p>
        </Disclosure>
      </DisclosureGroup>,
    );
    const first = screen.getByRole("button", { name: "Erste" });
    const second = screen.getByRole("button", { name: "Zweite" });
    await userEvent.click(first);
    await userEvent.click(second);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });

  it("the chevron rule of disclosure.css matches an expanded trigger", () => {
    const { container } = render(
      <Disclosure title="Offen" defaultExpanded>
        Inhalt
      </Disclosure>,
    );
    const css = readFileSync(resolve(process.cwd(), "src/primitives/disclosure.css"), "utf8");
    const rule = css.match(/^([^{}]*\.prn-disclosure-chevron)\s*\{[^}]*rotate/m)?.[1]?.trim();
    expect(rule).toBeTruthy();
    expect(container.querySelector(rule!)).not.toBeNull();
  });
});
