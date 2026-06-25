import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./appshell";

describe("AppShell", () => {
  it("renders the title and the main content", () => {
    render(
      <AppShell title="MaCo" sidebar={<nav>Navi</nav>}>
        <p>Inhalt</p>
      </AppShell>,
    );
    expect(screen.getByText("MaCo")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Inhalt");
  });

  it("renders logo, search, actions and user slots", () => {
    render(
      <AppShell
        logo={<span>LOGO</span>}
        search={<input aria-label="Suche" />}
        actions={<button>Aktion</button>}
        user={<span>DU</span>}
        sidebar={<nav>Navi</nav>}
      >
        x
      </AppShell>,
    );
    expect(screen.getByText("LOGO")).toBeInTheDocument();
    expect(screen.getByLabelText("Suche")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aktion" })).toBeInTheDocument();
    expect(screen.getByText("DU")).toBeInTheDocument();
  });

  it("applies glass to the shell bar by default and can be turned off", () => {
    const { rerender } = render(
      <AppShell title="A" sidebar={<nav>N</nav>}>
        x
      </AppShell>,
    );
    expect(screen.getByRole("banner")).toHaveClass("prn-glass");
    rerender(
      <AppShell title="A" glass={false} sidebar={<nav>N</nav>}>
        x
      </AppShell>,
    );
    expect(screen.getByRole("banner")).not.toHaveClass("prn-glass");
  });

  it("toggles the sidebar (uncontrolled) and reflects aria-expanded", async () => {
    const user = userEvent.setup();
    render(
      <AppShell title="A" sidebar={<nav>Navi</nav>}>
        x
      </AppShell>,
    );
    const toggle = screen.getByRole("button", { name: /navigation/i });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("links the toggle to the sidebar via aria-controls", () => {
    render(
      <AppShell title="A" sidebar={<nav>Navi</nav>}>
        x
      </AppShell>,
    );
    const toggle = screen.getByRole("button", { name: /navigation/i });
    const controls = toggle.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls!)).toBeInTheDocument();
  });

  it("supports a controlled collapsed state via onSidebarCollapsedChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AppShell title="A" sidebarCollapsed={false} onSidebarCollapsedChange={onChange} sidebar={<nav>N</nav>}>
        x
      </AppShell>,
    );
    await user.click(screen.getByRole("button", { name: /navigation/i }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("omits the toggle when no sidebar is provided", () => {
    render(<AppShell title="A">x</AppShell>);
    expect(screen.queryByRole("button", { name: /navigation/i })).not.toBeInTheDocument();
  });
});
