import { describe, it, expect } from "vitest";
import { buildLintConfig, DEFAULT_LINT_RULES } from "./lintConfig";

describe("buildLintConfig", () => {
  const ruleModules = {
    "bpmnlint/label-required": { check: () => {} },
    "bpmnlint/no-disconnected": { check: () => {} },
  };

  it("uses the default rules when none are passed", () => {
    const cfg = buildLintConfig(ruleModules);
    expect(cfg.config.rules).toEqual(DEFAULT_LINT_RULES);
  });

  it("resolves registered rule modules", () => {
    const cfg = buildLintConfig(ruleModules);
    expect(cfg.resolver.resolveRule("bpmnlint", "label-required")).toBe(
      ruleModules["bpmnlint/label-required"],
    );
  });

  it("throws for unknown rules and configs", () => {
    const cfg = buildLintConfig(ruleModules);
    expect(() => cfg.resolver.resolveRule("bpmnlint", "nope")).toThrow();
    expect(() => cfg.resolver.resolveConfig("bpmnlint", "recommended")).toThrow();
  });

  it("honors a custom rule config", () => {
    const cfg = buildLintConfig(ruleModules, { "bpmnlint/label-required": "warn" });
    expect(cfg.config.rules["bpmnlint/label-required"]).toBe("warn");
  });
});
