import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilterState } from "./use-filter-state";

beforeEach(() => localStorage.clear());

describe("useFilterState", () => {
  it("starts from defaultValues and updates via setValue", () => {
    const { result } = renderHook(() =>
      useFilterState({ persistKey: "t1", defaultValues: { sparte: "", q: "" } }),
    );
    expect(result.current.values).toEqual({ sparte: "", q: "" });
    act(() => result.current.setValue("sparte", "Strom"));
    expect(result.current.values.sparte).toBe("Strom");
  });

  it("persists to localStorage and rehydrates a fresh hook", () => {
    const { result, unmount } = renderHook(() =>
      useFilterState({ persistKey: "t2", defaultValues: { q: "" } }),
    );
    act(() => result.current.setValue("q", "Müller"));
    unmount();
    const { result: r2 } = renderHook(() =>
      useFilterState({ persistKey: "t2", defaultValues: { q: "" } }),
    );
    expect(r2.current.values.q).toBe("Müller");
  });

  it("reset() clears storage and returns to defaults", () => {
    const { result } = renderHook(() =>
      useFilterState({ persistKey: "t3", defaultValues: { q: "" } }),
    );
    act(() => result.current.setValue("q", "x"));
    act(() => result.current.reset());
    expect(result.current.values.q).toBe("");
    expect(localStorage.getItem("apl:filterstate:t3")).toBeNull();
  });

  it("derives activeFilters from non-default values with labels", () => {
    const { result } = renderHook(() =>
      useFilterState({
        persistKey: "t4",
        defaultValues: { sparte: "", q: "" },
        labels: { sparte: "Sparte" },
      }),
    );
    act(() => result.current.setValue("sparte", "Gas"));
    expect(result.current.activeFilters).toEqual([
      { id: "sparte", label: "Sparte", value: "Gas" },
    ]);
  });

  it("falls back to defaults when stored JSON is corrupt", () => {
    localStorage.setItem("apl:filterstate:t5", "{not json");
    const { result } = renderHook(() =>
      useFilterState({ persistKey: "t5", defaultValues: { q: "ok" } }),
    );
    expect(result.current.values.q).toBe("ok");
  });
});
